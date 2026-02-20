import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Chat from "./pages/Chat";
import WebBuilderDashboard from "./pages/WebBuilderDashboard";
import MobileBuilderDashboard from "./pages/MobileBuilderDashboard";
import ImageStudioDashboard from "./pages/ImageStudioDashboard";
import Settings from "./pages/Settings";
import Projects from "./pages/Projects";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkspaceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Chat />} />
              <Route path="/web-builder" element={<WebBuilderDashboard />} />
              <Route path="/web-builder/:projectId" element={<WebBuilderDashboard />} />
              <Route path="/mobile-builder" element={<MobileBuilderDashboard />} />
              <Route path="/mobile-builder/:projectId" element={<MobileBuilderDashboard />} />
              <Route path="/image-studio" element={<ImageStudioDashboard />} />
              <Route path="/image-studio/:projectId" element={<ImageStudioDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/history" element={<History />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
