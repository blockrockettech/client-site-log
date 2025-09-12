import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Building2, Clock, User, MapPin, Edit } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Site = Database['public']['Tables']['sites']['Row'] & {
  profiles: { full_name: string | null } | null;
};

export default function AdminSites() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const queryClient = useQueryClient();

  // Fetch sites with profile data
  const { data: sites, isLoading } = useQuery({
    queryKey: ['admin-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          profiles!sites_profile_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Site[];
    },
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update site mutation
  const siteMutation = useMutation({
    mutationFn: async (siteData: any) => {
      if (editingSite) {
        const { error } = await supabase
          .from('sites')
          .update(siteData)
          .eq('id', editingSite.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sites')
          .insert([siteData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sites'] });
      setIsDialogOpen(false);
      setEditingSite(null);
      toast({
        title: editingSite ? 'Site updated' : 'Site created',
        description: `Site has been ${editingSite ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const siteData = {
      site_name: formData.get('site_name') as string,
      site_address: formData.get('site_address') as string,
      profile_id: formData.get('profile_id') as string,
      visit_day: formData.get('visit_day') as Database['public']['Enums']['visit_day_enum'],
      visit_time: formData.get('visit_time') as string,
    };

    siteMutation.mutate(siteData);
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setIsDialogOpen(true);
  };

  const formatVisitDay = (day: string) => {
    const days: { [key: string]: string } = {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    };
    return days[day] || day;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sites Management</h1>
          <p className="text-muted-foreground">Manage all facility sites and assignments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSite(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
              <DialogDescription>
                {editingSite ? 'Update site information' : 'Create a new facility site'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    defaultValue={editingSite?.site_name || ''}
                    placeholder="Enter site name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_id">Assigned Client</Label>
                  <Select name="profile_id" defaultValue={editingSite?.profile_id || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_address">Address</Label>
                <Input
                  id="site_address"
                  name="site_address"
                  defaultValue={editingSite?.site_address || ''}
                  placeholder="Enter site address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit_day">Visit Day</Label>
                  <Select name="visit_day" defaultValue={editingSite?.visit_day || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mon">Monday</SelectItem>
                      <SelectItem value="tue">Tuesday</SelectItem>
                      <SelectItem value="wed">Wednesday</SelectItem>
                      <SelectItem value="thu">Thursday</SelectItem>
                      <SelectItem value="fri">Friday</SelectItem>
                      <SelectItem value="sat">Saturday</SelectItem>
                      <SelectItem value="sun">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit_time">Visit Time</Label>
                  <Input
                    id="visit_time"
                    name="visit_time"
                    type="time"
                    defaultValue={editingSite?.visit_time || ''}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={siteMutation.isPending}>
                  {siteMutation.isPending ? 'Saving...' : (editingSite ? 'Update Site' : 'Create Site')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sites?.map((site) => (
          <Card key={site.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{site.site_name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(site)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {site.site_address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Client
                </span>
                <Badge variant="secondary">
                  {site.profiles?.full_name || 'Unassigned'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Schedule
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatVisitDay(site.visit_day)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(`2000-01-01T${site.visit_time}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sites?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No sites yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first facility site.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}