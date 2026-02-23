import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, BookOpen,
  Bookmark, Search, Plus, ChevronLeft, ChevronRight, Home,
  MoreHorizontal, Image as ImageIcon, BarChart3, Lightbulb,
  Square, Copy, Check, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CerevaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
  hasDiagram?: boolean;
}

interface CerevaChatHistory {
  id: string;
  title: string;
  time: string;
  subject?: string;
}

interface SavedLesson {
  id: string;
  title: string;
  subject: string;
}

const mockChats: CerevaChatHistory[] = [
  { id: 'cc1', title: 'Photosynthesis explained', time: '1h ago', subject: 'Biology' },
  { id: 'cc2', title: 'Quadratic equations', time: '3h ago', subject: 'Math' },
  { id: 'cc3', title: 'World War II timeline', time: '1d ago', subject: 'History' },
  { id: 'cc4', title: 'Newton\'s laws of motion', time: '2d ago', subject: 'Physics' },
  { id: 'cc5', title: 'Shakespeare analysis', time: '3d ago', subject: 'Literature' },
  { id: 'cc6', title: 'Python data structures', time: '1w ago', subject: 'CS' },
];

const mockSaved: SavedLesson[] = [
  { id: 's1', title: 'Cell division diagram', subject: 'Biology' },
  { id: 's2', title: 'Trigonometry cheat sheet', subject: 'Math' },
  { id: 's3', title: 'Periodic table notes', subject: 'Chemistry' },
];

const sampleMessages: CerevaMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Explain how photosynthesis works with a diagram',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `# Photosynthesis 🌱

Photosynthesis is the process by which green plants convert light energy into chemical energy.

## The Basic Equation

\`\`\`
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂
\`\`\`

## Two Main Stages

### 1. Light-Dependent Reactions
- Occur in the **thylakoid membranes**
- Water molecules are split (photolysis)
- ATP and NADPH are produced
- Oxygen is released as a byproduct

### 2. Calvin Cycle (Light-Independent)
- Occurs in the **stroma**
- CO₂ is fixed into organic molecules
- Uses ATP and NADPH from stage 1
- Produces glucose (G3P)

| Stage | Location | Input | Output |
|-------|----------|-------|--------|
| Light Reactions | Thylakoid | H₂O, Light | ATP, NADPH, O₂ |
| Calvin Cycle | Stroma | CO₂, ATP, NADPH | G3P (Glucose) |

> 💡 **Key Insight**: Plants are essentially solar-powered sugar factories!

The process is fundamental to life on Earth, producing both the food and oxygen that most organisms depend on.`,
    timestamp: new Date(),
    hasDiagram: true,
  },
];

