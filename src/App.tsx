import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { BrowserProvider } from "@/hooks/useBrowserTabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Cereva from "./pages/Cereva";
import OfficeHome from "./pages/OfficeHome";
import DocumentTemplatePicker from "./pages/DocumentTemplatePicker";
import WordWorkspace from "./pages/WordWorkspace";
import PresentationTemplatePicker from "./pages/PresentationTemplatePicker";
import PowerPointWorkspace from "./pages/PowerPointWorkspace";
import SpreadsheetTemplatePicker from "./pages/SpreadsheetTemplatePicker";
import ExcelWorkspace from "./pages/ExcelWorkspace";
import PdfWorkspace from "./pages/PdfWorkspace";
import AllTools from "./pages/AllTools";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkspaceProvider>
        <BrowserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Eruwa AI Browser Home Shell */}
              <Route path="/" element={<Index />} />

              {/* Standalone pages */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/:tab" element={<Settings />} />
              <Route path="/all-tools" element={<AllTools />} />

              {/* AI Chat */}
              <Route element={<DashboardLayout />}>
                <Route path="/chat" element={<Chat />} />
              </Route>

              {/* Cereva */}
              <Route path="/cereva" element={<Cereva />} />
              <Route path="/cereva/:chatId" element={<Cereva />} />

              {/* Office Suite (Rendered seamlessly inside browser tab shell) */}
              <Route path="/office" element={<Index />} />
              <Route path="/office/*" element={<Index />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BrowserProvider>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
