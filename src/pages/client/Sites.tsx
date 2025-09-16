import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, Calendar, MapPin, CheckSquare } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Site = Database['public']['Tables']['sites']['Row'];

export default function ClientSites() {
  const { user } = useAuth();

  // Fetch user's sites
  const { data: sites, isLoading } = useQuery({
    queryKey: ['client-sites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('profile_id', user.id)
        .order('site_name', { ascending: true });

      if (error) throw error;
      return data as Site[];
    },
    enabled: !!user,
  });

  // Fetch recent visits for each site
  const { data: visitStats } = useQuery({
    queryKey: ['client-visit-stats', user?.id],
    queryFn: async () => {
      if (!user || !sites?.length) return {};
      
      const siteIds = sites.map(site => site.id);
      const { data, error } = await supabase
        .from('visits')
        .select('site_id, visit_date, visit_checkin_time')
        .in('site_id', siteIds)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      
      // Group by site_id and count visits properly
      const stats: { [key: number]: any } = {};
      data.forEach(visit => {
        if (!stats[visit.site_id]) {
          stats[visit.site_id] = {
            lastVisit: visit.visit_date,
            totalVisits: 1
          };
        } else {
          stats[visit.site_id].totalVisits += 1;
          // Keep the most recent visit date
          if (new Date(visit.visit_date) > new Date(stats[visit.site_id].lastVisit)) {
            stats[visit.site_id].lastVisit = visit.visit_date;
          }
        }
      });
      
      return stats;
    },
    enabled: !!sites?.length,
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

  const getNextVisitDate = (visitDay: string, visitTime: string) => {
    const today = new Date();
    const dayMap: { [key: string]: number } = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };
    
    const targetDay = dayMap[visitDay];
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
    const nextVisitDate = new Date(today);
    nextVisitDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    
    return nextVisitDate.toLocaleDateString();
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Sites</h1>
        <p className="text-muted-foreground">
          Monitor your facility sites and visit schedules
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites?.map((site) => {
          const stats = visitStats?.[site.id];
          
          return (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{site.site_name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Active
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {site.site_address}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-medium">Next Visit</div>
                    <div className="text-xs text-muted-foreground">
                      {getNextVisitDate(site.visit_day, site.visit_time)}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <CheckSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-sm font-medium">Total Visits</div>
                    <div className="text-xs text-muted-foreground">
                      {stats?.totalVisits || 0}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Schedule
                    </span>
                    <div className="text-right">
                      <div className="font-medium">{formatVisitDay(site.visit_day)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(`2000-01-01T${site.visit_time}`).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {stats?.lastVisit && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Visit</span>
                      <span className="text-muted-foreground">
                        {new Date(stats.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sites?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No sites assigned</h3>
            <p className="text-muted-foreground">
              Contact your administrator to have sites assigned to your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}