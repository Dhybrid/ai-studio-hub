import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, BookOpen,
  Bookmark, Search, Plus, ChevronLeft, ChevronRight, Home,
  MoreHorizontal, Lightbulb, Square, Copy, Check, Loader2,
  Eye, FileText, X, Menu, Play, Pause, AudioWaveform, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CerevaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockChats = [
  { id: 'cc1', title: 'Photosynthesis explained', time: '1h ago', subject: 'Biology' },
  { id: 'cc2', title: 'Quadratic equations', time: '3h ago', subject: 'Math' },
  { id: 'cc3', title: 'World War II timeline', time: '1d ago', subject: 'History' },
  { id: 'cc4', title: "Newton's laws of motion", time: '2d ago', subject: 'Physics' },
  { id: 'cc5', title: 'Shakespeare analysis', time: '3d ago', subject: 'Literature' },
];

const mockSaved = [
  { id: 's1', title: 'Cell division diagram', subject: 'Biology' },
  { id: 's2', title: 'Trigonometry cheat sheet', subject: 'Math' },
  { id: 's3', title: 'Periodic table notes', subject: 'Chemistry' },
];

const voiceOptions = [
  { id: 'nova', name: 'Nova', accent: 'American', type: 'Female', demo: 'Hi! I\'m Nova, ready to help you learn.' },
  { id: 'atlas', name: 'Atlas', accent: 'British', type: 'Male', demo: 'Hello, I\'m Atlas. Let\'s explore together.' },
  { id: 'sage', name: 'Sage', accent: 'Australian', type: 'Female', demo: 'G\'day! I\'m Sage, your learning companion.' },
  { id: 'echo', name: 'Echo', accent: 'American', type: 'Male', demo: 'Hey there! I\'m Echo, here to teach.' },
  { id: 'luna', name: 'Luna', accent: 'British', type: 'Female', demo: 'Hi! I\'m Luna, let me explain that for you.' },
  { id: 'kai', name: 'Kai', accent: 'Japanese', type: 'Male', demo: 'Hello! I\'m Kai, ready to guide you.' },
];

const sampleMessages: CerevaMessage[] = [
  { id: '1', role: 'user', content: 'Explain how photosynthesis works with a diagram', timestamp: new Date(Date.now() - 60000) },
  { id: '2', role: 'assistant', content: `# Photosynthesis 🌱\n\nPhotosynthesis is the process by which green plants convert light energy into chemical energy.\n\n## The Basic Equation\n\n\`\`\`\n6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\n\`\`\`\n\n## Two Main Stages\n\n### 1. Light-Dependent Reactions\n- Occur in the **thylakoid membranes**\n- Water molecules are split (photolysis)\n- ATP and NADPH are produced\n\n### 2. Calvin Cycle (Light-Independent)\n- Occurs in the **stroma**\n- CO₂ is fixed into organic molecules\n- Produces glucose (G3P)\n\n| Stage | Location | Input | Output |\n|-------|----------|-------|--------|\n| Light Reactions | Thylakoid | H₂O, Light | ATP, NADPH, O₂ |\n| Calvin Cycle | Stroma | CO₂, ATP | G3P (Glucose) |\n\n> 💡 **Key Insight**: Plants are solar-powered sugar factories!`, timestamp: new Date() },
];

