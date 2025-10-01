import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { fetchSitesWithRelations } from '@/lib/supabase-queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Plus, Building2, Clock, User, MapPin, Edit, CheckSquare } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { siteSchema, SiteFormData } from '@/lib/validations';

type Site = Database['public']['Tables']['sites']['Row'] & {
  profiles: { full_name: string | null } | null;
  checklists: { title: string } | null;
};

export default function AdminSites() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      site_name: '',
      site_address: '',
      profile_id: '',
      checklist_id: 'none',
      visit_day: 'mon',
      visit_time: '',
    },
  });

  // Fetch sites with profile and checklist data
  const { data: sites, isLoading, error } = useQuery({
    queryKey: ['admin-sites'],
    queryFn: async () => {
      const data = await fetchSitesWithRelations();
      return data as unknown as Site[];
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

  // Fetch checklists for assignment
  const { data: checklists } = useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update site mutation
  const siteMutation = useMutation({
    mutationFn: async (siteData: SiteFormData) => {
      const payload = {
        ...siteData,
        checklist_id: siteData.checklist_id && siteData.checklist_id !== 'none' 
          ? parseInt(siteData.checklist_id) 
          : null,
      };

      if (editingSite) {
        const { error } = await supabase
          .from('sites')
          .update(payload)
          .eq('id', editingSite.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sites')
          .insert([payload as Database['public']['Tables']['sites']['Insert']]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sites'] });
      setIsDialogOpen(false);
      setEditingSite(null);
      form.reset();
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

  const handleSubmit = (data: SiteFormData) => {
    siteMutation.mutate(data);
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    // Strip seconds from time for HTML time input (HH:MM:SS -> HH:MM)
    const timeWithoutSeconds = site.visit_time.split(':').slice(0, 2).join(':');
    
    form.reset({
      site_name: site.site_name,
      site_address: site.site_address,
      profile_id: site.profile_id,
      checklist_id: site.checklist_id ? site.checklist_id.toString() : 'none',
      visit_day: site.visit_day,
      visit_time: timeWithoutSeconds,
    });
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sites Management</h1>
            <p className="text-muted-foreground">Loading sites...</p>
          </div>
        </div>
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

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sites Management</h1>
            <p className="text-muted-foreground text-red-600">Error loading sites: {error.message}</p>
          </div>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to load sites</h3>
            <p className="text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
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
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSite(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSite(null);
              form.reset({
                site_name: '',
                site_address: '',
                profile_id: '',
                checklist_id: 'none',
                visit_day: 'mon',
                visit_time: '',
              });
              setIsDialogOpen(true);
            }}>
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="site_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter site name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profile_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Client</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name || user.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="checklist_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Checklist</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select checklist (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No checklist</SelectItem>
                          {checklists?.map((checklist) => (
                            <SelectItem key={checklist.id} value={checklist.id.toString()}>
                              {checklist.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="site_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter site address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visit_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Day</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visit_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visit Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
            </Form>
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
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </span>
                <Badge variant={site.checklists?.title ? "default" : "outline"}>
                  {site.checklists?.title || 'No checklist'}
                </Badge>
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