import React, { useState } from 'react';
import {
  ArrowLeft, Home, FilePlus, FolderOpen, Info, Save, FileDown,
  Download, Printer, Share2, Copy, Check, Sparkles, Clock,
  FileText, FileSpreadsheet, Presentation, FileCode2, Upload, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DocumentIcon, SheetIcon, SlideIcon, PdfIcon
} from '@/components/browser/AppIcons';

export type BackstageTab = 'home' | 'new' | 'open' | 'info' | 'save' | 'export' | 'print' | 'share';

export interface BackstageTemplate {
  id: string;
  name: string;
  desc?: string;
  category?: string;
}

export interface OfficeBackstageModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolType: 'word' | 'excel' | 'powerpoint' | 'pdf';
  docName: string;
  onRenameDoc: (name: string) => void;
  onNewDoc: (templateId?: string) => void;
  onOpenFile?: () => void;
  onSave?: () => void;
  onExportPdf?: () => void;
  onExportNative?: () => void;
  nativeFormatLabel?: string;
  onExportAlternative?: () => void;
  altFormatLabel?: string;
  stats?: {
    countLabel?: string;
    countValue?: number | string;
    secondaryLabel?: string;
    secondaryValue?: number | string;
    themeOrFormat?: string;
  };
  templates: BackstageTemplate[];
}

