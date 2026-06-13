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
import OfficeDashboard from "./pages/OfficeDashboard";
import OfficeHome from "./pages/OfficeHome";
import DocumentTemplatePicker from "./pages/DocumentTemplatePicker";
import WordWorkspace from "./pages/WordWorkspace";
import PresentationTemplatePicker from "./pages/PresentationTemplatePicker";
import PowerPointWorkspace from "./pages/PowerPointWorkspace";
import SpreadsheetTemplatePicker from "./pages/SpreadsheetTemplatePicker";
import ExcelWorkspace from "./pages/ExcelWorkspace";
import AllTools from "./pages/AllTools";
import Settings from "./pages/Settings";
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

            {/* Standalone pages */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/:tab" element={<Settings />} />
            <Route path="/all-tools" element={<AllTools />} />

            {/* AI Chat with sidebar */}
            <Route element={<DashboardLayout />}>
              <Route path="/chat" element={<Chat />} />
            </Route>

            {/* Cereva - standalone app */}
            <Route path="/cereva" element={<Cereva />} />
            <Route path="/cereva/:chatId" element={<Cereva />} />

            {/* Office Suite */}
            <Route path="/office" element={<OfficeDashboard />} />
            <Route path="/office/:projectId" element={<OfficeDashboard />} />

            {/* Per-office type homes */}
            <Route path="/office/documents" element={<OfficeHome type="documents" />} />
            <Route path="/office/documents/new" element={<DocumentTemplatePicker />} />
            <Route path="/office/documents/:projectId" element={<WordWorkspace />} />
            <Route path="/office/spreadsheets" element={<OfficeHome type="spreadsheets" />} />
            <Route path="/office/spreadsheets/new" element={<SpreadsheetTemplatePicker />} />
            <Route path="/office/spreadsheets/:projectId" element={<ExcelWorkspace />} />
            <Route path="/office/presentations" element={<OfficeHome type="presentations" />} />
            <Route path="/office/presentations/new" element={<PresentationTemplatePicker />} />
            <Route path="/office/presentations/:projectId" element={<PowerPointWorkspace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
