import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ChevronLeft, ChevronRight,
  Home, MoreHorizontal, Sparkles
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
  itemsLabel = 'Recent',
  extraContent,
}: WorkspaceSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <p className="text-sm font-semibold text-foreground tracking-tight">{title}</p>
              <p className="text-[11px] text-sidebar-muted">COXMOX</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Button */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onNewItem}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-sidebar-border text-sm text-sidebar-foreground hover:bg-surface-hover hover:border-accent/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            {newItemLabel}
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-2 pt-3">
          <button
            onClick={onNewItem}
            className="w-10 h-10 mx-auto rounded-lg border border-dashed border-sidebar-border flex items-center justify-center hover:bg-surface-hover hover:border-accent/30 transition-all text-sidebar-foreground"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + Items */}
      <div className="flex-1 flex flex-col py-3 px-2 gap-1 overflow-y-auto">
        {!collapsed && (
          <>
            <div className="px-2 mb-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-6 pr-2 py-1 rounded-md bg-surface border border-sidebar-border text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 mt-1 mb-1">
              <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">{itemsLabel}</span>
              <div className="flex-1 h-px bg-sidebar-border" />
            </div>

            <div className="space-y-0.5">
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
                  {item.time && <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 group-hover:hidden">{item.time}</span>}
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 hidden group-hover:block" />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-[10px] text-muted-foreground/50 text-center py-4">No items found</p>
              )}
            </div>
          </>
        )}

        {extraContent && !collapsed && extraContent}

        <div className="flex-1" />

        {/* Bottom */}
        <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-surface-hover text-sidebar-foreground"
          >
            <Home className="w-[18px] h-[18px] flex-shrink-0" />
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
