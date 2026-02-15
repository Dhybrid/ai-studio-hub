import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Globe, Smartphone, Image, Settings,
  History, FolderOpen, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { useWorkspace, WorkspaceMode } from '@/hooks/useWorkspace';
import { cn } from '@/lib/utils';

const navItems: { icon: React.ElementType; label: string; mode: WorkspaceMode; path: string }[] = [
  { icon: MessageSquare, label: 'AI Chat', mode: 'chat', path: '/' },
  { icon: Globe, label: 'Web Builder', mode: 'web-builder', path: '/web-builder' },
  { icon: Smartphone, label: 'Mobile Builder', mode: 'mobile-builder', path: '/mobile-builder' },
  { icon: Image, label: 'Image Studio', mode: 'image-studio', path: '/image-studio' },
];

const bottomItems: { icon: React.ElementType; label: string; path: string; mode?: WorkspaceMode }[] = [
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings', mode: 'settings' },
];

export const Sidebar = () => {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (item: typeof navItems[0]) => {
    setMode(item.mode);
    navigate(item.path);
  };

  const handleBottomNav = (item: typeof bottomItems[0]) => {
    if (item.mode) setMode(item.mode);
    navigate(item.path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden"
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
              <p className="text-sm font-semibold text-foreground">NexusAI</p>
              <p className="text-[11px] text-sidebar-muted">Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col py-3 px-2 gap-1 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => handleNav(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                "hover:bg-surface-hover",
                isActive(item.path)
                  ? "bg-surface-active text-foreground font-medium"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive(item.path) && "text-accent")} />
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
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-[3px] h-6 bg-accent rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleBottomNav(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                "hover:bg-surface-hover",
                isActive(item.path)
                  ? "bg-surface-active text-foreground font-medium"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
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
        className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
        style={{ left: sidebarOpen ? 254 : 58 }}
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
};
