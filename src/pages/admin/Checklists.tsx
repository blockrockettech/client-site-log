import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Plus, CheckSquare, Edit, Trash2, GripVertical } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { checklistSchema, ChecklistFormData } from '@/lib/validations';

type Checklist = Database['public']['Tables']['checklists']['Row'];

type ChecklistWithSites = Checklist & {
  site_count: number;
};

export default function AdminChecklists() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      title: '',
      items: [{ text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Fetch checklists with site count
  const { data: checklists, isLoading } = useQuery({
    queryKey: ['admin-checklists'],
    queryFn: async () => {
      // First get all checklists
      const { data: checklistsData, error: checklistsError } = await supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (checklistsError) throw checklistsError;

      // Then get site counts for each checklist
      const checklistsWithCounts = await Promise.all(
        (checklistsData || []).map(async (checklist) => {
          const { count } = await supabase
            .from('sites')
            .select('id', { count: 'exact' })
            .eq('checklist_id', checklist.id);
          
          return {
            ...checklist,
            site_count: count || 0,
          } as ChecklistWithSites;
        })
      );

      return checklistsWithCounts;
    },
  });

  // Create/Update checklist mutation
  const checklistMutation = useMutation({
    mutationFn: async (checklistData: ChecklistFormData) => {
      const payload = {
        title: checklistData.title,
        items: checklistData.items,
      };

      if (editingChecklist) {
        const { error } = await supabase
          .from('checklists')
          .update(payload)
          .eq('id', editingChecklist.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checklists')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklists'] });
      setIsDialogOpen(false);
      setEditingChecklist(null);
      form.reset();
      toast({
        title: editingChecklist ? 'Checklist updated' : 'Checklist created',
        description: `Checklist has been ${editingChecklist ? 'updated' : 'created'} successfully.`,
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

  // Delete checklist mutation
  const deleteMutation = useMutation({
    mutationFn: async (checklistId: number) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklists'] });
      toast({
        title: 'Checklist deleted',
        description: 'Checklist has been deleted successfully.',
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

  const handleSubmit = (data: ChecklistFormData) => {
    checklistMutation.mutate(data);
  };

  const handleEdit = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    const items = Array.isArray(checklist.items) 
      ? checklist.items 
      : [];
    
    form.reset({
      title: checklist.title,
      items: items.length > 0 
        ? items.map((item: any) => ({
            text: typeof item === 'string' ? item : item.text || item.name || '',
          }))
        : [{ text: '' }],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (checklistId: number, siteCount: number) => {
    if (siteCount > 0) {
      toast({
        title: 'Cannot delete checklist',
        description: `This checklist is being used by ${siteCount} site(s). Remove it from all sites first.`,
        variant: 'destructive',
      });
      return;
    }

    if (confirm('Are you sure you want to delete this checklist? This action cannot be undone.')) {
      deleteMutation.mutate(checklistId);
    }
  };

  const addTask = () => {
    append({ text: '' });
  };

  const removeTask = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
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
          <h1 className="text-3xl font-bold text-foreground">Checklists Management</h1>
          <p className="text-muted-foreground">Manage facility inspection checklists</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingChecklist(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingChecklist(null);
              form.reset({
                title: '',
                items: [{ text: '' }],
              });
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Checklist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChecklist ? 'Edit Checklist' : 'Add New Checklist'}</DialogTitle>
              <DialogDescription>
                {editingChecklist ? 'Update checklist information and tasks' : 'Create a new facility inspection checklist'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checklist Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Basic Clean, Deep Clean, Maintenance Check" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Tasks</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addTask}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Task
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-2">
                        <div className="flex items-center gap-2 mt-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground min-w-[60px]">
                            Task {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.text`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder={`Describe task ${String.fromCharCode(65 + index)}...`} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTask(index)}
                          disabled={fields.length === 1}
                          className="mt-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={checklistMutation.isPending}>
                    {checklistMutation.isPending ? 'Saving...' : (editingChecklist ? 'Update Checklist' : 'Create Checklist')}
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
        {checklists?.map((checklist) => (
          <Card key={checklist.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(checklist)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(checklist.id, checklist.site_count)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks</span>
                <Badge variant="secondary">
                  {Array.isArray(checklist.items) ? checklist.items.length : 0} tasks
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Used by sites</span>
                <Badge variant={checklist.site_count > 0 ? "default" : "outline"}>
                  {checklist.site_count} sites
                </Badge>
              </div>

              {Array.isArray(checklist.items) && checklist.items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Tasks:</span>
                  <div className="space-y-1">
                    {(checklist.items as any[]).slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="text-primary font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="truncate">
                          {typeof item === 'string' ? item : item.text || item.name || 'Untitled task'}
                        </span>
                      </div>
                    ))}
                    {(checklist.items as any[]).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{(checklist.items as any[]).length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {checklists?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No checklists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first inspection checklist to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Checklist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
