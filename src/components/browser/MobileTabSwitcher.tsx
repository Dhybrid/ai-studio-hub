import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, X, Check, Globe, FileText, FileSpreadsheet, Presentation,
  FileCode2, Bot, ArrowRight, RotateCw, Sparkles, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrowserTabs, BrowserTab } from '@/hooks/useBrowserTabs';
import {
  EruwaTabIcon, DocumentIcon, SheetIcon, SlideIcon, PdfIcon, CerevaRobotIcon, OfficeSuiteIcon
} from './AppIcons';

export const MobileTabSwitcher: React.FC = () => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab,
  } = useBrowserTabs();

  const [isOpen, setIsOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll directly to the active tab screen when switcher is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (activeCardRef.current) {
          activeCardRef.current.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTabId]);

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    setIsOpen(false);
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
        return <EruwaTabIcon className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const renderTabPreview = (tab: BrowserTab) => {
    switch (tab.type) {
      case 'word':
        return (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-950 p-2.5 flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 select-none shadow-inner overflow-hidden text-left">
            {/* Top Word Ribbon */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 dark:border-white/10 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[8px]">DOC</span>
                <span className="font-bold text-slate-800 dark:text-white truncate max-w-[100px]">{tab.title}</span>
              </div>
              <div className="flex items-center gap-1 opacity-70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[8px]">Saved</span>
              </div>
            </div>

            {/* Document Paper Page Preview */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-md border border-slate-200/70 dark:border-white/5 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="h-3 w-4/5 bg-blue-600/20 dark:bg-blue-400/25 rounded-md mb-2 flex items-center px-1">
                  <span className="text-[8px] font-bold text-blue-700 dark:text-blue-300">Executive Proposal</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="h-1.5 w-11/12 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="h-1.5 w-4/5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="h-1.5 w-9/12 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Callout Box */}
                <div className="mt-2.5 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border-l-2 border-blue-500 flex flex-col gap-1">
                  <span className="text-[8px] font-semibold text-blue-700 dark:text-blue-300">Key Milestone & Growth</span>
                  <div className="h-1 w-5/6 bg-blue-200 dark:bg-blue-800 rounded-full" />
                </div>
              </div>

              {/* Document footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[8px] text-slate-400">
                <span>Page 1 of 4</span>
                <span className="text-blue-500 font-medium">1,240 words</span>
              </div>
            </div>
          </div>
        );
      case 'excel':
        return (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-950 p-2.5 flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 select-none shadow-inner overflow-hidden text-left">
            {/* Top Sheet Formula Bar */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 dark:border-white/10 text-[9px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[8px]">XLS</span>
                <span className="font-mono text-[8px] text-slate-600 dark:text-slate-300 bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                  fx =SUM(C2:C8)*1.15
                </span>
              </div>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Sheet1</span>
            </div>

            {/* Spreadsheet Table Grid Preview */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 shadow-md border border-slate-200/70 dark:border-white/5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                {/* Column Headers */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-1 rounded">
                  <span>Category</span>
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Trend</span>
                </div>
                {/* Data Rows */}
                <div className="grid grid-cols-4 gap-1 text-[7px] text-slate-700 dark:text-slate-300 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Software</span>
                  <span>$140k</span>
                  <span className="text-emerald-600 font-bold">$168k</span>
                  <span className="text-emerald-500 font-bold">+20%</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[7px] text-slate-700 dark:text-slate-300 px-1 py-0.5 border-b border-slate-100 dark:border-slate-800 bg-emerald-500/5 rounded">
                  <span className="font-medium">Services</span>
                  <span>$85k</span>
                  <span className="text-emerald-600 font-bold">$94k</span>
                  <span className="text-emerald-500 font-bold">+11%</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[7px] text-slate-700 dark:text-slate-300 px-1 py-0.5">
                  <span className="font-medium">Hardware</span>
                  <span>$62k</span>
                  <span className="text-emerald-600 font-bold">$78k</span>
                  <span className="text-emerald-500 font-bold">+25%</span>
                </div>
              </div>

              {/* Embedded Mini Trend Chart */}
              <div className="mt-2 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-end justify-between h-9 px-2">
                <div className="w-3 bg-emerald-400/40 rounded-t h-3" />
                <div className="w-3 bg-emerald-400/60 rounded-t h-5" />
                <div className="w-3 bg-emerald-500/80 rounded-t h-7" />
                <div className="w-3 bg-emerald-500 rounded-t h-9" />
              </div>
            </div>
          </div>
        );
      case 'powerpoint':
        return (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-950 p-2.5 flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 select-none shadow-inner overflow-hidden text-left">
            {/* Top Slide Header */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 dark:border-white/10 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-bold text-[8px]">PPT</span>
                <span className="font-bold text-slate-800 dark:text-white truncate max-w-[100px]">Slide Presentation</span>
              </div>
              <span className="text-[8px] text-orange-500 font-medium">16:9 Canvas</span>
            </div>

            {/* 16:9 Presentation Slide Canvas */}
            <div className="flex-1 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-orange-950/20 rounded-xl p-3 shadow-md border border-orange-200/60 dark:border-orange-500/20 flex flex-col justify-between overflow-hidden">
              <div>
                <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 block mb-1">
                  AI Product Strategy Roadmap
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <div className="h-1.5 w-14 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <div className="h-1.5 w-18 bg-slate-300 dark:bg-slate-700 rounded-full" />
                    </div>
                  </div>
                  {/* Mini Pie / Donut Visual */}
                  <div className="flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full border-4 border-orange-500/30 border-t-orange-500 border-r-amber-400 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-orange-600 dark:text-orange-300">78%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[8px] text-slate-400">
                <span>Slide 2 of 10</span>
                <span className="text-orange-500 font-medium">Presenter Mode</span>
              </div>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-950 p-2.5 flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 select-none shadow-inner overflow-hidden text-left">
            {/* Top PDF Toolbar */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/80 dark:border-white/10 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[8px]">PDF</span>
                <span className="font-bold text-slate-800 dark:text-white truncate max-w-[100px]">Document Viewer</span>
              </div>
              <span className="text-[8px] text-rose-500 font-medium">Verified PDF/A</span>
            </div>

            {/* PDF Page Canvas */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-md border border-rose-200/60 dark:border-rose-500/20 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="h-3 w-full bg-rose-500/15 dark:bg-rose-500/25 rounded px-1.5 flex items-center mb-2">
                  <span className="text-[7px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Confidential Legal Agreement</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="h-1.5 w-11/12 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  {/* Highlighted text */}
                  <div className="h-1.5 w-4/5 bg-yellow-300 dark:bg-yellow-500/50 rounded-full" />
                  <div className="h-1.5 w-9/12 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                {/* Digital Signature Seal */}
                <div className="mt-3 p-1.5 rounded-lg border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-rose-500 flex-shrink-0" />
                  <span className="text-[7px] font-bold text-rose-700 dark:text-rose-300">Digitally Signed & Certified</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[8px] text-slate-400">
                <span>Page 1 of 6</span>
                <span className="text-rose-500 font-medium">100% Zoom</span>
              </div>
            </div>
          </div>
        );
      case 'cereva':
        return (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 p-3 flex flex-col justify-between rounded-2xl border border-indigo-400/30 select-none shadow-inner text-center">
            <div className="flex items-center justify-between text-[9px] text-indigo-300 font-semibold pb-1 border-b border-indigo-500/20">
              <span>Cereva Neural Voice</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white mb-2 animate-pulse">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-white">Interactive AI Teacher</span>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
            <span className="text-[8px] text-indigo-300/80">Listening & Ready</span>
          </div>
        );
      case 'office':
        return (
          <div className="w-full h-full bg-slate-900/90 p-2.5 flex flex-col rounded-2xl border border-yellow-500/30 select-none shadow-inner overflow-hidden text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[9px]">
              <span className="font-bold text-yellow-400 uppercase tracking-wider text-[8px]">Office Studio</span>
              <span className="text-[8px] text-slate-400">4 Suites</span>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-white leading-tight block mb-2">
                  Create with Intelligence
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[8px] font-bold text-blue-300">
                    Documents
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[8px] font-bold text-emerald-300">
                    Sheets
                  </div>
                  <div className="p-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[8px] font-bold text-orange-300">
                    Slides
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[8px] font-bold text-rose-300">
                    PDF Editor
                  </div>
                </div>
              </div>
              <div className="mt-2 h-5 rounded-lg bg-white/10 border border-white/15 flex items-center justify-between px-2 text-[8px] text-slate-400">
                <span>Prompt bar...</span>
                <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-2.5 flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 select-none shadow-inner text-center overflow-hidden">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-white/10 text-[8px] text-slate-400">
              <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[7px]">https://eruwa.ai</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Logo & Search */}
            <div className="my-auto flex flex-col items-center">
              <img src="/favicon.png" alt="Eruwa" className="w-7 h-7 object-contain mb-1 drop-shadow" />
              <span className="text-[11px] font-black tracking-tight text-slate-900 dark:text-white">Eruwa AI</span>
              <div className="w-full max-w-[170px] mt-2 p-[1.5px] rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 shadow-xs">
                <div className="bg-white dark:bg-slate-900 rounded-[10px] px-2 py-1 text-[7px] text-slate-400 flex items-center justify-between">
                  <span>Ask anything...</span>
                  <Sparkles className="w-2 h-2 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick App Badges */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-500/20 text-blue-600 text-[6px] font-bold flex items-center justify-center">D</span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 text-emerald-600 text-[6px] font-bold flex items-center justify-center">S</span>
              <span className="w-3.5 h-3.5 rounded bg-orange-500/20 text-orange-600 text-[6px] font-bold flex items-center justify-center">P</span>
              <span className="w-3.5 h-3.5 rounded bg-rose-500/20 text-rose-600 text-[6px] font-bold flex items-center justify-center">PDF</span>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* 1. FLOATING, DRAGGABLE, BOUNCING TAB BUTTON (MOBILE ONLY) */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 260, top: -450, bottom: 10 }}
        dragElastic={0.15}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
          },
        }}
        className="fixed bottom-5 left-4 z-50 md:hidden cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <button
          onClick={() => setIsOpen(true)}
          title="Open Mobile Tab Switcher"
          className="relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl border-2 border-white/40 dark:border-white/20 backdrop-blur-xl"
        >
          {/* Mobile browser tab counter box icon */}
          <div className="w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center font-black text-xs">
            {tabs.length}
          </div>

          {/* Floating pulse indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>
      </motion.div>

      {/* 2. HORIZONTAL TAB SWITCHER MODAL / CAROUSEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 dark:bg-black/90 backdrop-blur-xl flex flex-col md:hidden select-none"
          >
            {/* Header: Title, Tab Count, New Tab, Done */}
            <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-white/10 text-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Open Tabs</h2>
                  <p className="text-[10px] text-white/60">{tabs.length} active workspace {tabs.length === 1 ? 'tab' : 'tabs'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openTab({ type: 'home', title: 'Eruwa AI' });
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-colors active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Tab</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Horizontal Swipeable Tab Carousel */}
            <div 
              ref={carouselRef}
              className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-6 gap-4 snap-x snap-mandatory no-scrollbar"
            >
              {tabs.map((tab, idx) => {
                const isActive = tab.id === activeTabId;
                return (
                  <motion.div
                    key={tab.id}
                    ref={isActive ? activeCardRef : null}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleSelectTab(tab.id)}
                    className={cn(
                      "w-[78vw] max-w-[320px] h-[64vh] flex-shrink-0 snap-center rounded-3xl border-2 flex flex-col overflow-hidden transition-all duration-200 shadow-2xl relative cursor-pointer active:scale-98",
                      isActive
                        ? "border-blue-500 ring-4 ring-blue-500/30 bg-slate-900/95 text-white shadow-blue-500/20"
                        : "border-white/15 bg-slate-900/60 text-slate-300 hover:border-white/30"
                    )}
                  >
                    {/* Active tab top badge ribbon */}
                    {isActive && (
                      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold py-1 px-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Screen</span>
                        </span>
                        <span className="opacity-75">Currently Displayed</span>
                      </div>
                    )}

                    {/* Tab Top Header Strip */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md flex-shrink-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        {getTabIcon(tab)}
                        <span className="text-xs font-bold truncate text-white">
                          {tab.title}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="p-1 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                        title="Close Tab"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tab Preview Canvas */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex-1 w-full rounded-2xl overflow-hidden mb-3">
                        {renderTabPreview(tab)}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Active Screen (Click to View)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                            <span>Tap to switch to this screen</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}

                        <span className="text-[10px] text-white/40 font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Swipe Guidance Hint */}
            <div className="pb-8 pt-2 flex items-center justify-center gap-2 text-[11px] text-white/60">
              <span>Scroll horizontally • Tap any card to switch to that active screen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileTabSwitcher;
