import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip, Mic, Image, Sparkles, Search, Plus,
  Home, Compass, BookOpen, Clock, ChevronDown, Check, ArrowRight,
  PanelLeftClose, PanelLeft, ArrowUp, CornerDownRight, FileText,
  Table, Presentation, FileCheck, Bot, LayoutGrid, Briefcase, ExternalLink,
  RotateCw, Copy, AlertCircle, Wrench, Shield, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWorkspace, ChatHistoryItem } from '@/hooks/useWorkspace';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { routeAgent } from '@/lib/agentApi';
import { CodeSnippet, estimateTokens, extractCodeSnippets } from '@/lib/markdown';
import RichMarkdown from '@/components/chat/RichMarkdown';
import CodeSidePanel from '@/components/chat/CodeSidePanel';
import OfficeSidePanel from '@/components/chat/OfficeSidePanel';
import { CoxmoxProcessingLogo } from '@/components/icons/CoxmoxProcessingLogo';
import {
  WordIcon, ExcelIcon, PowerPointIcon, PdfIcon, CerevaRobotIcon, OfficeSuiteIcon
} from '@/components/browser/AppIcons';
import { InteractiveCursorBackground } from '@/components/ui/InteractiveCursorBackground';

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

// Preset interactive suggestion prompts matching the mockup
const SUGGESTIONS = [
  'Help me draft a comprehensive business proposal for our renewable energy initiative',
  'Build a Sheet financial model forecasting quarterly revenue and margins',
  'Create an executive Slide deck outlining our 2026 AI roadmap',
  'Summarize the key compliance obligations from our vendor agreement PDF',
];

