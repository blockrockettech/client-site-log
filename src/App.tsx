import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary, QueryErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute, AdminRoute, StaffRoute, ClientRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminSites from "./pages/admin/Sites";
import AdminChecklists from "./pages/admin/Checklists";
import AdminUsers from "./pages/admin/Users";
import AdminDatabaseInspector from "./pages/admin/DatabaseInspector";
import AdminVisits from "./pages/admin/Visits";
import ClientSites from "./pages/client/Sites";
import ClientVisits from "./pages/client/Visits";
import AddVisit from "./pages/staff/AddVisit";
import StaffVisits from "./pages/staff/Visits";
import StaffSites from "./pages/staff/Sites";
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
              {/* Public Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/index" element={<Index />} />
              
              {/* Protected Routes - Dashboard (accessible to all authenticated users) */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <Dashboard />
                      </QueryErrorBoundary>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Only accessible to admin users */}
              <Route 
                path="/admin/sites" 
                element={
                  <AdminRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AdminSites />
                      </QueryErrorBoundary>
                    </Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/checklists" 
                element={
                  <AdminRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AdminChecklists />
                      </QueryErrorBoundary>
                    </Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AdminUsers />
                      </QueryErrorBoundary>
                    </Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/visits" 
                element={
                  <AdminRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AdminVisits />
                      </QueryErrorBoundary>
                    </Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/db-inspect" 
                element={
                  <AdminRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AdminDatabaseInspector />
                      </QueryErrorBoundary>
                    </Layout>
                  </AdminRoute>
                } 
              />
              
              {/* Staff Routes - Accessible to admin and staff users */}
              <Route 
                path="/staff/visits/new" 
                element={
                  <StaffRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <AddVisit />
                      </QueryErrorBoundary>
                    </Layout>
                  </StaffRoute>
                } 
              />
              <Route 
                path="/staff/sites" 
                element={
                  <StaffRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <StaffSites />
                      </QueryErrorBoundary>
                    </Layout>
                  </StaffRoute>
                } 
              />
              <Route 
                path="/staff/visits" 
                element={
                  <StaffRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <StaffVisits />
                      </QueryErrorBoundary>
                    </Layout>
                  </StaffRoute>
                } 
              />
              
              {/* Client Routes - Accessible to all authenticated users */}
              <Route 
                path="/client/sites" 
                element={
                  <ClientRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <ClientSites />
                      </QueryErrorBoundary>
                    </Layout>
                  </ClientRoute>
                } 
              />
              <Route 
                path="/client/visits" 
                element={
                  <ClientRoute>
                    <Layout>
                      <QueryErrorBoundary>
                        <ClientVisits />
                      </QueryErrorBoundary>
                    </Layout>
                  </ClientRoute>
                } 
              />
              
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
