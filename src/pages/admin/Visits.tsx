import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Clock, CheckSquare, FileText, Eye, User, Building2, Filter } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Visit = Database['public']['Tables']['visits']['Row'] & {
  sites: {
    site_name: string;
    site_address: string;
    profile_id: string;
  } | null;
  checklists: {
    title: string;
  } | null;
  profiles: {
    full_name: string | null;
    role: string;
  } | null;
  site_owner: {
    full_name: string | null;
    role: string;
  } | null;
};

export default function AdminVisits() {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [searchSite, setSearchSite] = useState('');

  // Fetch all visits with complete relationship data
  const { data: visits, isLoading } = useQuery({
    queryKey: ['admin-all-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          sites (
            site_name,
            site_address,
            profile_id
          ),
          checklists (
            title
          ),
          profiles (
            full_name,
            role
          )
        `)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get site owner information for each visit
      const visitsWithOwners = await Promise.all(
        data.map(async (visit) => {
          let site_owner = null;
          if (visit.sites?.profile_id) {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', visit.sites.profile_id)
              .single();
            
            site_owner = ownerData;
          }

          return {
            ...visit,
            site_owner
          };
        })
      );

      return visitsWithOwners as Visit[];
    },
  });

  // Get unique staff members and clients for filters
  const { data: filterData } = useQuery({
    queryKey: ['admin-visits-filter-data'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['staff', 'client'])
        .order('full_name');

      if (error) throw error;

      const staff = profiles.filter(p => p.role === 'staff');
      const clients = profiles.filter(p => p.role === 'client');

      return { staff, clients };
    },
  });

  // Filter visits based on selected criteria
  const filteredVisits = visits?.filter(visit => {
    const staffMatch = filterStaff === 'all' || visit.profile_id === filterStaff;
    const clientMatch = filterClient === 'all' || visit.sites?.profile_id === filterClient;
    const siteMatch = searchSite === '' || 
      visit.sites?.site_name.toLowerCase().includes(searchSite.toLowerCase()) ||
      visit.sites?.site_address.toLowerCase().includes(searchSite.toLowerCase());

    return staffMatch && clientMatch && siteMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getCompletionBadge = (notes: string | null) => {
    if (!notes) return <Badge variant="outline">No data</Badge>;
    
    // Extract completion info from notes
    const summaryMatch = notes.match(/Completed: (\d+)\/(\d+) items/);
    if (summaryMatch) {
      const completed = parseInt(summaryMatch[1]);
      const total = parseInt(summaryMatch[2]);
      const percentage = Math.round((completed / total) * 100);
      
      if (percentage === 100) {
        return <Badge variant="default" className="bg-green-600">Complete ({completed}/{total})</Badge>;
      } else if (percentage >= 75) {
        return <Badge variant="default" className="bg-yellow-600">Mostly Done ({completed}/{total})</Badge>;
      } else if (percentage >= 25) {
        return <Badge variant="secondary">Partial ({completed}/{total})</Badge>;
      } else {
        return <Badge variant="outline">Started ({completed}/{total})</Badge>;
      }
    }
    
    return <Badge variant="secondary">Completed</Badge>;
  };

  const handleViewDetails = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDialogOpen(true);
  };

  const resetFilters = () => {
    setFilterStaff('all');
    setFilterClient('all');
    setSearchSite('');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="mr-3 h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Visits</h1>
              <p className="text-muted-foreground">Loading all system visits...</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="mr-3 h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Visits</h1>
            <p className="text-muted-foreground">Complete system visit history and reports</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="text-sm">
            {filteredVisits?.length || 0} / {visits?.length || 0} Visits
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff Member</label>
              <Select value={filterStaff} onValueChange={setFilterStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {filterData?.staff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name || 'Unnamed Staff'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Site Owner (Client)</label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {filterData?.clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name || 'Unnamed Client'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Sites</label>
              <Input
                placeholder="Site name or address..."
                value={searchSite}
                onChange={(e) => setSearchSite(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredVisits && filteredVisits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Site Owner</TableHead>
                  <TableHead>Checklist</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {visit.sites?.site_name || 'Unknown Site'}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {visit.sites?.site_address || 'No address'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(visit.visit_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="default">
                          {visit.profiles?.full_name || 'Unknown Staff'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">
                          {visit.site_owner?.full_name || 'Unassigned'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{visit.checklists?.title || 'No checklist'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCompletionBadge(visit.notes)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          In: {formatTime(visit.visit_checkin_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Out: {formatTime(visit.visit_checkout_time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(visit)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">
                {visits?.length === 0 ? 'No visits yet' : 'No visits match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {visits?.length === 0 
                  ? 'No visits have been recorded in the system yet.'
                  : 'Try adjusting your filters or clearing them to see more results.'
                }
              </p>
              {visits && visits.length > 0 && filteredVisits?.length === 0 && (
                <Button variant="outline" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Visit Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this site visit
            </DialogDescription>
          </DialogHeader>
          
          {selectedVisit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Site Information</h4>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedVisit.sites?.site_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedVisit.sites?.site_address}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Visit Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedVisit.visit_date)}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(selectedVisit.visit_checkin_time)} - {formatTime(selectedVisit.visit_checkout_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Staff Member</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="default">
                      {selectedVisit.profiles?.full_name || 'Unknown Staff'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Site Owner</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">
                      {selectedVisit.site_owner?.full_name || 'Unassigned'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Checklist & Completion</h4>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedVisit.checklists?.title || 'No checklist'}</span>
                  {getCompletionBadge(selectedVisit.notes)}
                </div>
              </div>

              {selectedVisit.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Visit Notes & Report</h4>
                  <ScrollArea className="h-40 w-full rounded-md border p-3">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {selectedVisit.notes}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
