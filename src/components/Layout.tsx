import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/50 backdrop-blur">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h2 className="font-semibold text-foreground">FacilityPro</h2>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === 'admin' && 'Administrator'}
                  {profile?.role === 'staff' && 'Staff Member'}
                  {profile?.role === 'client' && 'Client'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 bg-gradient-to-br from-background to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}