export const OfficeBackstageModal: React.FC<OfficeBackstageModalProps> = ({
  isOpen,
  onClose,
  toolType,
  docName,
  onRenameDoc,
  onNewDoc,
  onOpenFile,
  onSave,
  onExportPdf,
  onExportNative,
  nativeFormatLabel = 'Export Native File',
  onExportAlternative,
  altFormatLabel,
  stats,
  templates,
}) => {
  const [activeTab, setActiveTab] = useState<BackstageTab>('home');
  const [copiedLink, setCopiedLink] = useState(false);
  const [tempName, setTempName] = useState(docName);

  if (!isOpen) return null;

  // Theming based on tool type
  const theme = {
    word: {
      sidebarBg: 'bg-blue-800 dark:bg-blue-950',
      activeItemBg: 'bg-blue-700/80 dark:bg-blue-900 text-white font-bold',
      accentColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      title: 'Documents',
      ext: '.docx',
      Icon: DocumentIcon,
    },
    excel: {
      sidebarBg: 'bg-emerald-800 dark:bg-emerald-950',
      activeItemBg: 'bg-emerald-700/80 dark:bg-emerald-900 text-white font-bold',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      title: 'Sheet',
      ext: '.xlsx',
      Icon: SheetIcon,
    },
    powerpoint: {
      sidebarBg: 'bg-amber-800 dark:bg-amber-950',
      activeItemBg: 'bg-amber-700/80 dark:bg-amber-900 text-white font-bold',
      accentColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      title: 'Slide',
      ext: '.pptx',
      Icon: SlideIcon,
    },
    pdf: {
      sidebarBg: 'bg-rose-800 dark:bg-rose-950',
      activeItemBg: 'bg-rose-700/80 dark:bg-rose-900 text-white font-bold',
      accentColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      title: 'PDF Viewer',
      ext: '.pdf',
      Icon: PdfIcon,
    },
  }[toolType];

  const ToolIcon = theme.Icon;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveDoc = () => {
    if (tempName.trim() && tempName !== docName) {
      onRenameDoc(tempName.trim());
    }
    if (onSave) onSave();
    toast.success(`"${tempName}" saved successfully`);
  };

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row select-none animate-in fade-in-50 duration-150">
      
      {/* =================================================================== */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* =================================================================== */}
      <div className={cn("w-full md:w-56 p-3 flex flex-col gap-1 text-white flex-shrink-0 border-r border-white/10", theme.sidebarBg)}>
        {/* Back / Exit Button */}
        <button
          onClick={onClose}
          className="self-start mb-3 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 text-white transition-colors"
          title="Return to editor"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Sidebar Navigation Items */}
        {[
          { id: 'home' as const, icon: Home, label: 'Home' },
          { id: 'new' as const, icon: FilePlus, label: 'New' },
          { id: 'open' as const, icon: FolderOpen, label: 'Open' },
          { id: 'info' as const, icon: Info, label: 'Info' },
          { id: 'save' as const, icon: Save, label: 'Save / Save As' },
          { id: 'export' as const, icon: Download, label: 'Export' },
          { id: 'print' as const, icon: Printer, label: 'Print' },
          { id: 'share' as const, icon: Share2, label: 'Share' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all",
                isActive
                  ? theme.activeItemBg
                  : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* RIGHT CONTENT PANE (CHANGES BASED ON CLICKED OPTION) */}
      {/* =================================================================== */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white dark:bg-[#0c0c10]">
        
        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <div className="max-w-4xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Good day</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage {theme.title} workspace, create from templates, or export your work.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onNewDoc();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                <FilePlus className="w-4 h-4" />
                <span>New Blank {theme.title}</span>
              </button>

              {onOpenFile && (
                <button
                  onClick={() => {
                    onOpenFile();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open from Computer</span>
                </button>
              )}
            </div>

            {/* Templates Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular Templates
                </h3>
                <button
                  onClick={() => setActiveTab('new')}
                  className={cn("text-xs font-semibold hover:underline", theme.accentColor)}
                >
                  View all templates &rarr;
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {templates.slice(0, 4).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onNewDoc(tpl.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 hover:border-blue-500 hover:shadow-md bg-white dark:bg-[#121217] text-left transition-all group shadow-2xs"
                  >
                    <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2.5 group-hover:scale-103 transition-transform">
                      <ToolIcon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500">
                      {tpl.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {tpl.desc || 'Starter template'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. NEW TAB */}
        {activeTab === 'new' && (
          <div className="max-w-4xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">New {theme.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a blank workspace or start with a pre-configured template.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Blank Option */}
              <button
                onClick={() => {
                  onNewDoc();
                  onClose();
                }}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 text-left transition-all flex flex-col items-center justify-center text-center aspect-video group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FilePlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Blank {theme.title}</span>
                <span className="text-[10px] text-slate-400">Start from scratch</span>
              </button>

              {/* All Templates */}
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onNewDoc(tpl.id);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 hover:border-blue-500 hover:shadow-md bg-white dark:bg-[#121217] text-left transition-all group shadow-2xs"
                >
                  <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-102 transition-transform">
                    <ToolIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500">
                    {tpl.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {tpl.desc || 'Professional template'}
                  </p>
                  {tpl.category && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-500">
                      {tpl.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. OPEN TAB */}
        {activeTab === 'open' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Open {theme.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load documents from your computer or choose from your active browser session.
              </p>
            </div>

            {/* Upload Box */}
            <div
              onClick={() => {
                if (onOpenFile) onOpenFile();
                onClose();
              }}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                Browse file from your device
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports standard {theme.ext}, OpenXML, CSV, plain text, and PDF format.
              </p>
              <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500 transition-colors">
                Select File
              </span>
            </div>

            {/* Current Open File */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-[#121217]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Workspace File</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <div className="flex items-center gap-3">
                <ToolIcon className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{docName}</h4>
                  <p className="text-[10px] text-slate-400">Stored in browser local indexed storage</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
                >
                  Return to Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. INFO TAB */}
        {activeTab === 'info' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Document Properties</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect workspace statistics, file structure, and metadata.
              </p>
            </div>

            {/* Properties Card */}
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101014] shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                <ToolIcon className="w-10 h-10 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => onRenameDoc(tempName.trim())}
                    className="w-full font-bold text-sm bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-blue-500 outline-none pb-0.5"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 block">{stats?.countLabel || 'Items'}</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{stats?.countValue ?? '1'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 block">{stats?.secondaryLabel || 'Format'}</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{stats?.secondaryValue ?? theme.ext}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 block">Theme / Layout</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white capitalize truncate block">{stats?.themeOrFormat || 'Default'}</span>
                </div>
              </div>

              {/* Protection & Status */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-white/5">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" /> Zero-latency client sandbox active
                </span>
                <span className="text-[11px] font-mono text-slate-400">UTF-8 / OpenXML</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. SAVE / SAVE AS TAB */}
        {activeTab === 'save' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Save Document</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save changes to browser session or export an offline backup file.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101014] flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">File Name</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-mono text-slate-400">{theme.ext}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleSaveDoc}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Session State</span>
                </button>

                {onExportNative && (
                  <button
                    onClick={() => {
                      onExportNative();
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Copy ({theme.ext})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Export & Download</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download your {theme.title} in industry-standard formats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Native Format */}
              {onExportNative && (
                <button
                  onClick={() => {
                    onExportNative();
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-blue-500 hover:shadow-md bg-white dark:bg-[#101014] text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ToolIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{nativeFormatLabel}</h4>
                      <p className="text-[10px] text-slate-400">{theme.ext} standard format</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    Download &rarr;
                  </span>
                </button>
              )}

              {/* PDF Format */}
              {onExportPdf && (
                <button
                  onClick={() => {
                    onExportPdf();
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-red-500 hover:shadow-md bg-white dark:bg-[#101014] text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <PdfIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export as PDF</h4>
                      <p className="text-[10px] text-slate-400">Portable Document Format</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 group-hover:underline">
                    Download &rarr;
                  </span>
                </button>
              )}

              {/* Alternative Format (e.g. CSV, TXT) */}
              {onExportAlternative && (
                <button
                  onClick={() => {
                    onExportAlternative();
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500 hover:shadow-md bg-white dark:bg-[#101014] text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{altFormatLabel || 'Export Plain Text / CSV'}</h4>
                      <p className="text-[10px] text-slate-400">Lightweight raw export</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    Download &rarr;
                  </span>
                </button>
              )}

              {/* Print Export */}
              <button
                onClick={() => {
                  window.print();
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-slate-500 hover:shadow-md bg-white dark:bg-[#101014] text-left transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Print Document</h4>
                    <p className="text-[10px] text-slate-400">Direct system printer dialog</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:underline">
                  Print &rarr;
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 7. PRINT TAB */}
        {activeTab === 'print' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Print Preview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format your {theme.title} for physical printing or PDF printer drivers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101014] flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Printer className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Ready to Print "{docName}"</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click the button below to launch the system print dialog. You can select destination, paper size, and color mode.
                </p>
              </div>

              <button
                onClick={() => {
                  window.print();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Open Print Dialog</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. SHARE TAB */}
        {activeTab === 'share' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Share & Collaborate</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this {theme.title} workspace with colleagues or link directly into this browser tab.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101014] flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Workspace Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Collaborators with this link will open this workspace within their own isolated tab instance.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OfficeBackstageModal;
