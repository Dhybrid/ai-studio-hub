import React from 'react';
import { Minimize2 } from 'lucide-react';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { BrowserBar } from '@/components/browser/BrowserBar';
import { EruwaUnifiedWorkspace } from '@/components/home/EruwaUnifiedWorkspace';
import WordWorkspace from './WordWorkspace';
import ExcelWorkspace from './ExcelWorkspace';
import PowerPointWorkspace from './PowerPointWorkspace';
import PdfWorkspace from './PdfWorkspace';
import OfficeHome from './OfficeHome';
import Cereva from './Cereva';
import Settings from './Settings';
import { MobileTabSwitcher } from '@/components/browser/MobileTabSwitcher';

class TabErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Eruwa Workspace Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg mb-3">
            !
          </div>
          <h2 className="text-lg font-bold mb-1">Workspace encountered an issue</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            {this.state.error?.message || 'A temporary error occurred while loading this tab.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry Tab
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('eruwa_browser_tabs');
                localStorage.removeItem('eruwa_active_tab_id');
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Index = () => {
  const { activeTab, fullscreenMode, toggleFullscreenMode, reloadCounter, reloadTab } = useBrowserTabs();

  // Keyboard shortcut for tab reloading
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        reloadTab();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reloadTab]);

  const renderActiveTabView = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if ((!activeTab || activeTab.type === 'home') && (path.includes('/office/presentations') || path.includes('/office/slides'))) {
        return <PowerPointWorkspace />;
      }
      if ((!activeTab || activeTab.type === 'home') && path.includes('/office/documents')) {
        return <WordWorkspace />;
      }
      if ((!activeTab || activeTab.type === 'home') && (path.includes('/office/spreadsheets') || path.includes('/office/sheets'))) {
        return <ExcelWorkspace />;
      }
      if ((!activeTab || activeTab.type === 'home') && path.includes('/office/pdf')) {
        return <PdfWorkspace />;
      }
      if ((!activeTab || activeTab.type === 'home') && path.startsWith('/office')) {
        return <OfficeHome />;
      }
    }

    if (!activeTab || activeTab.type === 'home' || activeTab.type === 'chat') {
      return <EruwaUnifiedWorkspace />;
    }

    switch (activeTab.type) {
      case 'word':
        return <WordWorkspace />;
      case 'excel':
        return <ExcelWorkspace />;
      case 'powerpoint':
        return <PowerPointWorkspace />;
      case 'pdf':
        return <PdfWorkspace />;
      case 'cereva':
        return <Cereva />;
      case 'settings':
        return <Settings />;
      case 'office':
        return <OfficeHome />;
      default:
        return <EruwaUnifiedWorkspace />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* 1. Browser Navigation Header: Tabs, Apps Grid, User Profile (Always visible in fullscreen extension view) */}
      <BrowserBar />

      {/* Floating Exit Button when in Fullscreen Website Mode */}
      {fullscreenMode && (
        <button
          onClick={toggleFullscreenMode}
          title="Exit Fullscreen Website Mode"
          className="absolute top-14 right-4 z-50 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all hover:scale-105"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Fullscreen</span>
        </button>
      )}

      {/* 2. Active Tab Content Window (Refreshes dynamically on reload) */}
      <main className="flex-1 w-full overflow-auto relative">
        <TabErrorBoundary key={`${activeTab?.id || 'tab'}-${reloadCounter}`}>
          {renderActiveTabView()}
        </TabErrorBoundary>
      </main>

      {/* 3. Floating Mobile Tab Switcher (Draggable & Horizontal Swipeable Carousel) */}
      <MobileTabSwitcher />
    </div>
  );
};

export default Index;
