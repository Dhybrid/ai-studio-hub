import React, { useState, useEffect } from 'react';
import { Plus, X, RotateCw, Briefcase, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBrowserTabs, BrowserTab } from '@/hooks/useBrowserTabs';
import { AppLauncherModal } from './AppLauncherModal';
import { UserProfileModal } from './UserProfileModal';
import { BrowserOptionsMenu } from './BrowserOptionsMenu';
import {
  EruwaTabIcon, DocumentIcon, SheetIcon, SlideIcon, PdfIcon, CerevaRobotIcon, OfficeSuiteIcon
} from './AppIcons';

export const BrowserBar = () => {
  const {
    tabs,
    activeTabId,
    activeTab,
    openTab,
    closeTab,
    closeOtherTabs,
    duplicateTab,
    setActiveTabId,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    reloadTab,
    isReloading,
    canUndo,
    canRedo,
    undo,
    redo,
    toggleFullscreenMode,
  } = useBrowserTabs();

  const [tabContextMenu, setTabContextMenu] = useState<{
    x: number;
    y: number;
    tab: BrowserTab;
  } | null>(null);

  useEffect(() => {
    const handleClick = () => setTabContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Desktop Window Controls actions
  const handleWindowClose = () => {
    toast.info('Session reset initiated', {
      description: 'Your tabs are resetting to clean slate.',
    });
    localStorage.removeItem('eruwa_browser_tabs');
    window.location.reload();
  };

  const handleWindowMinimize = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWindowMaximize = () => {
    toggleFullscreenMode();
  };

  const getTabIcon = (tab: BrowserTab) => {
    switch (tab.iconType) {
      case 'word':
        return <DocumentIcon className="w-4 h-4 flex-shrink-0" />;
      case 'excel':
        return <SheetIcon className="w-4 h-4 flex-shrink-0" />;
      case 'powerpoint':
        return <SlideIcon className="w-4 h-4 flex-shrink-0" />;
      case 'pdf':
        return <PdfIcon className="w-4 h-4 flex-shrink-0" />;
      case 'cereva':
        return <CerevaRobotIcon className="w-4 h-4 flex-shrink-0" />;
      case 'office':
        return <OfficeSuiteIcon className="w-4 h-4 flex-shrink-0" />;
      default:
        return <EruwaTabIcon className="w-3.5 h-3.5 flex-shrink-0" />;
    }
  };

  return (
    <header className="w-full select-none bg-[#E9EEF6] dark:bg-slate-950 border-b border-[#D8E1EE] dark:border-slate-800 transition-colors z-40">
      {/* 1. TOP WINDOW TITLE BAR & TABS */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0 gap-2">
        {/* MOBILE VIEW (md:hidden): Clean compact header without top tabs bar */}
        <div className="flex md:hidden items-center gap-2 flex-1 min-w-0 pb-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src="/favicon.png" alt="Eruwa AI" className="w-5 h-5 object-contain flex-shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-white truncate">
                {activeTab?.title || 'Eruwa AI'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 flex-shrink-0">
                {tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}
              </span>
            </div>
          </div>

          {/* Reload Tab Button */}
          <button
            onClick={reloadTab}
            title="Reload page"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <RotateCw className={cn("w-3.5 h-3.5 transition-transform", isReloading && "animate-spin text-blue-500")} />
          </button>
        </div>

        {/* DESKTOP VIEW (hidden md:flex): Window Controls + Tab Strip */}
        <div className="hidden md:flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {/* Desktop Window Controls (Red, Yellow, Green circles) */}
          <div className="flex items-center gap-2 px-1.5 py-1 mr-2 flex-shrink-0">
            <button
              onClick={handleWindowClose}
              title="Close window"
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-90 transition-all cursor-pointer shadow-xs border border-[#E0443E]"
            />
            <button
              onClick={handleWindowMinimize}
              title="Minimize window"
              className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all cursor-pointer shadow-xs border border-[#DEA123]"
            />
            <button
              onClick={handleWindowMaximize}
              title="Maximize window"
              className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-90 transition-all cursor-pointer shadow-xs border border-[#1AAB29]"
            />
          </div>

          {/* Reload Tab Button */}
          <button
            onClick={reloadTab}
            title="Reload page (Ctrl+R / F5)"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors mr-1 flex-shrink-0"
          >
            <RotateCw className={cn("w-3.5 h-3.5 transition-transform", isReloading && "animate-spin text-blue-500")} />
          </button>

          {/* Browser Tabs Strip */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTabContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      tab,
                    });
                  }}
                  className={`group relative flex items-center gap-2 h-9 px-3.5 max-w-[210px] min-w-[125px] rounded-t-xl text-xs cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {getTabIcon(tab)}
                  <span className="truncate flex-1" title={tab.title}>
                    {tab.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    title="Close tab"
                    className="w-4 h-4 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-opacity text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* New Tab (+) Button */}
            <button
              onClick={() => openTab({ type: 'home', title: 'Eruwa AI' })}
              title="New tab (Ctrl+T)"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800 transition-colors ml-1 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Far Right Action Icons: Apps Grid, Profile, Three-Dots Menu */}
        <div className="flex items-center gap-1.5 pb-1 flex-shrink-0">
          <AppLauncherModal />
          <UserProfileModal />
          <BrowserOptionsMenu />
        </div>
      </div>

      {/* Tab Context Menu */}
      {tabContextMenu && (
        <div
          style={{ top: tabContextMenu.y, left: tabContextMenu.x }}
          className="fixed z-50 min-w-[190px] bg-white dark:bg-[#0b0b0d] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in-50 zoom-in-95 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              reloadTab();
              setTabContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Reload Tab</span>
          </button>
          <button
            onClick={() => {
              duplicateTab(tabContextMenu.tab.id);
              setTabContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate Tab</span>
          </button>
          <button
            onClick={() => {
              window.open(tabContextMenu.tab.url || window.location.origin, '_blank');
              setTabContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open in New Window</span>
          </button>
          <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
          <button
            onClick={() => {
              closeTab(tabContextMenu.tab.id);
              setTabContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Tab</span>
          </button>
          <button
            onClick={() => {
              closeOtherTabs(tabContextMenu.tab.id);
              setTabContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-left font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Close Other Tabs</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default BrowserBar;