export const EruwaUnifiedWorkspace = () => {
  const {
    chats,
    addChat,
    updateChatMessages,
    chatKey,
    startNewChat,
  } = useWorkspace();
  const { activeTab, updateTab, activeProfile, openTab } = useBrowserTabs();

  // Sidebar is hidden by default per user request
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [activeNav, setActiveNav] = useState<'home' | 'explore' | 'apps' | 'history'>('home');
  // Input focus and typing state
  const [isInputFocused, setIsInputFocused] = useState(false);

  // App right-click context menu
  const [appContextMenu, setAppContextMenu] = useState<{
    x: number;
    y: number;
    title: string;
    type: any;
  } | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setAppContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  // Mouse coordinates for cursor-following border glow
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Office & Code panels
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>();
  const [officePanelOpen, setOfficePanelOpen] = useState(false);
  const [officePanelType, setOfficePanelType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [officePanelTitle, setOfficePanelTitle] = useState('');
  const [officePanelContent, setOfficePanelContent] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPromptRun = useRef(false);

  // Synchronize active chat messages
  useEffect(() => {
    if (selectedChatId) {
      const chat = chats.find((c) => c.id === selectedChatId);
      if (chat) {
        setMessages(chat.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [selectedChatId, chats]);

  // Reset when new chat signal is triggered
  useEffect(() => {
    if (chatKey > 0) {
      setSelectedChatId(null);
      setMessages([]);
      setInput('');
      setImageAttachments([]);
      setIsStreaming(false);
    }
  }, [chatKey]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Scroll to bottom when messages stream
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle cursor glow movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Handle send message
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;
    const attachedImages = imageAttachments;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: attachedImages.length ? `${text}\n\n[${attachedImages.length} image attached]` : text,
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
      const title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      activeChatId = addChat(title, nextMessages);
      setSelectedChatId(activeChatId);
      if (activeTab) {
        updateTab(activeTab.id, { title: title.slice(0, 22) });
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
      const errorText = 'I could not reach the server. Please try again.';
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

  // Consume initialPrompt if routed from another source
  useEffect(() => {
    if (activeTab?.initialPrompt && !initialPromptRun.current) {
      initialPromptRun.current = true;
      const p = activeTab.initialPrompt;
      updateTab(activeTab.id, { initialPrompt: undefined });
      handleSend(p);
    }
  }, [activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setInput('');
    setImageAttachments([]);
    startNewChat();
    textareaRef.current?.focus();
  };

  // Filtered and grouped conversations for sidebar
  const filteredChats = useMemo(() => {
    return chats.filter((c) =>
      c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
  }, [chats, sidebarSearch]);

  const groupedChats = useMemo(() => {
    const today: ChatHistoryItem[] = [];
    const sevenDays: ChatHistoryItem[] = [];
    const older: ChatHistoryItem[] = [];

    const now = Date.now();
    filteredChats.forEach((chat) => {
      const diffDays = Math.floor((now - new Date(chat.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) today.push(chat);
      else if (diffDays <= 7) sevenDays.push(chat);
      else older.push(chat);
    });

    return { today, sevenDays, older };
  }, [filteredChats]);

  const codeSnippets = useMemo(() => {
    return messages.flatMap((m) => (m.role === 'assistant' ? extractCodeSnippets(m.content) : []));
  }, [messages]);

  const openCode = (snippet: CodeSnippet) => {
    setSelectedCodeId(snippet.id);
    setCodePanelOpen(true);
    setOfficePanelOpen(false);
  };

  // App shortcuts matching the 5 applications
  const APPS = [
    {
      id: 'word',
      name: 'Documents',
      desc: 'Create and edit text documents',
      icon: WordIcon,
      type: 'word' as const,
    },
    {
      id: 'excel',
      name: 'Sheet',
      desc: 'Analyze & manage spreadsheets',
      icon: ExcelIcon,
      type: 'excel' as const,
    },
    {
      id: 'powerpoint',
      name: 'Slide',
      desc: 'Build dynamic presentations',
      icon: PowerPointIcon,
      type: 'powerpoint' as const,
    },
    {
      id: 'pdf',
      name: 'PDF',
      desc: 'View & annotate PDF files',
      icon: PdfIcon,
      type: 'pdf' as const,
    },
    {
      id: 'cereva',
      name: 'Cereva',
      desc: 'Your AI voice assistant',
      icon: CerevaRobotIcon,
      type: 'cereva' as const,
    },
  ];

  // Complete Tools & Applications Catalog (Unified Suite)
  const ALL_TOOLS_AND_APPS = [
    {
      id: 'office',
      name: 'Office Studio',
      desc: 'Unified suite for documents, spreadsheets, presentations, and PDF management.',
      icon: OfficeSuiteIcon,
      type: 'office' as const,
      category: 'Productivity Suite',
      badge: 'Integrated',
    },
    {
      id: 'word',
      name: 'Eruwa Documents',
      desc: 'Smart rich-text authoring with AI drafting, outline creation, and template styling.',
      icon: WordIcon,
      type: 'word' as const,
      category: 'Document Editor',
      badge: 'Ready',
    },
    {
      id: 'excel',
      name: 'Eruwa Sheet',
      desc: 'Financial models, tabular analysis, formula automation, and forecasting engine.',
      icon: ExcelIcon,
      type: 'excel' as const,
      category: 'Spreadsheets',
      badge: 'Ready',
    },
    {
      id: 'powerpoint',
      name: 'Eruwa Slide',
      desc: 'Create captivating pitch decks, conference presentations, and interactive slides.',
      icon: PowerPointIcon,
      type: 'powerpoint' as const,
      category: 'Presentations',
      badge: 'Ready',
    },
    {
      id: 'pdf',
      name: 'Eruwa PDF',
      desc: 'Fast PDF viewer, inline annotation, semantic summarization, and table extraction.',
      icon: PdfIcon,
      type: 'pdf' as const,
      category: 'PDF Tools',
      badge: 'Ready',
    },
    {
      id: 'cereva',
      name: 'Cereva Voice',
      desc: 'Bidirectional conversational voice assistant powered by neural speech models.',
      icon: CerevaRobotIcon,
      type: 'cereva' as const,
      category: 'AI Voice',
      badge: 'Ready',
    },
  ];

  return (
    <div className="flex h-full w-full bg-[#FAFBFD] dark:bg-[#08080a] text-slate-800 dark:text-slate-100 transition-colors overflow-hidden select-none relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setImageAttachments([
                { id: `${Date.now()}`, name: file.name, type: file.type, url: String(reader.result) }
              ]);
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* Floating Toggle Sidebar Button (Accessible at all times) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        className="absolute top-3 left-3 z-30 p-2 rounded-xl bg-white/90 dark:bg-[#0b0b0d]/90 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 shadow-sm backdrop-blur-md transition-all hover:scale-105"
      >
        {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </button>

      {/* ========================================================= */}
      {/* 1. COLLAPSIBLE OVERLAY DRAWER SIDEBAR (DOES NOT SHRINK MAIN SCREEN) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="absolute inset-y-0 left-0 w-72 sm:w-80 h-full flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-[#FAFBFD]/98 dark:bg-[#0b0b0d]/98 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Sidebar Brand Header */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <img src="/favicon.png" alt="Eruwa" className="w-6 h-6 object-contain" />
                  <span className="font-extrabold text-base tracking-tight text-[#111827] dark:text-white">
                    Eruwa AI
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleStartNewChat}
                    title="New conversation"
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    title="Close sidebar"
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Search conversations */}
            <div className="px-4 py-3">
              <div className="relative flex items-center bg-[#F3F4F6] dark:bg-slate-900/80 rounded-xl px-3 py-2 border border-slate-200/50 dark:border-slate-800/50">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search history"
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none font-normal"
                />
              </div>
            </div>

            {/* Navigation pills: Home, Explore, Library, History */}
            <div className="px-3 space-y-0.5 mb-3">
              <button
                onClick={() => {
                  setActiveNav('home');
                  handleStartNewChat();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                  activeNav === 'home' && messages.length === 0
                    ? "bg-white dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Home className="w-4 h-4" />
                <span>Home Explorer</span>
              </button>

              <button
                onClick={() => setActiveNav('explore')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                  activeNav === 'explore'
                    ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Compass className="w-4 h-4" />
                <span>Explore Tools</span>
              </button>

              <button
                onClick={() => {
                  openTab({ type: 'office', title: 'Office Studio — Eruwa' });
                  setSidebarOpen(false);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAppContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    title: 'Office Studio',
                    type: 'office',
                  });
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                  activeTab?.type === 'office'
                    ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <OfficeSuiteIcon className="w-4 h-4 flex-shrink-0" />
                <span>Office</span>
              </button>

              <button
                onClick={() => setActiveNav('history')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                  activeNav === 'history'
                    ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Clock className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>

            {/* Sidebar Content: Either Tools view OR Conversation history */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 no-scrollbar">
              {activeNav === 'explore' ? (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 px-1">
                    Tools & Applications Suite
                  </div>
                  <div className="space-y-1.5">
                    {APPS.map((app) => {
                      const Icon = app.icon;
                      return (
                        <button
                          key={app.id}
                          onClick={() => {
                            openTab({ type: app.type, title: `${app.name} — Eruwa` });
                            setSidebarOpen(false);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAppContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              title: app.name,
                              type: app.type,
                            });
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#0e0e12] border border-slate-200/60 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all text-left group shadow-2xs"
                        >
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {app.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {app.desc}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {groupedChats.today.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                        Recent
                      </div>
                      <div className="space-y-0.5">
                        {groupedChats.today.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors block",
                              selectedChatId === chat.id
                                ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/40"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                            )}
                          >
                            {chat.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedChats.sevenDays.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                        7 Days Ago
                      </div>
                      <div className="space-y-0.5">
                        {groupedChats.sevenDays.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors block",
                              selectedChatId === chat.id
                                ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/40"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                            )}
                          >
                            {chat.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Profile Card at Sidebar Bottom */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {activeProfile?.avatar ? (
                      <img src={activeProfile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{activeProfile?.initials || 'IR'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      {activeProfile?.name || 'Ikiogha Riches'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {activeProfile?.email || 'ikioghariches09@gmail.com'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. MAIN BROWSER CONTENT CANVAS */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[#FAFBFD] dark:bg-[#08080a] transition-colors relative overflow-y-auto no-scrollbar">
        {/* Interactive Cursor-Tracking Ambient Background */}
        <InteractiveCursorBackground mode="ambient" showWaveGrid={false} intensity={0.85} />
        {messages.length === 0 ? (
          activeNav === 'explore' ? (
            /* ========================================================= */
            /* VIEW A2: ALL TOOLS & APPLICATIONS CATALOG (UNDER WORK) */
            /* ========================================================= */
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-20 flex flex-col items-center">
              {/* Back to chat navigation header */}
              <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10">
                <button
                  onClick={() => setActiveNav('home')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0b0b0d] border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:scale-102"
                >
                  <Home className="w-3.5 h-3.5 text-blue-500" />
                  <span>Return to Search & Chat</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Wrench className="w-3 h-3" />
                    <span>Suite Under Active Development</span>
                  </span>
                </div>
              </div>

              {/* Title & Introduction */}
              <div className="w-full mb-8 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Tools & Applications Hub
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      All tools and applications share the unified Eruwa AI engine. Right-click any app to open in a new tab or window.
                    </p>
                  </div>
                </div>

                {/* Information banner */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent border border-blue-200/60 dark:border-blue-500/20 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-white">Unified Workspace: </span>
                    Tools and applications form a single cohesive catalog under active development. Each tool can run inside browser tabs or standalone windows, fully synchronized with your session state.
                  </div>
                </div>
              </div>

              {/* Grid of Tools and Apps */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_TOOLS_AND_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <div
                      key={app.id}
                      onClick={() => openTab({ type: app.type, title: `${app.name} — Eruwa` })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAppContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          title: app.name,
                          type: app.type,
                        });
                      }}
                      className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0b0b0d] border border-slate-200/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center transition-transform group-hover:scale-108">
                            <Icon className="w-7 h-7" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {app.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {app.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">
                          {app.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW A1: BROWSER HOME PAGE (EXACT MATCH TO REFERENCE MOCKUP) */
            /* ========================================================= */
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20 flex flex-col items-center">
            {/* Center Logo & Title */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex items-center justify-center gap-3.5 mb-3">
                <img
                  src="/favicon.png"
                  alt="Eruwa AI"
                  className="w-12 h-12 object-contain drop-shadow-sm transition-transform hover:scale-105"
                />
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Eruwa AI
                </h1>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
                What can I help you explore?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                Ask anything. Research deeply. Create something useful.
              </p>
            </div>

            {/* Glowing Border Input Card with Vibrant Cursor Tracking Aura */}
            <div
              onMouseMove={handleMouseMove}
              className="w-full relative group rounded-[28px] p-[2.5px] transition-all duration-300 mb-2 shadow-[0_10px_40px_rgba(56,189,248,0.18)] dark:shadow-[0_15px_50px_rgba(56,189,248,0.22)]"
              style={{
                background: `radial-gradient(440px circle at ${mousePos.x}% ${mousePos.y}%, #38BDF8 0%, #818CF8 26%, #C084FC 50%, #F472B6 72%, rgba(56, 189, 248, 0.3) 100%)`
              }}
            >
              {/* Vibrant ambient glow halo behind the card */}
              <div 
                className="absolute -inset-1 rounded-[30px] opacity-75 blur-lg pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(420px circle at ${mousePos.x}% ${mousePos.y}%, rgba(56, 189, 248, 0.7), rgba(168, 85, 247, 0.65), rgba(244, 63, 94, 0.55), transparent 75%)`
                }}
              />
              <div className="w-full relative rounded-[25.5px] bg-white dark:bg-slate-900/95 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_12px_36px_rgba(0,0,0,0.06)] p-4 sm:p-5 flex flex-col justify-between min-h-[120px] backdrop-blur-xl">
                {/* Input area */}
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 250)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Eruwa anything..."
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-40 font-normal leading-relaxed"
                />

                {/* Bottom Bar: Attachments on left, Mic + Send Button on right */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Upload image"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.info('Voice input is listening. Speak your query into your microphone.')}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md disabled:opacity-30 transition-all flex-shrink-0 active:scale-95"
                      title="Send query"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Suggestions: Appears when clicking (focused) or typing */}
            <AnimatePresence>
              {(isInputFocused || input.trim().length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full space-y-1.5 mt-2 mb-6 px-1 overflow-hidden"
                >
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSend(sug);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200/40 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] backdrop-blur-md transition-all group border border-slate-200/50 dark:border-slate-800/60 shadow-2xs"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-500/70 group-hover:text-blue-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                      <span className="truncate">{sug}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full h-8" />

            {/* "Your apps" Section (5 application cards from mockup) */}
            <div className="w-full mb-9">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Your apps
                </span>
                <button
                  onClick={() => {
                    setActiveNav('explore');
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore all tools & apps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => openTab({ type: app.type, title: `${app.name} — Eruwa` })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAppContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          title: app.name,
                          type: app.type,
                        });
                      }}
                      className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-[#0b0b0d] border border-slate-200/70 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-2xs hover:shadow-md transition-all duration-150 group text-left cursor-pointer"
                    >
                      <div className="w-9 h-9 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-108">
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-0.5">
                        {app.name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                        {app.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "Recent" Section (2-column cards from mockup) */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Recent
                </span>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {groupedChats.today.slice(0, 6).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">
                          {chat.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Recently active
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))}

                {groupedChats.today.length === 0 && (
                  <div className="col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400">
                    Your recent documents, spreadsheets, and conversations will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
          )
        ) : (
          /* ========================================================= */
          /* VIEW B: ACTIVE CHAT CONVERSATION STREAM */
          /* ========================================================= */
          <div className="flex-1 flex flex-col min-h-0 h-full">
            {/* Minimal Chat Top Bar: Return to Home / New Search + Active Model Info */}
            <div className="h-12 px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex-shrink-0 z-10 pl-16">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartNewChat}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Home className="w-3 h-3" />
                  <span>Home Explorer</span>
                </button>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                  {selectedChatId ? chats.find(c => c.id === selectedChatId)?.title || 'Conversation' : 'New Query'}
                </span>
              </div>

              <button
                onClick={handleStartNewChat}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
              >
                <Plus className="w-3 h-3" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
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
                          {isStreaming && msg.id === messages[messages.length - 1]?.id ? (
                            <CoxmoxProcessingLogo size={28} isProcessing={true} />
                          ) : (
                            <img src="/favicon.png" alt="Eruwa" className="w-6 h-6 object-contain" />
                          )}
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3.5 max-w-[85%] text-sm leading-relaxed",
                          msg.role === 'user'
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs"
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className={cn(
                            "prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-500",
                            isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor"
                          )}>
                            <RichMarkdown content={msg.content} onOpenCode={openCode} />
                          </div>
                        ) : (
                          <p className="font-normal whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-xs">
                          {activeProfile?.initials || 'IR'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Animated Logo While Processing */}
                {isStreaming && (
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs ml-9">
                    <CoxmoxProcessingLogo size={22} isProcessing={true} />
                    <span>Eruwa AI is processing your request...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Bottom Input Field in Chat */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
              <div className="max-w-3xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs">
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Attach"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Eruwa AI..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-32"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-30 transition-all flex-shrink-0"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Code Side Panel */}
      <CodeSidePanel
        open={codePanelOpen}
        snippets={codeSnippets}
        selectedId={selectedCodeId}
        onSelect={setSelectedCodeId}
        onClose={() => setCodePanelOpen(false)}
      />

      {/* Office Side Panel */}
      <OfficeSidePanel
        open={officePanelOpen}
        onClose={() => setOfficePanelOpen(false)}
        type={officePanelType}
        title={officePanelTitle}
        content={officePanelContent}
      />

      {/* App & Office Right-Click Context Menu */}
      {appContextMenu && (
        <div
          style={{ top: appContextMenu.y, left: appContextMenu.x }}
          className="fixed z-50 min-w-[200px] bg-white dark:bg-[#0b0b0d] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in-50 zoom-in-95 backdrop-blur-xl select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/10 mb-1 flex items-center justify-between">
            <span>{appContextMenu.title}</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">App</span>
          </div>
          <button
            onClick={() => {
              openTab({ type: appContextMenu.type, title: `${appContextMenu.title} — Eruwa` });
              setAppContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Open in New Tab</span>
          </button>
          <button
            onClick={() => {
              window.open(window.location.origin + `?tab=${appContextMenu.type}`, '_blank');
              setAppContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open in New Window</span>
          </button>
          <button
            onClick={() => {
              if (activeTab) {
                updateTab(activeTab.id, {
                  type: appContextMenu.type,
                  title: `${appContextMenu.title} — Eruwa`,
                });
              } else {
                openTab({ type: appContextMenu.type, title: `${appContextMenu.title} — Eruwa` });
              }
              setAppContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Open in Current Tab</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EruwaUnifiedWorkspace;
