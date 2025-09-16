import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Users, Building2, Calendar } from 'lucide-react';

export default function DatabaseInspector() {
  // Check profiles (users/clients)
  const { data: profiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Map profile UUID -> friendly name for easy lookups across sections
  const profileNameById = useMemo(() => {
    const map = new Map<string, string>();
    profiles?.forEach((p: any) => {
      map.set(p.id, p.full_name || 'Unnamed');
    });
    return map;
  }, [profiles]);

  // Check sites and their assignments
  const { data: sites } = useQuery({
    queryKey: ['sites-with-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          profiles (
            full_name,
            role
          )
        `)
        .order('site_name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Check visits and their relationships
  const { data: visits } = useQuery({
    queryKey: ['visits-with-relationships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          profile_id,
          site_id,
          sites (
            site_name,
            profile_id
          ),
          profiles (
            full_name,
            role
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Summary statistics
  const { data: stats } = useQuery({
    queryKey: ['db-stats'],
    queryFn: async () => {
      const [profilesCount, sitesCount, visitsCount, unassignedSites] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('sites').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }),
        supabase.from('sites').select('id', { count: 'exact', head: true }).is('profile_id', null),
      ]);

      return {
        profiles: profilesCount.count || 0,
        sites: sitesCount.count || 0,
        visits: visitsCount.count || 0,
        unassignedSites: unassignedSites.count || 0,
      };
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Inspector</h1>
          <p className="text-muted-foreground">Current state of site-to-client relationships</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profiles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sites || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.visits || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Unassigned Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.unassignedSites || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Profiles
          </CardTitle>
          <CardDescription>All user profiles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {profiles && profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.full_name || 'Unnamed'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.role === 'admin' ? 'destructive' : profile.role === 'staff' ? 'default' : 'secondary'}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No profiles found</p>
          )}
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sites & Client Assignments
          </CardTitle>
          <CardDescription>Sites and their assigned clients</CardDescription>
        </CardHeader>
        <CardContent>
          {sites && sites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Assigned Client</TableHead>
                  <TableHead>Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.site_name}</TableCell>
                    <TableCell className="text-muted-foreground">{site.site_address}</TableCell>
                    <TableCell>
                      {site.profiles ? (
                        <Badge variant="default">{site.profiles.full_name}</Badge>
                      ) : (
                        <Badge variant="destructive">UNASSIGNED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.visit_day} {site.visit_time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No sites found</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Visits (Last 10)
          </CardTitle>
          <CardDescription>Visits and their site/client relationships</CardDescription>
        </CardHeader>
        <CardContent>
          {visits && visits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Site Owner</TableHead>
                  <TableHead>Staff Member</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{new Date(visit.visit_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{visit.sites?.site_name}</TableCell>
                    <TableCell>
                      {visit.sites?.profile_id ? (
                        <Badge variant="secondary">{profileNameById.get(visit.sites.profile_id) || 'Unknown'}</Badge>
                      ) : (
                        <Badge variant="destructive">No Owner</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{visit.profiles?.full_name || 'Unknown'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No visits found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
