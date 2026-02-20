import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Globe, Smartphone, Image, Settings,
  History, FolderOpen, ChevronLeft, ChevronRight, Sparkles, ExternalLink
} from 'lucide-react';
import { useWorkspace, WorkspaceMode } from '@/hooks/useWorkspace';
import { cn } from '@/lib/utils';

// Chat & History stay in-app (same tab)
const inAppItems: { icon: React.ElementType; label: string; mode: WorkspaceMode | 'history'; path: string }[] = [
  { icon: MessageSquare, label: 'AI Chat', mode: 'chat', path: '/' },
  { icon: History, label: 'History', mode: 'history', path: '/history' },
];

// Builders open in a new tab
const builderItems: { icon: React.ElementType; label: string; mode: WorkspaceMode; path: string }[] = [
  { icon: Globe, label: 'Web Builder', mode: 'web-builder', path: '/web-builder' },
  { icon: Smartphone, label: 'Mobile Builder', mode: 'mobile-builder', path: '/mobile-builder' },
  { icon: Image, label: 'Image Studio', mode: 'image-studio', path: '/image-studio' },
];

const bottomItems: { icon: React.ElementType; label: string; path: string; mode?: WorkspaceMode }[] = [
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Settings, label: 'Settings', path: '/settings', mode: 'settings' },
];

export const Sidebar = () => {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useWorkspace();
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden relative"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-accent-foreground" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-semibold text-foreground tracking-tight">COXMOX</p>
              <p className="text-[11px] text-sidebar-muted">AI Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col py-3 px-2 gap-1 overflow-y-auto">

        {/* In-app items: Chat + History */}
        <div className="space-y-0.5">
          {inAppItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.mode}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.mode !== 'history') setMode(item.mode as WorkspaceMode);
                  window.location.href = item.path;
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative",
                  "hover:bg-surface-hover",
                  active
                    ? "bg-surface-active text-foreground font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-accent")} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-[3px] h-6 bg-accent rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Divider + Builders label */}
        {sidebarOpen ? (
          <div className="flex items-center gap-2 px-3 mt-3 mb-1">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Builders</span>
            <div className="flex-1 h-px bg-sidebar-border" />
          </div>
        ) : (
          <div className="my-2 mx-3 h-px bg-sidebar-border" />
        )}

        {/* Builder items — open in new tab */}
        <div className="space-y-0.5">
          {builderItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.mode}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative",
                  "hover:bg-surface-hover",
                  active
                    ? "bg-surface-active text-foreground font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-accent")} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarOpen && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Bottom items */}
        <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
          {bottomItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.mode) setMode(item.mode);
                  window.location.href = item.path;
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                  "hover:bg-surface-hover",
                  active
                    ? "bg-surface-active text-foreground font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", active && "text-accent")} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom User */}
      <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
          JD
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Pro</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
        style={{ left: sidebarOpen ? 254 : 58 }}
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};
