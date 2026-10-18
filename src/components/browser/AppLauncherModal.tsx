import React from 'react';
import { useBrowserTabs, TabType } from '@/hooks/useBrowserTabs';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DocumentIcon, SheetIcon, SlideIcon, PdfIcon, CerevaRobotIcon, OfficeSuiteIcon
} from './AppIcons';

interface AppItem {
  id: string;
  name: string;
  type: TabType;
  icon: React.ElementType;
}

const APPS: AppItem[] = [
  {
    id: 'office',
    name: 'Office',
    type: 'office',
    icon: OfficeSuiteIcon,
  },
  {
    id: 'word',
    name: 'Documents',
    type: 'word',
    icon: DocumentIcon,
  },
  {
    id: 'excel',
    name: 'Sheet',
    type: 'excel',
    icon: SheetIcon,
  },
  {
    id: 'powerpoint',
    name: 'Slide',
    type: 'powerpoint',
    icon: SlideIcon,
  },
  {
    id: 'pdf',
    name: 'PDF',
    type: 'pdf',
    icon: PdfIcon,
  },
  {
    id: 'cereva',
    name: 'Cereva',
    type: 'cereva',
    icon: CerevaRobotIcon,
  },
];

export const AppLauncherModal = () => {
  const { openTab } = useBrowserTabs();

  const handleLaunchApp = (app: AppItem) => {
    openTab({
      type: app.type,
      title: `${app.name} — Eruwa`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="Our Apps"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <LayoutGrid className="w-4 h-4 stroke-[2]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[280px] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl z-50 animate-in fade-in-50 zoom-in-95"
      >
        <div className="pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Our Apps
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {APPS.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunchApp(app)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-150 group"
              >
                <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-108 drop-shadow-xs">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => openTab({ type: 'home' })}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View all apps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
