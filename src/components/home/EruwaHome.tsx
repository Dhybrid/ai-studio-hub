import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon, Paperclip, Mic, ArrowUp, Sparkles,
  ChevronDown, ArrowRight, ChevronRight, Search, FileText,
  FileSpreadsheet, Presentation, FileCode2, Bot, Lightbulb,
  BookOpen, Mail, FileCheck, X, Wand2, Compass, Layers, Globe
} from 'lucide-react';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import {
  EruwaSparkleIcon, WordIcon, ExcelIcon, PowerPointIcon,
  PdfIcon, CerevaRobotIcon, CoxmoxSunLogo
} from '../browser/AppIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const EruwaHome = () => {
  const { openTab, composerText, setComposerText } = useBrowserTabs();
  const [selectedMode, setSelectedMode] = useState<'AI Mode' | 'Deep Research' | 'Code Assistant' | 'Summary Mode'>('AI Mode');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);

  // Dynamic cursor position tracking for interactive glow effect
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const composerContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mouse move handler for cursor-following border glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!composerContainerRef.current) return;
    const rect = composerContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [composerText]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (composerContainerRef.current && !composerContainerRef.current.contains(e.target as Node)) {
        setIsComposerFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsComposerFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePromptSubmit = (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const query = (overridePrompt ?? composerText).trim();
    if (!query) return;

    setIsComposerFocused(false);
    setComposerText('');

    // Open chat tab with initialPrompt so GPT immediately streams response
    openTab({
      type: 'chat',
      title: query.slice(0, 24) + (query.length > 24 ? '...' : ''),
      initialPrompt: query,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      const sample = 'Analyze renewable energy transition in 2026';
      setComposerText(composerText ? `${composerText} ${sample}` : sample);
      setIsListening(false);
    }, 1800);
  };

  // Category tags for suggestion box matching reference image
  const [selectedCategory, setSelectedCategory] = useState<'Suggested' | 'Wireframe' | 'Apps' | 'Websites' | 'Prototype'>('Suggested');

  const suggestionCategories = [
    { id: 'Suggested', label: 'Suggested', icon: Lightbulb },
    { id: 'Wireframe', label: 'Wireframe', icon: Layers },
    { id: 'Apps', label: 'Apps', icon: Compass },
    { id: 'Websites', label: 'Websites', icon: Globe },
    { id: 'Prototype', label: 'Prototype', icon: Wand2 },
  ] as const;

  // Single horizontal line suggestions (transparent with blur, no harsh box borders) matching the reference mockup
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

  // 5 Applications (Matching Office Suite: Documents, Sheet, Slide, PDF, Cereva)
  const applications = [
    {
      name: 'Documents',
      desc: 'Create and edit documents',
      icon: WordIcon,
      action: () => openTab({ type: 'word', title: 'Documents' }),
    },
    {
      name: 'Sheet',
      desc: 'Analyze and manage data',
      icon: ExcelIcon,
      action: () => openTab({ type: 'excel', title: 'Sheet' }),
    },
    {
      name: 'Slide',
      desc: 'Build presentations',
      icon: PowerPointIcon,
      action: () => openTab({ type: 'powerpoint', title: 'Slide' }),
    },
    {
      name: 'PDF',
      desc: 'View and edit PDFs',
      icon: PdfIcon,
      action: () => openTab({ type: 'pdf', title: 'PDF' }),
    },
    {
      name: 'Cereva',
      desc: 'Your AI assistant',
      icon: CerevaRobotIcon,
      action: () => openTab({ type: 'cereva', title: 'Cereva' }),
    },
  ];

  // Recent items (Matching Office Canvas Aesthetic)
  const recentItems = [
    {
      icon: Search,
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      title: 'Research: Renewable Energy in Africa',
      meta: '2h ago · Deep Research',
      action: () => openTab({ type: 'chat', title: 'Renewable Energy Research', initialPrompt: 'Research: Renewable Energy in Africa' }),
    },
    {
      icon: Bot,
      iconColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
      title: 'Python Basics',
      meta: '1d ago · Cereva',
      action: () => openTab({ type: 'cereva', title: 'Python Basics' }),
    },
    {
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      title: 'Essay Draft',
      meta: '5h ago · Documents',
      action: () => openTab({ type: 'word', title: 'Essay Draft' }),
    },
    {
      icon: FileSpreadsheet,
      iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      title: 'Market Analysis Report',
      meta: '2d ago · Sheet',
      action: () => openTab({ type: 'excel', title: 'Market Analysis Report' }),
    },
    {
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      title: 'Project Plan',
      meta: '1d ago · Documents',
      action: () => openTab({ type: 'word', title: 'Project Plan' }),
    },
    {
      icon: FileCode2,
      iconColor: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      title: 'Security Checklist',
      meta: '2d ago · PDF',
      action: () => openTab({ type: 'pdf', title: 'Security Checklist' }),
    },
  ];

  return (
    <div className="min-h-full flex flex-col items-center justify-start pt-10 sm:pt-14 pb-20 px-4 sm:px-6 bg-[#FAFBFD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

        {/* 1. HERO BRANDING & HEADLINE WITH AUTHENTIC ERUWA / COXMOX SUN LOGO */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="flex items-center gap-3.5 mb-2">
            {/* Authentic Dual-Rotating Coxmox Sun Logo with clock/anti-clockwise solar corona */}
            <CoxmoxSunLogo size={46} isProcessing={false} />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              Eruwa AI
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white mt-1">
            What can I help you explore?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
            Ask anything. Research deeply. Create something useful.
          </p>
        </div>

        {/* 2. CENTRAL AI COMPOSER WITH INTERACTIVE CURSOR-FOLLOWING GLOW BORDER */}
        <div
          ref={composerContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full max-w-2xl relative mb-10"
        >
          {/* Ambient Glowing Halo Behind Composer with dynamic cursor position */}
          <div
            className={`absolute -inset-2 rounded-[36px] blur-xl transition-opacity duration-300 pointer-events-none ${
              isComposerFocused || isHovered ? 'opacity-85' : 'opacity-40'
            }`}
            style={{
              background: `radial-gradient(circle 260px at ${mousePos.x}% ${mousePos.y}%, rgba(56, 189, 248, 0.4), rgba(129, 140, 248, 0.35), rgba(192, 132, 252, 0.25), transparent 70%)`
            }}
          />

          {/* Cursor-following border glow perimeter */}
          <div
            className="relative p-[2px] rounded-[30px] transition-shadow duration-300 shadow-[0_8px_30px_rgba(59,130,246,0.12)] focus-within:shadow-[0_12px_45px_rgba(99,102,241,0.25)]"
            style={{
              background: `radial-gradient(circle 220px at ${mousePos.x}% ${mousePos.y}%, #38BDF8, #818CF8 35%, #C084FC 70%, #F472B6 100%)`
            }}
          >
            {/* White / Dark Inner Surface Composer */}
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[28px] p-4 sm:p-5 transition-colors">
              {/* Attached file chip */}
              {attachedFile && (
                <div className="flex items-center gap-1.5 px-3 py-1 mb-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs w-fit">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="font-medium max-w-[200px] truncate">{attachedFile}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="hover:text-red-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Multiline textarea input */}
              <div className="flex items-start gap-2 pt-1 pb-3">
                <span className={`w-0.5 h-5 bg-blue-600 rounded-full mt-1 ${isComposerFocused ? 'animate-pulse' : 'opacity-0'}`} />
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={composerText}
                  onFocus={() => setIsComposerFocused(true)}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Eruwa anything..."
                  className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none overflow-y-auto leading-relaxed max-h-[180px]"
                />
              </div>

              {/* Hidden file pickers */}
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setAttachedFile(e.target.files[0].name);
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx,.xlsx,.pptx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setAttachedFile(e.target.files[0].name);
                }}
              />

              {/* Composer Bottom Row Controls */}
              <div className="flex items-center justify-between pt-1">
                {/* Bottom-left: Image, Attachment, AI Mode dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    title="Upload image"
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* AI Mode Selector Pill with Sparkle & Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors focus:outline-none border border-blue-200/50 dark:border-blue-800/40"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{selectedMode}</span>
                        <ChevronDown className="w-3 h-3 text-blue-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl z-50 text-xs">
                      {(['AI Mode', 'Deep Research', 'Code Assistant', 'Summary Mode'] as const).map(mode => (
                        <DropdownMenuItem
                          key={mode}
                          onClick={() => setSelectedMode(mode)}
                          className={`cursor-pointer px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium ${selectedMode === mode ? 'text-blue-600 font-bold bg-blue-50/60 dark:bg-blue-950/30' : ''}`}
                        >
                          {mode}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bottom-right: Mic & Circular Send Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    title="Voice dictation"
                    className={`p-1.5 rounded-full transition-colors ${
                      isListening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Circular Send Button with Upward Arrow */}
                  <button
                    type="button"
                    onClick={() => handlePromptSubmit()}
                    disabled={!composerText.trim() && !attachedFile}
                    title="Send prompt (Enter)"
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      composerText.trim() || attachedFile
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CONTEXTUAL SUGGESTION PROMPTS (BLUR & TRANSPARENT HORIZONTAL ROWS MATCHING REFERENCE IMAGE 4) */}
          {isComposerFocused && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl p-4 sm:p-5 animate-in fade-in-50 zoom-in-98 text-xs select-none">
              {/* Category Pills Header: Suggested, Wireframe, Apps, Websites, Prototype */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                {suggestionCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Suggestions List: clean horizontal rows with transparent backdrop, no harsh borders, arrow button on hover */}
              <div className="space-y-1.5">
                {categorizedSuggestions[selectedCategory].map((sug) => {
                  const Icon = sug.icon;
                  return (
                    <div
                      key={sug.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handlePromptSubmit(undefined, sug.text);
                      }}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 hover:bg-white/80 dark:hover:bg-slate-800/70 hover:backdrop-blur-md transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        <span className="text-xs font-normal truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {sug.text}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. "YOUR APPS" SECTION (MATCHING OFFICE/BROWSER BLUEPRINT) */}
        <div className="w-full max-w-3xl mb-8">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Your apps
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {applications.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.name}
                  onClick={app.action}
                  className="flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/80 dark:hover:border-blue-500/80 shadow-2xs hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 flex items-center justify-center mb-3 transition-transform group-hover:scale-108">
                    <Icon className="w-9 h-9" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {app.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {app.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. "RECENT" SECTION (OFFICE CANVAS AESTHETIC) */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent
            </h3>
            <button
              onClick={() => openTab({ type: 'chat', title: 'Recent Activity' })}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl ${item.iconColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EruwaHome;
