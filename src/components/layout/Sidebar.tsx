import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Globe, Smartphone, Image, Settings,
  History, FolderOpen, ChevronLeft, ChevronRight, Sparkles, ExternalLink,
  Video, Music, FileSpreadsheet, Plus, Search, MoreHorizontal, BookOpen
} from 'lucide-react';
import { useWorkspace, WorkspaceMode } from '@/hooks/useWorkspace';
import { cn } from '@/lib/utils';

const builderItems: { icon: React.ElementType; label: string; path: string }[] = [
  { icon: Globe, label: 'Web Builder', path: '/web-builder' },
  { icon: Smartphone, label: 'Mobile Builder', path: '/mobile-builder' },
  { icon: Image, label: 'Image Studio', path: '/image-studio' },
  { icon: Video, label: 'Video Studio', path: '/video-studio' },
  { icon: Music, label: 'Audio Studio', path: '/audio-studio' },
  { icon: FileSpreadsheet, label: 'Office', path: '/office' },
];

interface ChatHistoryItem {
  id: string;
  title: string;
  time: string;
}

const mockChatHistory: ChatHistoryItem[] = [
  { id: 'c1', title: 'React hooks explained', time: '2h ago' },
  { id: 'c2', title: 'TypeScript generics', time: '5h ago' },
  { id: 'c3', title: 'Building a REST API', time: '1d ago' },
  { id: 'c4', title: 'CSS Grid vs Flexbox', time: '2d ago' },
  { id: 'c5', title: 'Next.js migration', time: '3d ago' },
  { id: 'c6', title: 'Database indexing', time: '1w ago' },
];

export const Sidebar = () => {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [chatSearch, setChatSearch] = useState('');

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const filteredHistory = mockChatHistory.filter((c) =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

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

        {/* AI Chat */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setMode('chat');
            navigate('/');
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 relative",
            "hover:bg-surface-hover",
            isActive('/') && !isActive('/projects') && !isActive('/settings') && !isActive('/history')
              ? "bg-surface-active text-foreground font-medium"
              : "text-sidebar-foreground"
          )}
        >
          <MessageSquare className={cn("w-[18px] h-[18px] flex-shrink-0", isActive('/') && !isActive('/projects') && !isActive('/settings') && !isActive('/history') && "text-accent")} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate flex-1">
                AI Chat
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/');
              }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          {isActive('/') && !isActive('/projects') && !isActive('/settings') && !isActive('/history') && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 w-[3px] h-6 bg-accent rounded-r-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </a>

        {/* Cereva - opens new tab */}
        <a
          href="/cereva"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
            "hover:bg-surface-hover text-sidebar-foreground"
          )}
        >
          <BookOpen className={cn("w-[18px] h-[18px] flex-shrink-0 text-emerald-500")} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate flex-1">
                Cereva
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <ExternalLink className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
          )}
        </a>

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
          {builderItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                "hover:bg-surface-hover text-sidebar-foreground"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate flex-1">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {sidebarOpen && (
                <ExternalLink className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
              )}
            </a>
          ))}
        </div>

        {/* Divider + Chat History */}
        {sidebarOpen ? (
          <div className="flex items-center gap-2 px-3 mt-3 mb-1">
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Chat History</span>
            <div className="flex-1 h-px bg-sidebar-border" />
          </div>
        ) : (
          <div className="my-2 mx-3 h-px bg-sidebar-border" />
        )}

        {/* Chat History */}
        {sidebarOpen && (
          <div>
            <div className="px-2 mb-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-6 pr-2 py-1 rounded-md bg-surface border border-sidebar-border text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-0.5">
              {filteredHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors hover:bg-surface-hover group"
                >
                  <MessageSquare className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                  <span className="text-[11px] text-sidebar-foreground truncate flex-1">{chat.title}</span>
                  <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 group-hover:hidden">{chat.time}</span>
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 hidden group-hover:block" />
                </button>
              ))}
              {filteredHistory.length === 0 && (
                <p className="text-[10px] text-muted-foreground/50 text-center py-2">No chats found</p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Bottom items */}
        <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
          <a
            href="/history"
            onClick={(e) => {
              e.preventDefault();
              navigate('/history');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              "hover:bg-surface-hover",
              isActive('/history') ? "bg-surface-active text-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            <History className={cn("w-[18px] h-[18px] flex-shrink-0", isActive('/history') && "text-accent")} />
            {sidebarOpen && <span className="truncate">History</span>}
          </a>
          <a
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              navigate('/projects');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              "hover:bg-surface-hover",
              isActive('/projects') ? "bg-surface-active text-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            <FolderOpen className={cn("w-[18px] h-[18px] flex-shrink-0", isActive('/projects') && "text-accent")} />
            {sidebarOpen && <span className="truncate">Projects</span>}
          </a>
          <a
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              setMode('settings');
              navigate('/settings');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              "hover:bg-surface-hover",
              isActive('/settings') ? "bg-surface-active text-foreground font-medium" : "text-sidebar-foreground"
            )}
          >
            <Settings className={cn("w-[18px] h-[18px] flex-shrink-0", isActive('/settings') && "text-accent")} />
            {sidebarOpen && <span className="truncate">Settings</span>}
          </a>
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