const CodeBlock = ({ language, children }: { language?: string; children: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-code-bg border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <SyntaxHighlighter language={language || 'text'} style={oneDark} customStyle={{ margin: 0, padding: '1rem', background: 'hsl(var(--code-bg))', fontSize: '13px' }}>
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const Cereva = () => {
  const [messages, setMessages] = useState<CerevaMessage[]>(sampleMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceCallMode, setVoiceCallMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'saved'>('history');
  const [chatSearch, setChatSearch] = useState('');
  const [explanationMode, setExplanationMode] = useState<'text' | 'illustration'>('text');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voiceSelectorOpen, setVoiceSelectorOpen] = useState(false);
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const filteredChats = mockChats.filter(c => c.title.toLowerCase().includes(chatSearch.toLowerCase()));
  const currentVoice = voiceOptions.find(v => v.id === selectedVoice)!;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }]);
    setInput('');
    setIsStreaming(true);
    const aiMsg: CerevaMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    const response = "Great question! Let me explain this concept step by step...\n\nThis is a simulated response from **Cereva**. In production, this connects to an AI model optimized for education with diagrams and interactive explanations.";
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setMessages(prev => { const u = [...prev]; const l = u[u.length - 1]; if (l.role === 'assistant') l.content = response.slice(0, i + 1); return [...u]; });
        i++;
      } else { clearInterval(interval); setIsStreaming(false); }
    }, 15);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const playVoiceDemo = (voiceId: string) => {
    setPlayingDemo(voiceId);
    setTimeout(() => setPlayingDemo(null), 2000);
  };

  // Voice Call Mode
  if (voiceCallMode) {
    return (
      <div className={cn("flex h-screen w-full overflow-hidden bg-background", isMobile && "flex-col")}>
        {/* Voice selector popup */}
        <VoiceSelectorPopup
          open={voiceSelectorOpen}
          onClose={() => setVoiceSelectorOpen(false)}
          voices={voiceOptions}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          playingDemo={playingDemo}
          onPlayDemo={playVoiceDemo}
        />

        {/* Left: Explanation Panel (big) */}
        <div className={cn("flex flex-col bg-background", isMobile ? "flex-1 min-h-0" : "flex-1")}>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
            <span className="text-sm font-medium text-foreground">Explanation</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-md bg-muted">
                <button
                  onClick={() => setExplanationMode('text')}
                  className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", explanationMode === 'text' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
                >
                  <FileText className="w-3 h-3" /> Text
                </button>
                <button
                  onClick={() => setExplanationMode('illustration')}
                  className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", explanationMode === 'illustration' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
                >
                  <Eye className="w-3 h-3" /> Visual
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {explanationMode === 'text' ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2>Photosynthesis</h2>
                <p>Photosynthesis is the biological process by which plants convert light energy into chemical energy stored in glucose molecules.</p>
                <h3>Key Points:</h3>
                <ul>
                  <li>Occurs in chloroplasts</li>
                  <li>Requires sunlight, water, and CO₂</li>
                  <li>Produces glucose and oxygen</li>
                  <li>Two main stages: light-dependent and light-independent reactions</li>
                </ul>
                <h3>The Chemical Equation</h3>
                <p><code>6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂</code></p>
                <h3>Why It Matters</h3>
                <p>Photosynthesis is the foundation of nearly all food chains on Earth, converting solar energy into chemical energy that sustains life.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl border border-border overflow-hidden bg-emerald-500/5 p-8">
                  <div className="flex items-center justify-center mb-6 flex-wrap gap-4">
                    <div className="text-center">
                      <div className="text-5xl mb-2">☀️</div>
                      <p className="text-xs text-muted-foreground">Sunlight</p>
                    </div>
                    <div className="text-3xl text-muted-foreground">+</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">💧</div>
                      <p className="text-xs text-muted-foreground">Water</p>
                    </div>
                    <div className="text-3xl text-muted-foreground">+</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">🌫️</div>
                      <p className="text-xs text-muted-foreground">CO₂</p>
                    </div>
                    <div className="text-3xl text-muted-foreground">→</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">🍬</div>
                      <p className="text-xs text-muted-foreground">Glucose</p>
                    </div>
                    <div className="text-3xl text-muted-foreground">+</div>
                    <div className="text-center">
                      <div className="text-5xl mb-2">🫧</div>
                      <p className="text-xs text-muted-foreground">Oxygen</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-6">
                  <p className="text-xs font-medium text-foreground mb-3">Chemical Equation</p>
                  <div className="bg-code-bg rounded-lg p-4 font-mono text-lg text-center text-foreground">
                    6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border p-4 bg-emerald-500/5">
                    <h4 className="text-sm font-medium text-foreground mb-2">Light Reactions</h4>
                    <p className="text-xs text-muted-foreground">Thylakoid membranes → ATP + NADPH</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-teal-500/5">
                    <h4 className="text-sm font-medium text-foreground mb-2">Calvin Cycle</h4>
                    <p className="text-xs text-muted-foreground">Stroma → Glucose (G3P)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Voice Panel (small) */}
        <div className={cn("border-l border-border flex flex-col bg-gradient-to-b from-background to-surface", isMobile ? "h-[280px] border-l-0 border-t flex-shrink-0" : "w-[320px]")}>
          {/* Voice selector at top-right */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
            <button
              onClick={() => setVoiceCallMode(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to chat
            </button>
            <button
              onClick={() => setVoiceSelectorOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              <Volume2 className="w-3 h-3" />
              {currentVoice.name}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {/* Voice visualization */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="relative w-24 h-24 mb-4">
              <motion.div
                animate={{ scale: isRecording ? [1, 1.3, 1] : 1, opacity: isRecording ? [0.3, 0.6, 0.3] : 0.2 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-emerald-500/20"
              />
              <motion.div
                animate={{ scale: isRecording ? [1, 1.15, 1] : 1, opacity: isRecording ? [0.5, 0.8, 0.5] : 0.3 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                className="absolute inset-2 rounded-full bg-emerald-500/30"
              />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <AudioWaveform className="w-7 h-7 text-white" />
              </div>
            </div>

            <p className="text-sm font-medium text-foreground mb-1">
              {isRecording ? 'Listening...' : 'Tap to speak'}
            </p>
            <p className="text-xs text-muted-foreground mb-6">Voice: {currentVoice.name}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isRecording ? "bg-red-500 text-white scale-110" : "bg-emerald-500 text-white hover:bg-emerald-600"
                )}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setVoiceCallMode(false)}
                className="w-12 h-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar content
  const CerevaSidebar = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="text-sm font-semibold text-foreground tracking-tight">Cereva</p>
          <p className="text-[11px] text-sidebar-muted">Teaching AI</p>
        </div>
        {onClose && <button onClick={onClose} className="text-muted-foreground"><X className="w-4 h-4" /></button>}
      </div>

      <div className="px-3 pt-3 space-y-2">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-sidebar-border text-sm text-sidebar-foreground hover:bg-surface-hover transition-all">
          <Plus className="w-4 h-4" /> New Lesson
        </button>
      </div>

      <div className="flex px-3 mt-3 gap-1">
        {(['history', 'saved'] as const).map(t => (
          <button key={t} onClick={() => setSidebarTab(t)} className={cn("flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all capitalize", sidebarTab === t ? "bg-surface-active text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col py-2 px-2 overflow-y-auto">
        {sidebarTab === 'history' && (
          <>
            <div className="px-2 mb-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search lessons..." className="w-full pl-6 pr-2 py-1 rounded-md bg-surface border border-sidebar-border text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            <div className="space-y-0.5">
              {filteredChats.map((chat) => (
                <button key={chat.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-surface-hover group">
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
        {sidebarTab === 'saved' && (
          <div className="space-y-0.5 px-1">
            {mockSaved.map((lesson) => (
              <button key={lesson.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-surface-hover">
                <Bookmark className="w-3 h-3 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-sidebar-foreground font-medium truncate">{lesson.title}</p>
                  <p className="text-[9px] text-muted-foreground/50">{lesson.subject}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">II</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">IIkiogha</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Student</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Voice selector popup */}
      <VoiceSelectorPopup
        open={voiceSelectorOpen}
        onClose={() => setVoiceSelectorOpen(false)}
        voices={voiceOptions}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        playingDemo={playingDemo}
        onPlayDemo={playVoiceDemo}
      />

      {/* Mobile sidebar */}
      {isMobile ? (
        <>
          <button onClick={() => setMobileMenuOpen(true)} className="fixed top-3 left-3 z-40 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
            <Menu className="w-4 h-4" />
          </button>
          <div
            className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-200", mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className={cn("fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden transition-transform duration-200 ease-out", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
            <CerevaSidebar onClose={() => setMobileMenuOpen(false)} />
          </aside>
        </>
      ) : (
        <aside
          className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden relative transition-[width] duration-200 ease-in-out"
          style={{ width: sidebarCollapsed ? 64 : 280 }}
        >
          {!sidebarCollapsed && <CerevaSidebar />}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover z-10" style={{ right: -12 }}>
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </aside>
      )}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            {isMobile && <div className="w-9" />}
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <h1 className="text-sm font-medium text-foreground">Cereva</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice mode button - in header, not input */}
            <button
              onClick={() => setVoiceCallMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
            >
              <AudioWaveform className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5">
                    <Lightbulb className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">What would you like to learn?</h2>
                  <p className="text-sm text-muted-foreground mb-8">Ask anything — I'll explain with diagrams and examples.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {[
                      { q: 'How does DNA replication work?', sub: 'with diagrams' },
                      { q: 'Explain calculus derivatives', sub: 'step by step' },
                      { q: 'The French Revolution timeline', sub: 'key events' },
                      { q: 'How do neural networks learn?', sub: 'visual explanation' },
                    ].map((s) => (
                      <button key={s.q} onClick={() => setInput(s.q)} className="p-3 rounded-xl border border-border bg-card hover:border-emerald-500/30 hover:bg-surface-hover transition-all text-left group">
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
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={cn("rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed", msg.role === 'user' ? "bg-chat-user text-foreground" : "bg-transparent text-foreground")}>
                      {msg.role === 'assistant' ? (
                        <div className={cn("prose prose-sm dark:prose-invert max-w-none", isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor")}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !match ? <code className="px-1.5 py-0.5 rounded bg-code-bg text-xs font-mono" {...props}>{children}</code> : <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>;
                            },
                            table({ children }) { return <div className="overflow-x-auto my-3"><table className="min-w-full border border-border rounded-lg overflow-hidden">{children}</table></div>; },
                            th({ children }) { return <th className="px-3 py-2 bg-surface text-left text-xs font-medium text-muted-foreground border-b border-border">{children}</th>; },
                            td({ children }) { return <td className="px-3 py-2 text-sm border-b border-border">{children}</td>; },
                          }}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : <p>{msg.content}</p>}
                    </div>
                    {msg.role === 'user' && <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1 text-xs font-medium">II</div>}
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
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-colors", isRecording ? "bg-red-500/10 text-red-500" : "hover:bg-surface-hover text-muted-foreground")}
                title="Voice note"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Cereva anything..." rows={1} className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground max-h-32" style={{ minHeight: '36px' }} />
              {isStreaming ? (
                <button onClick={() => setIsStreaming(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:opacity-90 disabled:opacity-30">
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Voice Selector Popup
const VoiceSelectorPopup = ({ open, onClose, voices, selectedVoice, onSelectVoice, playingDemo, onPlayDemo }: {
  open: boolean; onClose: () => void; voices: typeof voiceOptions; selectedVoice: string;
  onSelectVoice: (id: string) => void; playingDemo: string | null; onPlayDemo: (id: string) => void;
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-card border border-border rounded-2xl shadow-2xl z-[61] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-base font-semibold text-foreground">Choose a Voice</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click play to hear a demo</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => { onSelectVoice(voice.id); onClose(); }}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:shadow-md",
                  selectedVoice === voice.id ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-border hover:border-emerald-500/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    selectedVoice === voice.id ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {voice.name[0]}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPlayDemo(voice.id); }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      playingDemo === voice.id ? "bg-emerald-500 text-white" : "bg-muted hover:bg-surface-hover text-muted-foreground"
                    )}
                  >
                    {playingDemo === voice.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                </div>
                <p className="text-sm font-medium text-foreground">{voice.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{voice.type} · {voice.accent}</p>
                {playingDemo === voice.id && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-emerald-500 mt-2 italic"
                  >
                    "{voice.demo}"
                  </motion.p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const voiceOptions = [
  { id: 'nova', name: 'Nova', accent: 'American', type: 'Female', demo: 'Hi! I\'m Nova, ready to help you learn.' },
  { id: 'atlas', name: 'Atlas', accent: 'British', type: 'Male', demo: 'Hello, I\'m Atlas. Let\'s explore together.' },
  { id: 'sage', name: 'Sage', accent: 'Australian', type: 'Female', demo: 'G\'day! I\'m Sage, your learning companion.' },
  { id: 'echo', name: 'Echo', accent: 'American', type: 'Male', demo: 'Hey there! I\'m Echo, here to teach.' },
  { id: 'luna', name: 'Luna', accent: 'British', type: 'Female', demo: 'Hi! I\'m Luna, let me explain that for you.' },
  { id: 'kai', name: 'Kai', accent: 'Japanese', type: 'Male', demo: 'Hello! I\'m Kai, ready to guide you.' },
];

export default Cereva;
