import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  Building2,
  Calendar,
  CheckSquare,
  Users,
  Search,
} from 'lucide-react';

export function AppSidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const getMenuItems = () => {
    const baseItems = [
      { title: 'Dashboard', url: '/', icon: Home },
    ];

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { title: 'Sites', url: '/admin/sites', icon: Building2 },
        { title: 'Checklists', url: '/admin/checklists', icon: CheckSquare },
        { title: 'Users', url: '/admin/users', icon: Users },
        { title: 'All Visits', url: '/admin/visits', icon: Calendar },
        { title: 'DB Inspector', url: '/admin/db-inspect', icon: Search },
      ];
    }

    if (profile?.role === 'staff') {
      return [
        ...baseItems,
        { title: 'My Sites', url: '/staff/sites', icon: Building2 },
        { title: 'Add Visit', url: '/staff/visits/new', icon: Calendar },
        { title: 'Visit History', url: '/staff/visits', icon: Calendar },
      ];
    }

    // Client role
    return [
      ...baseItems,
      { title: 'My Sites', url: '/client/sites', icon: Building2 },
      { title: 'Visit History', url: '/client/visits', icon: Calendar },
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    // Exact match for homepage
    if (path === '/') {
      return currentPath === '/';
    }
    
    // For all other paths, use exact match only
    // This prevents /staff/visits from matching /staff/visits/new
    return currentPath === path;
  };

  const getNavClass = (path: string) => {
    return isActive(path)
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavClass(item.url)}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}