import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock, User, CheckSquare, Calendar, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type Site = Database['public']['Tables']['sites']['Row'] & {
  profiles: { full_name: string | null } | null;
  checklists: { title: string } | null;
};

export default function StaffSites() {
  // Fetch all sites that staff can visit
  const { data: sites, isLoading } = useQuery({
    queryKey: ['staff-sites'],
    queryFn: async () => {
      // Use the same approach as admin Sites.tsx (which works)
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('visit_day', { ascending: true })
        .order('visit_time', { ascending: true });

      if (error) throw error;

      // Get checklist data separately for each site
      const sitesWithChecklists = await Promise.all(
        data.map(async (site) => {
          if (site.checklist_id) {
            const { data: checklistData } = await supabase
              .from('checklists')
              .select('title')
              .eq('id', site.checklist_id)
              .single();
            
            return {
              ...site,
              checklists: checklistData
            };
          }
          return {
            ...site,
            checklists: null
          };
        })
      );

      return sitesWithChecklists as unknown as Site[];
    },
  });

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

  const formatVisitTime = (time: string) => {
    // Remove seconds if present (HH:MM:SS -> HH:MM)
    const timeWithoutSeconds = time.split(':').slice(0, 2).join(':');
    return new Date(`2000-01-01T${timeWithoutSeconds}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDayBadgeVariant = (day: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const dayMap: { [key: string]: string } = {
      monday: 'mon',
      tuesday: 'tue',
      wednesday: 'wed',
      thursday: 'thu',
      friday: 'fri',
      saturday: 'sat',
      sunday: 'sun'
    };
    
    const currentDay = dayMap[today] || today.slice(0, 3);
    return day === currentDay ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Building2 className="mr-3 h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Sites</h1>
            <p className="text-muted-foreground">Loading your assigned sites...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="mr-3 h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Sites</h1>
            <p className="text-muted-foreground">Sites you're scheduled to visit</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-sm">
            {sites?.length || 0} Sites
          </Badge>
          <Link to="/staff/visits/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Visit
            </Button>
          </Link>
        </div>
      </div>

      {sites && sites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{site.site_name}</CardTitle>
                  </div>
                  <Link to={`/staff/visits/new?site=${site.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
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
                    <Calendar className="h-4 w-4" />
                    Visit Day
                  </span>
                  <Badge variant={getDayBadgeVariant(site.visit_day) as "default" | "secondary"}>
                    {formatVisitDay(site.visit_day)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Visit Time
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatVisitTime(site.visit_time)}</div>
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

                <div className="pt-2 border-t">
                  <Link to={`/staff/visits/new?site=${site.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="mr-2 h-3 w-3" />
                      Create Visit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No sites assigned</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any sites assigned for visits yet. Contact your administrator if you think this is an error.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
