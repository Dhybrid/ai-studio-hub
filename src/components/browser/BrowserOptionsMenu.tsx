import React from 'react';
import {
  Plus, Maximize2, History, Download, Bookmark, Settings,
  HelpCircle, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const BrowserOptionsMenu = () => {
  const { openTab, toggleFullscreenMode, fullscreenMode } = useBrowserTabs();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="More options"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl z-50 animate-in fade-in-50 zoom-in-95 text-xs"
      >
        <DropdownMenuItem
          onClick={() => openTab({ type: 'home', title: 'Eruwa AI' })}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>New tab</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleFullscreenMode}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{fullscreenMode ? 'Exit full screen' : 'New window'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem
          onClick={() => toast.info('Browsing & search history is safely maintained in your active session.')}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>History</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toast.info('Recent exports and downloaded files are saved in your Office workspace.')}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Downloads</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toast.info('Pinned tabs & shortcuts are saved to your current profile.')}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-500" />
          <span>Bookmarks</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem
          onClick={() => openTab({ type: 'settings', title: 'Settings' })}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toast.info('Eruwa AI 2026 — Intelligent Multi-Workspace Operating Environment.')}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Help & feedback</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
