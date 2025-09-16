import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, CheckSquare, Building2, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Site = Database['public']['Tables']['sites']['Row'] & {
  profiles: { full_name: string | null } | null;
  checklists: { id: number; title: string; items: any[] } | null;
};

type Checklist = Database['public']['Tables']['checklists']['Row'];

export default function AddVisit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Pre-select site from URL parameter
  useEffect(() => {
    const siteParam = searchParams.get('site');
    if (siteParam) {
      setSelectedSiteId(siteParam);
    }
  }, [searchParams]);

  // Fetch sites with their assigned checklists
  const { data: sites, isLoading: sitesLoading, error: sitesError } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      // Try with explicit foreign key first
      let { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          profiles (
            full_name
          ),
          checklists (
            id,
            title,
            items
          )
        `)
        .order('site_name', { ascending: true });

      // If that fails, try without explicit foreign key constraint
      if (error && error.message.includes('foreign key')) {
        
        const result = await supabase
          .from('sites')
          .select(`
            *,
            profiles (
              full_name
            )
          `)
          .order('site_name', { ascending: true });

        if (result.error) {
          throw result.error;
        }

        // Get checklist data separately for each site
        const sitesWithChecklists = await Promise.all(
          result.data.map(async (site) => {
            if (site.checklist_id) {
              const { data: checklistData } = await supabase
                .from('checklists')
                .select('id, title, items')
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

        data = sitesWithChecklists as any;
        error = null;
      }

      if (error) {
        throw error;
      }
      
      return data as unknown as Site[];
    },
  });

  const selectedSite = sites?.find(site => site.id.toString() === selectedSiteId);
  const checklist = selectedSite?.checklists;

  // Update checklist items when selected site changes
  React.useEffect(() => {
    if (checklist?.items) {
      const items = Array.isArray(checklist.items) ? checklist.items : [];
      setChecklistItems(items.map((item: any, index: number) => ({
        id: item.id || `temp-${index}`,
        text: typeof item === 'string' ? item : item.text || `Item ${index + 1}`,
        completed: false,
        notes: ''
      })));
    } else {
      setChecklistItems([]);
    }
  }, [checklist]);

  // Create visit mutation
  const createVisitMutation = useMutation({
    mutationFn: async (visitData: any) => {
      const { error } = await supabase
        .from('visits')
        .insert([visitData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-visits'] });
      toast({
        title: 'Visit created successfully',
        description: 'Your visit has been logged and saved.',
      });
      navigate('/staff/visits');
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating visit',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    toast({
      title: 'Checked in successfully',
      description: `Checked in at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleChecklistItemChange = (itemId: number, field: string, value: any) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a visit.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSiteId) {
      toast({
        title: 'Error',
        description: 'Please select a site.',
        variant: 'destructive',
      });
      return;
    }

    if (!isCheckedIn) {
      toast({
        title: 'Error',
        description: 'Please check in before completing the visit.',
        variant: 'destructive',
      });
      return;
    }

    if (!checklist) {
      toast({
        title: 'Error',
        description: 'This site does not have a checklist assigned. Please contact an administrator.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const now = new Date();
    
    // Create visit notes with checklist summary
    const visitNotes = formData.get('notes') as string;
    const completedCount = checklistItems.filter(item => item.completed).length;
    const checklistSummary = `\n\n--- Checklist Summary ---\nChecklist: ${checklist.title}\nCompleted: ${completedCount}/${checklistItems.length} items\n\nCompleted Items:\n${checklistItems.filter(item => item.completed).map(item => `✓ ${item.text}${item.notes ? ` - ${item.notes}` : ''}`).join('\n')}\n\nIncomplete Items:\n${checklistItems.filter(item => !item.completed).map(item => `○ ${item.text}`).join('\n')}`;
    
    const visitData = {
      site_id: parseInt(selectedSiteId),
      profile_id: user.id,
      checklist_id: checklist.id,
      visit_date: formData.get('visit_date') as string,
      visit_checkin_time: now.toISOString(),
      visit_checkout_time: now.toISOString(),
      notes: visitNotes + checklistSummary
    };

    createVisitMutation.mutate(visitData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Plus className="mr-3 h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Visit</h1>
          <p className="text-muted-foreground">Record a new site visit and complete the checklist</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Site Selection
            </CardTitle>
            <CardDescription>Choose the site you're visiting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_id">Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId} required disabled={sitesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    sitesLoading 
                      ? "Loading sites..." 
                      : sitesError 
                        ? "Error loading sites" 
                        : sites?.length === 0
                          ? "No sites available"
                          : "Select a site"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.site_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sitesError && (
                <p className="text-sm text-destructive mt-1">
                  Error loading sites: {sitesError.message}
                </p>
              )}
            </div>

            {selectedSite && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Site Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedSite.site_address}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {selectedSite.visit_day} at {new Date(`2000-01-01T${selectedSite.visit_time}`).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm pt-2 border-t">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Checklist:</span>
                  {checklist ? (
                    <span className="text-success">{checklist.title} ({checklistItems.length} items)</span>
                  ) : (
                    <span className="text-destructive">No checklist assigned - Contact admin</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                name="visit_date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </CardContent>
        </Card>

        {selectedSite && (
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Check-in
              </div>
              {!isCheckedIn && (
                <Button type="button" onClick={handleCheckIn} variant="outline">
                  Check In
                </Button>
              )}
              {isCheckedIn && (
                <span className="text-sm text-success font-medium">
                  ✓ Checked in at {new Date().toLocaleTimeString()}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Check in to start your visit and begin the inspection
            </CardDescription>
          </CardHeader>
          </Card>
        )}

        {selectedSite && isCheckedIn && checklist && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                {checklist.title}
              </CardTitle>
              <CardDescription>
                Complete all inspection items ({checklistItems.filter(item => item.completed).length}/{checklistItems.length} completed)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        handleChecklistItemChange(item.id, 'completed', checked)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`item-${item.id}`} className="text-sm font-medium">
                        {item.text}
                      </Label>
                      <Textarea
                        placeholder="Add notes (optional)"
                        value={item.notes}
                        onChange={(e) => 
                          handleChecklistItemChange(item.id, 'notes', e.target.value)
                        }
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSite && isCheckedIn && !checklist && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <CheckSquare className="h-5 w-5" />
                No Checklist Available
              </CardTitle>
              <CardDescription>
                This site doesn't have a checklist assigned. You cannot complete a visit without a checklist.
                Please contact your administrator to assign a checklist to this site.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {selectedSite && (
          <Card>
            <CardHeader>
              <CardTitle>Visit Notes</CardTitle>
              <CardDescription>Add any additional observations or comments</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Enter your visit notes here..."
                rows={4}
              />
            </CardContent>
          </Card>
        )}

        {selectedSite && (
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createVisitMutation.isPending || !isCheckedIn || !checklist}
              className="min-w-32"
            >
              {createVisitMutation.isPending ? 'Saving...' : 'Complete Visit'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/staff/visits')}>
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}