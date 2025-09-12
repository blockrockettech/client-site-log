import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary, QueryErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminSites from "./pages/admin/Sites";
import AdminChecklists from "./pages/admin/Checklists";
import AdminUsers from "./pages/admin/Users";
import ClientSites from "./pages/client/Sites";
import AddVisit from "./pages/staff/AddVisit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout><QueryErrorBoundary><Dashboard /></QueryErrorBoundary></Layout>} />
              
              {/* Admin Routes */}
              <Route path="/admin/sites" element={<Layout><QueryErrorBoundary><AdminSites /></QueryErrorBoundary></Layout>} />
              
              {/* Staff Routes */}
              <Route path="/staff/visits/new" element={<Layout><QueryErrorBoundary><AddVisit /></QueryErrorBoundary></Layout>} />
              <Route path="/staff/sites" element={<Layout><div className="p-6">Staff Sites - Coming Soon</div></Layout>} />
              <Route path="/staff/visits" element={<Layout><div className="p-6">Staff Visits - Coming Soon</div></Layout>} />
              
              {/* Client Routes */}
              <Route path="/client/sites" element={<Layout><QueryErrorBoundary><ClientSites /></QueryErrorBoundary></Layout>} />
              <Route path="/client/visits" element={<Layout><div className="p-6">Client Visits - Coming Soon</div></Layout>} />
              
            {/* Admin routes */}
            <Route path="/admin/checklists" element={<Layout><QueryErrorBoundary><AdminChecklists /></QueryErrorBoundary></Layout>} />
              <Route path="/admin/users" element={<Layout><QueryErrorBoundary><AdminUsers /></QueryErrorBoundary></Layout>} />
              <Route path="/admin/visits" element={<Layout><div className="p-6">All Visits - Coming Soon</div></Layout>} />
              <Route path="/admin/reports" element={<Layout><div className="p-6">Reports - Coming Soon</div></Layout>} />
              <Route path="/admin/settings" element={<Layout><div className="p-6">Settings - Coming Soon</div></Layout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
