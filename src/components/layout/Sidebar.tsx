import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Settings, ChevronLeft, ChevronRight, Sparkles,
  FileSpreadsheet, Plus, Search, MoreHorizontal, BookOpen, Menu, X, Key,
  Folder, Pin, Trash2, Archive, ArrowLeft
} from 'lucide-react';
import { useWorkspace, ChatHistoryItem } from '@/hooks/useWorkspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Sidebar = () => {
  const {
    chats, pinChat, archiveChat, deleteChat, startNewChat,
    sidebarOpen, setSidebarOpen
  } = useWorkspace();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [chatSearch, setChatSearch] = useState('');
  const [historyView, setHistoryView] = useState<'recent' | 'archived'>('recent');
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/chat');
    }
    return location.pathname.startsWith(path);
  };

  const getCategory = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    const dateZero = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowZero.getTime() - dateZero.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 3) return '3 days ago';
    if (diffDays <= 7) return '1 week ago';
    if (diffDays <= 30) return '30 days ago';
    return 'Older';
  };

  const activeChats = chats.filter(c => !c.archived);
  const archivedChats = chats.filter(c => c.archived).filter(c =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const pinnedChats = activeChats.filter(c => c.pinned).filter(c =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );
  const unpinnedChats = activeChats.filter(c => !c.pinned).filter(c =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  // Group unpinned chats
  const groupedUnpinned: Record<string, ChatHistoryItem[]> = {
    today: [],
    'Yesterday': [],
    '3 days ago': [],
    '1 week ago': [],
    '30 days ago': [],
    'Older': []
  };

  unpinnedChats.forEach(chat => {
    const cat = getCategory(chat.timestamp);
    if (groupedUnpinned[cat]) {
      groupedUnpinned[cat].push(chat);
    } else {
      groupedUnpinned['Older'].push(chat);
    }
  });

  const renderChatItem = (chat: ChatHistoryItem) => (
    <div
      key={chat.id}
      className={cn(
        "w-full items-center justify-between px-2 py-2 rounded-lg text-left transition-all border-l-2 border-transparent group relative hover:bg-white/5",
        location.search.includes(`id=${chat.id}`) && "bg-white/5 border-l-blue-400"
      )}
    >
      <button
        onClick={() => {
          navigate(`/chat?id=${chat.id}`);
          if (isMobile) setMobileOpen(false);
        }}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-[11px] text-white font-medium truncate pr-6 group-hover:text-blue-300 transition-colors">
          {chat.title}
        </p>
        {/* <span className="text-[9px] text-muted-foreground font-light">
          {new Date(chat.timestamp).toLocaleDateString()}
        </span> */}
      </button>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-[#0e0e11] border-white/5 text-white">
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); pinChat(chat.id); }}
              className="hover:bg-white/5 cursor-pointer text-xs flex items-center"
            >
              <Pin className="w-3 h-3 mr-2 text-blue-400" />
              {chat.pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); archiveChat(chat.id); }}
              className="hover:bg-white/5 cursor-pointer text-xs flex items-center"
            >
              <Archive className="w-3 h-3 mr-2 text-emerald-400" />
              {chat.archived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
              className="hover:bg-white/5 cursor-pointer text-xs text-red-400 focus:text-red-400 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const SidebarInner = () => (
    <div className="flex flex-col h-full bg-[#0b0b0d] text-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <AnimatePresence>
          {(sidebarOpen || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-xs font-bold text-white tracking-widest uppercase">Eruwa</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">AI Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-muted-foreground hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Nav Section */}
      <div className="py-4 px-2 space-y-1 flex-shrink-0">
        {/* AI Chat */}
        <a
          href="/"
          onClick={(e) => { 
            e.preventDefault(); 
            navigate('/chat'); 
            if (isMobile) setMobileOpen(false); 
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group",
            isActive('/') && !isActive('/projects') && !isActive('/settings') && !isActive('/cereva') && !isActive('/office')
              ? "bg-white/5 text-white border border-white/10 shadow-[0_4px_12px_rgba(255,255,255,0.02)]" 
              : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          <MessageSquare className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive('/') && !isActive('/projects') && !isActive('/settings') && !isActive('/cereva') && !isActive('/office') ? "text-blue-400" : "group-hover:text-white")} />
          {(sidebarOpen || isMobile) && <span className="truncate flex-1">AI Chat</span>}
          {(sidebarOpen || isMobile) && (
            <button
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                startNewChat(); 
                navigate('/chat'); 
              }}
              className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              title="New Chat"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </a>

        {/* Cereva */}
        <a
          href="/cereva"
          onClick={(e) => {
            e.preventDefault();
            navigate('/cereva');
            if (isMobile) setMobileOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group",
            isActive('/cereva')
              ? "bg-emerald-500/5 text-white border border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.03)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          <BookOpen className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive('/cereva') ? "text-emerald-400" : "group-hover:text-emerald-400")} />
          {(sidebarOpen || isMobile) && <span className="truncate flex-1">Cereva (AI Teacher)</span>}
          {(sidebarOpen || isMobile) && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
        </a>

        {/* Office Suite */}
        <a
          href="/office"
          onClick={(e) => {
            e.preventDefault();
            navigate('/office');
            if (isMobile) setMobileOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group",
            isActive('/office')
              ? "bg-yellow-500/5 text-white border border-yellow-500/20 shadow-[0_4px_12px_rgba(234,179,8,0.03)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
          )}
        >
          <FileSpreadsheet className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive('/office') ? "text-yellow-400" : "group-hover:text-yellow-400")} />
          {(sidebarOpen || isMobile) && <span className="truncate flex-1">Office Studio</span>}
          {(sidebarOpen || isMobile) && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
        </a>

        {/* Archive folder (placed under Cereva and Office) */}
        {(sidebarOpen || isMobile) && (
          <button
            onClick={() => setHistoryView(prev => prev === 'recent' ? 'archived' : 'recent')}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group border border-transparent",
              historyView === 'archived'
                ? "bg-white/5 text-white border-white/10"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <Folder className={cn("w-4 h-4 flex-shrink-0 transition-colors", historyView === 'archived' ? "text-blue-400" : "group-hover:text-blue-400")} />
            <span className="truncate flex-1 text-left">Archived Chats</span>
            <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground font-mono">
              {chats.filter(c => c.archived).length}
            </span>
          </button>
        )}
      </div>

      {/* Expanded Chat History Section */}
      {(sidebarOpen || isMobile) ? (
        <div className="flex items-center gap-2 px-4 mt-2 mb-2 flex-shrink-0">
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            {historyView === 'archived' ? 'Archived Chats' : 'Recent Chats'}
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
      ) : (
        <div className="my-2 mx-4 h-px bg-white/5 flex-shrink-0" />
      )}

      {/* History scrollable list */}
      {(sidebarOpen || isMobile) ? (
        <div className="flex-1 min-h-0 flex flex-col px-2 overflow-hidden">
          {/* Search bar inside history */}
          <div className="px-2 mb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder={historyView === 'archived' ? "Search archives..." : "Search history..."}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#0e0e11] border border-white/5 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-blue-500/30 transition-colors"
              />
            </div>
          </div>
          
          {/* List area */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {historyView === 'archived' ? (
              <>
                <button
                  onClick={() => setHistoryView('recent')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-[10px] text-blue-400 hover:bg-white/5 transition-all mb-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to recent chats
                </button>
                {archivedChats.map(renderChatItem)}
                {archivedChats.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-6 font-light">No archived chats found</p>
                )}
              </>
            ) : (
              <>
                {/* Pinned Chats Section */}
                {pinnedChats.length > 0 && (
                  <div className="mb-4 space-y-1">
                    <p className="text-[8px] font-bold text-blue-400/60 uppercase tracking-widest px-3 mb-1.5">Pinned</p>
                    {pinnedChats.map(renderChatItem)}
                  </div>
                )}

                {/* Normal Chats by date categories */}
                {Object.entries(groupedUnpinned).map(([groupName, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={groupName} className="space-y-1">
                      {groupName !== 'today' && (
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest px-3 mt-3 mb-1">
                          {groupName}
                        </p>
                      )}
                      {items.map(renderChatItem)}
                    </div>
                  );
                })}

                {activeChats.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-6 font-light">No active sessions found</p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Bottom Nav Links */}
      <div className="border-t border-white/5 p-2 space-y-0.5 flex-shrink-0">
        {[
          { path: '/settings', icon: Settings, label: 'Settings' },
        ].map(item => (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => { e.preventDefault(); navigate(item.path); if (isMobile) setMobileOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 hover:bg-white/5",
              isActive(item.path) ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive(item.path) && "text-blue-400")} />
            {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
          </a>
        ))}
      </div>

      {/* User profile footer */}
      <div className="border-t border-white/5 p-3 flex items-center gap-3 flex-shrink-0 bg-[#08080a]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
          JD
        </div>
        {(sidebarOpen || isMobile) && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">IIkiogha</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">Student Pro</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-45 w-9 h-9 rounded-lg bg-[#0e0e11] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors text-white"
        >
          <Menu className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-45" onClick={() => setMobileOpen(false)} />
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col border-r border-white/5 overflow-hidden"
              >
                <SidebarInner />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 250 : 64 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen flex-shrink-0 flex flex-col border-r border-white/5 overflow-hidden relative z-30"
    >
      <SidebarInner />
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0b0b0d] border border-white/5 flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors z-35 text-muted-foreground"
        style={{ right: -10 }}
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </motion.aside>
  );
};
