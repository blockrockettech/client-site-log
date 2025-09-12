import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, CheckSquare, Users, ArrowRight, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile, user } = useAuth();

  // Fetch dashboard stats based on role
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id, profile?.role],
    queryFn: async () => {
      if (!user) return null;

      if (profile?.role === 'admin') {
        const [sitesData, visitsData, usersData, checklistsData] = await Promise.all([
          supabase.from('sites').select('id'),
          supabase.from('visits').select('id').gte('visit_date', new Date().toISOString().split('T')[0]),
          supabase.from('profiles').select('id'),
          supabase.from('checklists').select('id'),
        ]);

        return {
          sites: sitesData.data?.length || 0,
          todayVisits: visitsData.data?.length || 0,
          users: usersData.data?.length || 0,
          checklists: checklistsData.data?.length || 0,
        };
      }

      if (profile?.role === 'staff') {
        const [sitesData, visitsData] = await Promise.all([
          supabase.from('sites').select('id'),
          supabase.from('visits').select('id').eq('profile_id', user.id),
        ]);

        return {
          sites: sitesData.data?.length || 0,
          myVisits: visitsData.data?.length || 0,
        };
      }

      // Client role
      const [sitesData, visitsData] = await Promise.all([
        supabase.from('sites').select('id').eq('profile_id', user.id),
        supabase.from('visits').select('id').in('site_id', 
          (await supabase.from('sites').select('id').eq('profile_id', user.id)).data?.map(s => s.id) || []
        ),
      ]);

      return {
        mySites: sitesData.data?.length || 0,
        totalVisits: visitsData.data?.length || 0,
      };
    },
    enabled: !!user && !!profile,
  });

  const getDashboardContent = () => {
    if (profile?.role === 'admin') {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.sites || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayVisits || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checklists</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.checklists || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your facility operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/sites">
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Sites
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/admin/checklists">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Manage Checklists
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="secondary" className="bg-success/10 text-success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    if (profile?.role === 'staff') {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Sites</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.sites || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Visits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.myVisits || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Start your work day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to="/staff/visits/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    Add New Visit
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/staff/sites">
                    <Building2 className="mr-2 h-4 w-4" />
                    View Sites
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/staff/visits">
                    <Clock className="mr-2 h-4 w-4" />
                    Visit History
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your upcoming visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No visits scheduled for today</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    // Client role
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Sites</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.mySites || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisits || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Monitor your facilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link to="/client/sites">
                  <Building2 className="mr-2 h-4 w-4" />
                  View My Sites
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/client/visits">
                  <Calendar className="mr-2 h-4 w-4" />
                  Visit History
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your sites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your facilities today.
        </p>
      </div>

      {getDashboardContent()}
    </div>
  );
}