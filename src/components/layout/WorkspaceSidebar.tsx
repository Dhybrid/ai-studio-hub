import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight,
  Home, Star, Users, Clock, Share2, Zap,
  BookOpen, FolderOpen, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  name: string;
  subtitle?: string;
  time?: string;
}

interface WorkspaceSidebarProps {
  title: string;
  icon: React.ElementType;
  items: SidebarItem[];
  selectedId?: string;
  onSelectItem: (id: string) => void;
  onNewItem: () => void;
  newItemLabel?: string;
  searchPlaceholder?: string;
  itemsLabel?: string;
  extraContent?: React.ReactNode;
}

export const WorkspaceSidebar = ({
  title,
  icon: Icon,
  items,
  selectedId,
  onSelectItem,
  onNewItem,
  newItemLabel = 'New',
  searchPlaceholder = 'Search...',
  extraContent,
}: WorkspaceSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'starred' | 'shared' | 'recents'>('all');
  const navigate = useNavigate();
  const location = useLocation();

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { icon: Home, label: 'Home', onClick: () => onNewItem() },
    { icon: Search, label: 'Search', onClick: () => {} },
    { icon: BookOpen, label: 'Resources', onClick: () => {} },
  ];

  const projectSections = [
    { key: 'all' as const, icon: FolderOpen, label: 'All projects' },
    { key: 'starred' as const, icon: Star, label: 'Starred' },
    { key: 'shared' as const, icon: Users, label: 'Shared with me' },
    { key: 'recents' as const, icon: Clock, label: 'Recents' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-accent-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap flex-1"
            >
              <p className="text-sm font-semibold text-foreground tracking-tight">John Doe's {title}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col py-3 px-2 gap-0.5 overflow-y-auto">
        {/* Main nav items */}
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
              "hover:bg-surface-hover text-sidebar-foreground"
            )}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        {/* Divider */}
        {!collapsed ? (
          <div className="flex items-center gap-2 px-3 mt-4 mb-1">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Projects</span>
            <div className="flex-1 h-px bg-sidebar-border" />
          </div>
        ) : (
          <div className="my-2 mx-3 h-px bg-sidebar-border" />
        )}

        {/* Project sections */}
        {projectSections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
              "hover:bg-surface-hover",
              activeSection === section.key
                ? "bg-surface-active text-foreground font-medium"
                : "text-sidebar-foreground"
            )}
          >
            <section.icon className={cn("w-[18px] h-[18px] flex-shrink-0", activeSection === section.key && "text-accent")} />
            {!collapsed && <span className="truncate">{section.label}</span>}
          </button>
        ))}

        {/* Search & project list when a section is active */}
        {!collapsed && (
          <div className="mt-2">
            <div className="px-2 mb-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-6 pr-2 py-1.5 rounded-md bg-surface border border-sidebar-border text-[11px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors group",
                    selectedId === item.id
                      ? "bg-surface-active text-foreground"
                      : "hover:bg-surface-hover text-sidebar-foreground"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{item.name}</p>
                    {item.subtitle && <p className="text-[9px] text-muted-foreground/60 truncate">{item.subtitle}</p>}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-[10px] text-muted-foreground/50 text-center py-4">No projects found</p>
              )}
            </div>
          </div>
        )}

        {extraContent && !collapsed && extraContent}

        <div className="flex-1" />

        {/* Share / Referral */}
        {!collapsed && (
          <div className="mx-2 mb-2 p-3 rounded-xl border border-sidebar-border bg-surface-hover/30">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-semibold text-foreground">Share COXMOX</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">100 credits per paid referral</p>
          </div>
        )}

        {/* Upgrade */}
        {!collapsed && (
          <div className="mx-2 mb-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-semibold text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Unlock more benefits</p>
          </div>
        )}

        {/* Back to COXMOX */}
        <div className="border-t border-sidebar-border pt-2 mt-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-surface-hover text-sidebar-foreground"
          >
            <ArrowLeft className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="truncate">Back to COXMOX</span>}
          </a>
        </div>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
          JD
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Pro</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
        style={{ left: collapsed ? 58 : 254 }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};
