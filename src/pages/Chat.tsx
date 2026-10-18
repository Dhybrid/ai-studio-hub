import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Send, Paperclip, Square, Mic, Sparkles, Image, Edit, Search, X,
  Plus, MessageSquare, Pin, Trash2, Archive, PanelLeftClose, PanelLeftOpen,
  ChevronDown, MoreHorizontal, ArrowLeft, Bot, Sparkle, Layers, Compass, Globe, Wand2, Lightbulb, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace, ChatHistoryItem } from '@/hooks/useWorkspace';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { routeAgent } from '@/lib/agentApi';
import { CodeSnippet, estimateTokens, extractCodeSnippets } from '@/lib/markdown';
import RichMarkdown from '@/components/chat/RichMarkdown';
import CodeSidePanel from '@/components/chat/CodeSidePanel';
import OfficeSidePanel from '@/components/chat/OfficeSidePanel';
import { EruwaSparkleIcon, CoxmoxSunLogo } from '@/components/browser/AppIcons';
import { InteractiveCursorBackground } from '@/components/ui/InteractiveCursorBackground';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

interface ImageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

const ChatPage = () => {
  const {
    chats,
    addChat,
    updateChatMessages,
    chatKey,
    startNewChat,
    pinChat,
    archiveChat,
    deleteChat
  } = useWorkspace();
  const { activeTab, updateTab } = useBrowserTabs();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active chat id: query param or internal state
  const [selectedChatId, setSelectedChatId] = useState<string | null>(searchParams.get('id') || null);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>();
  
  // Office View Panel states
  const [officePanelOpen, setOfficePanelOpen] = useState(false);
  const [officePanelType, setOfficePanelType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [officePanelTitle, setOfficePanelTitle] = useState('');
  const [officePanelContent, setOfficePanelContent] = useState<any>(null);

  // Suggestion category state in empty chat canvas
  const [selectedCategory, setSelectedCategory] = useState<'Suggested' | 'Wireframe' | 'Apps' | 'Websites' | 'Prototype'>('Suggested');

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const centerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPromptRun = useRef(false);
  const isMobile = useIsMobile();

  // Responsive: collapse history on mobile by default
  useEffect(() => {
    if (isMobile) {
      setHistorySidebarOpen(false);
    }
  }, [isMobile]);

  // Load chat messages when selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      const chat = chats.find((c) => c.id === selectedChatId);
      if (chat) {
        setMessages(chat.messages || []);
        setOfficePanelOpen(false);
      }
    } else if (!activeTab?.initialPrompt) {
      setMessages([]);
      setOfficePanelOpen(false);
    }
  }, [selectedChatId, chats]);

  // Reset chat when chatKey changes (Global New Chat signal)
  useEffect(() => {
    if (chatKey > 0) {
      setSelectedChatId(null);
      setSearchParams({});
      setMessages([]);
      setInput('');
      setImageAttachments([]);
      setIsStreaming(false);
      setOfficePanelOpen(false);
    }
  }, [chatKey]);

  const codeSnippets = messages.flatMap((message) =>
    message.role === 'assistant' ? extractCodeSnippets(message.content) : []
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Resize textareas
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const el = centerTextareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;
    const attachedImages = imageAttachments;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: attachedImages.length ? `${text}\n\n[${attachedImages.length} image${attachedImages.length === 1 ? '' : 's'} attached]` : text,
      timestamp: new Date(),
      tokens: estimateTokens(text),
    };

    const assistantId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      tokens: 0,
    };

    const nextMessages = [...messages, userMsg, aiMsg];
    setMessages(nextMessages);
    setInput('');
    setImageAttachments([]);
    setIsStreaming(true);

    let activeChatId = selectedChatId;
    if (!activeChatId) {
      // Create new chat session
      const title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      activeChatId = addChat(title, nextMessages);
      setSelectedChatId(activeChatId);
      setSearchParams({ id: activeChatId });
      // Update tab title to match conversation
      if (activeTab) {
        updateTab(activeTab.id, { title: title.slice(0, 20) });
      }
    }

    try {
      const result = await routeAgent(text, {
        images: attachedImages.map((img) => ({
          url: img.url,
          name: img.name,
          type: img.type,
          detail: 'high',
        })),
      });
      const route = result.route;
      const content = result.generated_content || {};

      let reply = '';
      if (route === 'office-document') {
        reply = `I have generated the document **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('document');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-spreadsheet') {
        reply = `I have generated the spreadsheet **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('spreadsheet');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-presentation') {
        reply = `I have generated the presentation **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('presentation');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else {
        reply = String(content.reply || content.markdown || content.html || 'I could not generate a response.');
        setOfficePanelOpen(false);
      }

      const updatedMessages = nextMessages.map((message) =>
        message.id === assistantId ? { ...message, content: reply, tokens: estimateTokens(reply) } : message
      );

      setMessages(updatedMessages);
      if (activeChatId) {
        updateChatMessages(activeChatId, updatedMessages);
      }

      if (route === 'chat') {
        const snippets = extractCodeSnippets(reply);
        if (snippets.length) {
          setSelectedCodeId(snippets[0].id);
          setCodePanelOpen(true);
        }
      }
    } catch {
      const errorText = 'I could not reach the server. Server busy.';
      const updatedMessages = nextMessages.map((message) =>
        message.id === assistantId ? { ...message, content: errorText, tokens: estimateTokens(errorText) } : message
      );
      setMessages(updatedMessages);
      if (activeChatId) {
        updateChatMessages(activeChatId, updatedMessages);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  // Consume initialPrompt from activeTab or URL query parameter
  useEffect(() => {
    const promptFromTab = activeTab?.initialPrompt;
    const promptFromUrl = searchParams.get('prompt') || '';
    const routedPrompt = promptFromTab || promptFromUrl;

    if (!routedPrompt.trim() || initialPromptRun.current) return;
    initialPromptRun.current = true;

    // Clear initial prompt from active tab so switching tabs doesn't re-fire
    if (activeTab && activeTab.initialPrompt) {
      updateTab(activeTab.id, { initialPrompt: undefined });
    }

    handleSend(routedPrompt);
  }, [activeTab, searchParams]);

  const handleImageFiles = (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => /image\/(png|jpe?g)/i.test(file.type));
    if (!selected.length) return;

    selected.slice(0, 8 - imageAttachments.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || '');
        if (!url) return;
        setImageAttachments((current) => [
          ...current,
          { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, url },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const openImagePicker = () => fileInputRef.current?.click();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openCode = (snippet: CodeSnippet) => {
    const existing = codeSnippets.find((item) => item.language === snippet.language && item.code === snippet.code);
    setSelectedCodeId(existing?.id || snippet.id);
    setCodePanelOpen(true);
    setOfficePanelOpen(false);
  };

  const handleStartNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setInput('');
    setImageAttachments([]);
    setSearchParams({});
    startNewChat();
  };

  // Categorize chat history
  const getCategory = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const dateZero = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowZero.getTime() - dateZero.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Previous 7 Days';
    if (diffDays <= 30) return 'Previous 30 Days';
    return 'Older';
  };

  const filteredChats = useMemo(() => {
    return chats
      .filter((c) => !c.archived)
      .filter((c) => c.title.toLowerCase().includes(historySearch.toLowerCase()));
  }, [chats, historySearch]);

  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatHistoryItem[]> = {
      'Pinned': [],
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    filteredChats.forEach((chat) => {
      if (chat.pinned) {
        groups['Pinned'].push(chat);
      } else {
        const cat = getCategory(chat.timestamp);
        if (groups[cat]) {
          groups[cat].push(chat);
        } else {
          groups['Older'].push(chat);
        }
      }
    });

    return groups;
  }, [filteredChats]);

  // Suggestions for empty state matching Image 4
  const suggestionCategories = [
    { id: 'Suggested', label: 'Suggested', icon: Lightbulb },
    { id: 'Wireframe', label: 'Wireframe', icon: Layers },
    { id: 'Apps', label: 'Apps', icon: Compass },
    { id: 'Websites', label: 'Websites', icon: Globe },
    { id: 'Prototype', label: 'Prototype', icon: Wand2 },
  ] as const;

  const categorizedSuggestions = {
    Suggested: [
      { id: 's1', icon: Layers, text: 'A developer portfolio with dark theme, project cards, and contact form' },
      { id: 's2', icon: Compass, text: 'A modern SaaS landing page for a time-tracking app with pricing matrix' },
      { id: 's3', icon: Globe, text: 'An e-commerce homepage for a skincare brand with clean glassmorphic aesthetic' }
    ],
    Wireframe: [
      { id: 'w1', icon: Layers, text: 'Mobile onboarding flow with progress indicators and social sign-in' },
      { id: 'w2', icon: Layers, text: 'Analytics dashboard wireframe with filter controls and export modal' }
    ],
    Apps: [
      { id: 'a1', icon: Compass, text: 'Cross-platform productivity app with offline-first local synchronization' },
      { id: 'a2', icon: Compass, text: 'AI voice notes assistant with automated audio transcript summaries' }
    ],
    Websites: [
      { id: 'web1', icon: Globe, text: 'Documentation portal with real-time Algolia search and API playground' },
      { id: 'web2', icon: Globe, text: 'Interactive agency portfolio with smooth WebGL canvas animations' }
    ],
    Prototype: [
      { id: 'p1', icon: Wand2, text: 'Interactive micro-interactions prototype for checkout card payment' },
      { id: 'p2', icon: Wand2, text: 'Voice agent conversational loop with real-time streaming audio visualizer' }
    ]
  };

  return (
    <div className="flex h-full w-full bg-[#FAFBFD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => {
          handleImageFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* ========================================================= */}
      {/* 1. LEFT-HAND CHAT HISTORY SIDEBAR */}
      {/* ========================================================= */}
      <aside
        className={cn(
          "h-full flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 transition-all duration-300 z-20 flex-shrink-0 select-none",
          historySidebarOpen ? "w-64 sm:w-72" : "w-0 border-r-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header: Brand + New Chat button */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/70 flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CoxmoxSunLogo size={24} isProcessing={false} />
              <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                Chat History
              </span>
            </div>
            <button
              onClick={() => setHistorySidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close history sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Chat" Button */}
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search history input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.entries(groupedChats).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category} className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {category}
                </div>
                {items.map((chat) => {
                  const isSelected = selectedChatId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      className={cn(
                        "group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer",
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium border border-blue-200/60 dark:border-blue-800/50 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setSearchParams({ id: chat.id });
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className={cn(
                          "w-3.5 h-3.5 flex-shrink-0",
                          isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )} />
                        <span className="truncate">{chat.title}</span>
                      </div>

                      {/* Dropdown Actions for chat */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); pinChat(chat.id); }}
                              className="cursor-pointer text-xs flex items-center"
                            >
                              <Pin className="w-3 h-3 mr-2 text-blue-500" />
                              {chat.pinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); archiveChat(chat.id); }}
                              className="cursor-pointer text-xs flex items-center"
                            >
                              <Archive className="w-3 h-3 mr-2 text-emerald-500" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                                if (selectedChatId === chat.id) {
                                  setSelectedChatId(null);
                                  setMessages([]);
                                }
                              }}
                              className="cursor-pointer text-xs text-red-500 focus:text-red-500 flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No conversations found
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CHAT / CONVERSATION AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Interactive Cursor-Tracking Ambient Background */}
        <InteractiveCursorBackground mode="ambient" showWaveGrid={false} intensity={0.75} />
        {/* Top Chat Bar: Toggle Sidebar + Title */}
        <div className="h-12 border-b border-slate-200/70 dark:border-slate-800/80 px-4 flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
            {!historySidebarOpen && (
              <button
                onClick={() => setHistorySidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Open history sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">History</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <CoxmoxSunLogo size={20} isProcessing={isStreaming} />
              <span>Eruwa AI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium">
                Coxmox Omnimode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNewChat}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Content: Empty Welcome OR Messages Feed */}
        {messages.length === 0 ? (
          /* Empty State - Centered Input With Dual Rotating Coxmox Sun Logo */
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="flex justify-center mb-4">
                <CoxmoxSunLogo size={64} isProcessing={false} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Good Morning. How can I assist you today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Ask questions, generate documents, analyze code, or brainstorm ideas.
              </p>

              {/* Centered Composer with Static Glowing Border (NO SPINNING) */}
              <div className="relative mb-5 text-left">
                {/* Ambient glow halo */}
                <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-r from-blue-400/25 via-purple-400/25 to-pink-400/25 blur-lg opacity-75 pointer-events-none" />

                {/* Glowing border container */}
                <div className="relative p-[1.5px] rounded-[24px] bg-gradient-to-r from-[#38BDF8] via-[#818CF8] via-[#C084FC] to-[#F472B6] shadow-[0_8px_25px_rgba(59,130,246,0.12)]">
                  <div className="flex flex-col bg-white dark:bg-slate-900 rounded-[22.5px] p-3 sm:p-3.5 transition-colors">
                    {/* Image attachments preview */}
                    {imageAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        {imageAttachments.map((img) => (
                          <div key={img.id} className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1">
                            <img src={img.url} alt="" className="w-6 h-6 rounded object-cover" />
                            <span className="max-w-[120px] truncate text-[10px] text-slate-700 dark:text-slate-300">{img.name}</span>
                            <button
                              onClick={() => setImageAttachments((items) => items.filter((item) => item.id !== img.id))}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      ref={centerTextareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Initiate a query or send a command to Eruwa AI..."
                      rows={1}
                      className="w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base py-1 px-1 text-slate-900 dark:text-white placeholder:text-slate-400 max-h-36 font-normal leading-relaxed"
                      style={{ minHeight: '36px' }}
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={openImagePicker}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          title="Attach image"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setInput("Analyze modern web technologies and frameworks in 2026");
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          title="Voice input"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:scale-105 active:scale-95 flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions Panel (Blur + Transparent Rows Matching Image 4) */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl p-4 text-left">
                {/* Category tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                  {suggestionCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Single line suggestions */}
                <div className="space-y-1.5">
                  {categorizedSuggestions[selectedCategory].map((sug) => {
                    const Icon = sug.icon;
                    return (
                      <div
                        key={sug.id}
                        onClick={() => handleSend(sug.text)}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-slate-800/30 hover:bg-white/80 dark:hover:bg-slate-800/70 hover:backdrop-blur-md transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-3">
                          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                          <span className="text-xs font-normal truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {sug.text}
                          </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Messages Feed */
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-0.5">
                        <CoxmoxSunLogo size={32} isProcessing={isStreaming && msg.id === messages[messages.length - 1]?.id} />
                      </div>
                    )}

                    <div
                      className={cn(
                        "rounded-2xl px-5 py-4 max-w-[85%] text-sm leading-relaxed",
                        msg.role === 'user'
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className={cn(
                            "prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-500 prose-code:font-mono prose-code:text-xs",
                            isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor"
                          )}
                        >
                          <RichMarkdown content={msg.content} onOpenCode={openCode} />
                        </div>
                      ) : (
                        <p className="font-normal whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white shadow-sm">
                        U
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Streaming loading indicator with authentic dual-rotating Coxmox Sun Logo */}
              {isStreaming && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs ml-11">
                  <CoxmoxSunLogo size={22} isProcessing={true} />
                  <span className="font-normal">Eruwa is processing your query...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* Bottom Input Bar (When conversation exists) */}
        {messages.length > 0 && (
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              {/* Static glowing border wrapper */}
              <div className="relative p-[1.5px] rounded-[22px] bg-gradient-to-r from-[#38BDF8] via-[#818CF8] via-[#C084FC] to-[#F472B6] shadow-sm">
                <div className="flex flex-col bg-white dark:bg-slate-900 rounded-[20.5px] p-2.5">
                  {imageAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      {imageAttachments.map((img) => (
                        <div key={img.id} className="flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5">
                          <img src={img.url} alt="" className="w-5 h-5 rounded object-cover" />
                          <button
                            onClick={() => setImageAttachments((items) => items.filter((item) => item.id !== img.id))}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <button
                      onClick={openImagePicker}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                      title="Attach image"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message Eruwa AI..."
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-1.5 px-2 text-slate-900 dark:text-white placeholder:text-slate-400 max-h-32 font-normal leading-relaxed"
                      style={{ minHeight: '34px' }}
                    />

                    {isStreaming ? (
                      <button
                        onClick={() => setIsStreaming(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex-shrink-0"
                        title="Stop generation"
                      >
                        <Square className="w-3.5 h-3.5 fill-red-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-25 bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:scale-105 active:scale-95 flex-shrink-0"
                        title="Send message"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 font-normal">
                Eruwa AI can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Code Sidebar Panel */}
      <CodeSidePanel
        open={codePanelOpen}
        snippets={codeSnippets}
        selectedId={selectedCodeId}
        onSelect={setSelectedCodeId}
        onClose={() => setCodePanelOpen(false)}
      />

      {/* Office Workspace Sidebar Preview/Editor Panel */}
      <OfficeSidePanel
        open={officePanelOpen}
        onClose={() => setOfficePanelOpen(false)}
        type={officePanelType}
        title={officePanelTitle}
        content={officePanelContent}
      />
    </div>
  );
};

export default ChatPage;