const CodeBlock = ({ language, children }: { language?: string; children: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-code-bg border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '1rem', background: 'hsl(var(--code-bg))', fontSize: '13px' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const Cereva = () => {
  const [messages, setMessages] = useState<CerevaMessage[]>(sampleMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'saved'>('history');
  const [chatSearch, setChatSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredChats = mockChats.filter(c =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: CerevaMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const aiMsg: CerevaMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);

    const response = "Great question! Let me explain this concept step by step...\n\nThis is a simulated response from **Cereva**, your AI teaching assistant. In production, this would connect to an actual AI model optimized for educational content with diagrams, images, and interactive explanations.";
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content = response.slice(0, i + 1);
          }
          return [...updated];
        });
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Cereva Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 280 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap flex-1"
              >
                <p className="text-sm font-semibold text-foreground tracking-tight">Cereva</p>
                <p className="text-[11px] text-sidebar-muted">Teaching AI</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Chat + Voice Toggle */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-3 space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-sidebar-border text-sm text-sidebar-foreground hover:bg-surface-hover hover:border-accent/30 transition-all">
              <Plus className="w-4 h-4" />
              New Lesson
            </button>
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                voiceMode
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "text-sidebar-foreground hover:bg-surface-hover border border-transparent"
              )}
            >
              {voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              Voice Mode {voiceMode ? 'On' : 'Off'}
            </button>
          </div>
        )}

        {/* Tabs: History | Saved */}
        {!sidebarCollapsed && (
          <div className="flex px-3 mt-3 gap-1">
            <button
              onClick={() => setSidebarTab('history')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                sidebarTab === 'history' ? "bg-surface-active text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              History
            </button>
            <button
              onClick={() => setSidebarTab('saved')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                sidebarTab === 'saved' ? "bg-surface-active text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Saved
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col py-2 px-2 overflow-y-auto">
          {!sidebarCollapsed && sidebarTab === 'history' && (
            <>
              <div className="px-2 mb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search lessons..."
                    className="w-full pl-6 pr-2 py-1 rounded-md bg-surface border border-sidebar-border text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div className="space-y-0.5">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-surface-hover group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-sidebar-foreground font-medium truncate">{chat.title}</p>
                      <p className="text-[9px] text-muted-foreground/50">{chat.subject} · {chat.time}</p>
                    </div>
                    <MoreHorizontal className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 hidden group-hover:block" />
                  </button>
                ))}
              </div>
            </>
          )}

          {!sidebarCollapsed && sidebarTab === 'saved' && (
            <div className="space-y-0.5 px-1">
              {mockSaved.map((lesson) => (
                <button
                  key={lesson.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-surface-hover"
                >
                  <Bookmark className="w-3 h-3 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-sidebar-foreground font-medium truncate">{lesson.title}</p>
                    <p className="text-[9px] text-muted-foreground/50">{lesson.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Bottom nav */}
          <div className="border-t border-sidebar-border pt-2 mt-2 space-y-0.5">
            <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-surface-hover text-sidebar-foreground">
              <Home className="w-[18px] h-[18px] flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Back to COXMOX</span>}
            </a>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
            JD
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Student</span>
            </div>
          )}
        </div>

        {/* Collapse */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
          style={{ left: sidebarCollapsed ? 58 : 274 }}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <h1 className="text-sm font-medium text-foreground">Cereva — Teaching AI</h1>
          </div>
          <div className="flex items-center gap-2">
            {voiceMode && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                <Volume2 className="w-3 h-3" />
                Voice Active
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5">
                    <Lightbulb className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">What would you like to learn?</h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Ask anything — I'll explain with diagrams, images, and examples.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {[
                      { q: 'How does DNA replication work?', sub: 'with diagrams' },
                      { q: 'Explain calculus derivatives', sub: 'step by step' },
                      { q: 'The French Revolution timeline', sub: 'key events & causes' },
                      { q: 'How do neural networks learn?', sub: 'visual explanation' },
                    ].map((s) => (
                      <button
                        key={s.q}
                        onClick={() => setInput(s.q)}
                        className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500/30 hover:bg-surface-hover transition-all text-left group"
                      >
                        <p className="text-xs font-medium text-foreground group-hover:text-emerald-500 transition-colors">{s.q}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                      msg.role === 'user' ? "bg-chat-user text-foreground" : "bg-transparent text-foreground"
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className={cn(
                          "prose prose-sm dark:prose-invert max-w-none",
                          isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor"
                        )}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match;
                                return isInline ? (
                                  <code className="px-1.5 py-0.5 rounded bg-code-bg text-xs font-mono" {...props}>{children}</code>
                                ) : (
                                  <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-3">
                                    <table className="min-w-full border border-border rounded-lg overflow-hidden">{children}</table>
                                  </div>
                                );
                              },
                              th({ children }) {
                                return <th className="px-3 py-2 bg-surface text-left text-xs font-medium text-muted-foreground border-b border-border">{children}</th>;
                              },
                              td({ children }) {
                                return <td className="px-3 py-2 text-sm border-b border-border">{children}</td>;
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1 text-xs font-medium">
                        JD
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isStreaming && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs ml-10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 typing-dot" />
                </div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-surface rounded-2xl border border-border p-2">
              {/* Voice Record Button */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                  isRecording
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "hover:bg-surface-hover text-muted-foreground"
                )}
                title={isRecording ? 'Stop recording' : 'Voice note'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cereva anything..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground max-h-32"
                style={{ minHeight: '36px' }}
              />
              {isStreaming ? (
                <button
                  onClick={() => setIsStreaming(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Cereva helps you learn — ask questions, request diagrams, or use voice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cereva;
