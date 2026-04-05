import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Cereva from "./pages/Cereva";
import WebBuilderDashboard from "./pages/WebBuilderDashboard";
import MobileBuilderDashboard from "./pages/MobileBuilderDashboard";
import ImageStudioDashboard from "./pages/ImageStudioDashboard";
import VideoStudioDashboard from "./pages/VideoStudioDashboard";
import AudioStudioDashboard from "./pages/AudioStudioDashboard";
import OfficeDashboard from "./pages/OfficeDashboard";
import AllTools from "./pages/AllTools";
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
            {/* Landing page - no sidebar */}
            <Route path="/" element={<Index />} />

            {/* Standalone pages - own layout with back button */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/history" element={<History />} />
            <Route path="/all-tools" element={<AllTools />} />

            {/* AI Chat with sidebar */}
            <Route element={<DashboardLayout />}>
              <Route path="/chat" element={<Chat />} />
            </Route>

            {/* Independent workspaces */}
            <Route path="/cereva" element={<Cereva />} />
            <Route path="/cereva/:chatId" element={<Cereva />} />

            <Route path="/web-builder" element={<WebBuilderDashboard />} />
            <Route path="/web-builder/:projectId" element={<WebBuilderDashboard />} />

            <Route path="/mobile-builder" element={<MobileBuilderDashboard />} />
            <Route path="/mobile-builder/:projectId" element={<MobileBuilderDashboard />} />

            <Route path="/image-studio" element={<ImageStudioDashboard />} />
            <Route path="/image-studio/:projectId" element={<ImageStudioDashboard />} />

            <Route path="/video-studio" element={<VideoStudioDashboard />} />
            <Route path="/video-studio/:projectId" element={<VideoStudioDashboard />} />

            <Route path="/audio-studio" element={<AudioStudioDashboard />} />
            <Route path="/audio-studio/:projectId" element={<AudioStudioDashboard />} />

            <Route path="/office" element={<OfficeDashboard />} />
            <Route path="/office/:projectId" element={<OfficeDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
