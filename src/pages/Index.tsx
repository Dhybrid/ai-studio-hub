import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Globe, Smartphone, Image, Video, Music,
  FileSpreadsheet, MessageSquare, Sun, Moon, ChevronDown, User, Bell,
  Zap, Shield, Cpu, Star, Check, Terminal, Code, CpuIcon, Layers, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ThreeDGeometry } from '@/components/ui/ThreeDGeometry';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tools = [
  { id: 'chat', icon: MessageSquare, label: 'AI Chat', path: '/chat', color: '#3b82f6', active: true, badge: 'active' },
  { id: 'cereva', icon: Sparkles, label: 'Cereva', path: '/cereva', color: '#10b981', active: true, badge: 'teacher' },
  { id: 'office', icon: FileSpreadsheet, label: 'Office', path: '/office', color: '#eab308', active: true, badge: 'studio' },
  { id: 'web', icon: Globe, label: 'Web Builder', path: '/web-builder', color: '#06b6d4', active: false, badge: 'sandbox' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile Builder', path: '/mobile-builder', color: '#22c55e', active: false, badge: 'sandbox' },
  { id: 'image', icon: Image, label: 'Image Studio', path: '/image-studio', color: '#ec4899', active: false, badge: 'sandbox' },
];

const suggestedPrompts: Record<string, string[]> = {
  chat: ['Explain quantum computing in simple terms', 'Write a Python script to scrape a website', 'Help me plan a marketing strategy'],
  cereva: ['Explain photosynethis with chloroplast diagram', 'Teach me quadratic equations step by step', 'How do neural networks learn? Visual explanation'],
  office: ['Create a Q4 business budget sheet with formulas', 'Draft an executive business proposal document', 'Design a 10-slide pitch deck presentation outline'],
};

const stats = [
  { value: '50K+', label: 'Active Developers', glow: 'from-blue-500/10 to-transparent' },
  { value: '2M+', label: 'AI Compilation Runs', glow: 'from-emerald-500/10 to-transparent' },
  { value: '99.99%', label: 'Sandbox Uptime', glow: 'from-yellow-500/10 to-transparent' },
  { value: '4.9★', label: 'Developer Rating', glow: 'from-purple-500/10 to-transparent' },
];

const features = [
  { icon: CpuIcon, title: 'Multi-Model Routing', desc: 'Queries are dynamically parsed and routed to optimal local or API endpoints based on structural task requirements.', glowColor: 'rgba(59, 130, 246, 0.12)' },
  { icon: Terminal, title: 'WASM Code Compilation', desc: 'Draft code compiles inside fully-isolated client-side WebAssembly containers for zero-latency execution audits.', glowColor: 'rgba(16, 185, 129, 0.12)' },
  { icon: Layers, title: 'Shared Segment Memory', desc: 'Exchange context parameters seamlessly between documents, presentations, and AI dialogues using shared memory buffers.', glowColor: 'rgba(234, 179, 8, 0.12)' },
];

const mockLogs = [
  'Initializing Coxmox multi-model router...',
  'Connecting local compilation agent at port 8000: SUCCESS',
  'WASM client sandboxes loaded: 3/3 active',
  'Ready. Listening for user instructions...'
];

const IndexPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useWorkspace();
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  
  // Dynamic terminal logs simulator
  const [terminalLogs, setTerminalLogs] = useState<string[]>(mockLogs);
  const [activeTab, setActiveTab] = useState<'terminal' | 'config'>('terminal');

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setTargetMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth mouse interpolation loop
  useEffect(() => {
    let animationId: number;
    const update = () => {
      setMousePos((current) => ({
        x: current.x + (targetMousePos.x - current.x) * 0.08,
        y: current.y + (targetMousePos.y - current.y) * 0.08,
      }));
      animationId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationId);
  }, [targetMousePos]);

  // Terminal log ticking simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[SYSTEM LOG - ${new Date().toLocaleTimeString()}]: ping local agent... ok (${Math.floor(Math.random() * 12 + 8)}ms) | buffer usage: ${(Math.random() * 5 + 2).toFixed(2)}MB`;
      setTerminalLogs(prev => [...prev.slice(-6), newLog]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const tool = tools.find(t => t.id === activeTool);
    if (tool) {
      if (tool.id === 'cereva') {
        navigate(`/cereva?prompt=${encodeURIComponent(input.trim())}`);
      } else if (tool.id === 'office') {
        navigate(`/office?prompt=${encodeURIComponent(input.trim())}`);
      } else {
        navigate(`/chat?prompt=${encodeURIComponent(input.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentToolColor = tools.find(t => t.id === activeTool)?.color || '#3b82f6';

  const configCode = `import { cosmox } from '@cosmox/core';

export default cosmox.defineWorkspace({
  engine: 'multi-model-router',
  sandbox: 'wasm-rust-v8',
  modules: [
    'cereva-classroom',
    'office-studio'
  ],
  server: {
    port: 8000,
    api: 'fastapi-orchestrator'
  }
});`;

  return (
    <div className="min-h-screen bg-[#070708] text-white font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-white relative">
      {/* Visual background repeating grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-gradient [background:radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full transition-all border-b bg-[#070708]/85 backdrop-blur-md border-white/5 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <img src="/favicon.png" alt="COXMOX" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-sm font-bold tracking-wider text-white uppercase">COXMOX</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/chat')} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">AI Chat</button>
            <a href="/cereva" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">Cereva</a>
            <button onClick={() => navigate('/office')} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">Office</button>
            <button onClick={() => navigate('/settings')} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors">Settings</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 border border-white/5 bg-[#0e0e11]/40 transition-colors text-muted-foreground hover:text-white">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 border border-white/5 bg-[#0e0e11]/40 transition-colors text-muted-foreground hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-[#070708]" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-16 sm:pt-28 pb-16 z-10 flex flex-col items-center">
        {/* Responsive 3D geometry background orbiting with mouse following */}
        <div 
          className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] sm:h-[480px] pointer-events-none z-0 overflow-hidden opacity-85"
          style={{
            transform: `translateX(-50%) translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <ThreeDGeometry mode="sphere" color={currentToolColor} opacity={0.35} interactive={true} />
        </div>

        {/* Dynamic Parallax Hero Content */}
        <div 
          className="max-w-4xl mx-auto text-center relative z-10"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 5}deg) rotateY(${mousePos.x * 5}deg) translate3d(${mousePos.x * 5}px, ${mousePos.y * 5}px, 0)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#0e0e11]/60 backdrop-blur-md text-xs font-semibold tracking-wide text-white mb-8 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Experience Cosmox Workspace v2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            What can I help you<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
              build today?
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed">
            Compose formal documents, formulate automated spreadsheets, design presentations, or study concepts inside a dedicated development workspace.
          </p>

          {/* Prompt Capsule */}
          <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5 focus-within:from-blue-500/50 focus-within:to-indigo-500/20 transition-all duration-500 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)]">
              <div className="bg-[#0b0b0d]/95 backdrop-blur-xl rounded-[15px] p-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your project, template, or visual notes..."
                  rows={1}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base py-2.5 px-3 text-white placeholder:text-muted-foreground min-h-[50px] max-h-[160px] overflow-y-auto font-light"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 px-2">
                  {/* Active tools selectors */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tools.map((tool) => {
                      const isActive = activeTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => tool.active && setActiveTool(tool.id)}
                          disabled={!tool.active}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border relative",
                            isActive
                              ? "text-white bg-white/5 border-white/15"
                              : "text-muted-foreground border-transparent hover:text-white hover:bg-white/5",
                            !tool.active && "opacity-40 cursor-not-allowed hover:bg-transparent"
                          )}
                          style={{
                            boxShadow: isActive ? `0 0 20px -5px ${tool.color}44` : undefined,
                            borderColor: isActive ? `${tool.color}55` : undefined
                          }}
                        >
                          <tool.icon className="w-3.5 h-3.5" style={{ color: tool.color }} />
                          <span>{tool.label}</span>
                          {!tool.active && (
                            <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-muted-foreground/60 px-1 bg-white/5 rounded">
                              {tool.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="self-end sm:self-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-20 bg-white text-black hover:scale-105 active:scale-95 group/btn"
                    style={{
                      boxShadow: input.trim() ? '0 0 25px rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    <Send className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggested prompts list */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                {(suggestedPrompts[activeTool] || []).map((p, i) => (
                  <motion.button
                    key={`${activeTool}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    onClick={() => setInput(p)}
                    className="text-xs text-muted-foreground hover:text-white bg-[#0e0e11]/60 hover:bg-[#121216] border border-white/5 hover:border-white/10 rounded-full px-4 py-2 transition-all truncate max-w-[280px] font-light"
                  >
                    {p}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Terminal & Config Mockup Section */}
      <section className="px-4 sm:px-6 py-10 relative z-10 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/5 bg-[#0b0b0d]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header Tab panel */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#08080a] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="text-[10px] text-muted-foreground font-mono ml-2">coxmox-compilation-sandbox.log</span>
            </div>
            
            <div className="flex items-center gap-1.5 p-0.5 rounded-md bg-[#131317]">
              <button 
                onClick={() => setActiveTab('terminal')}
                className={cn("flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono transition-colors", activeTab === 'terminal' ? 'bg-white/5 text-white' : 'text-muted-foreground hover:text-white')}
              >
                <Terminal className="w-3 h-3" /> Console
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={cn("flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono transition-colors", activeTab === 'config' ? 'bg-white/5 text-white' : 'text-muted-foreground hover:text-white')}
              >
                <Code className="w-3 h-3" /> Config
              </button>
            </div>
          </div>

          {/* Active Terminal Content */}
          <div className="p-5 font-mono text-[11px] leading-relaxed min-h-[180px] bg-[#070708]/60 overflow-y-auto">
            {activeTab === 'terminal' ? (
              <div className="space-y-1 text-neutral-400">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-blue-500 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <span className="text-blue-500 select-none">&gt;</span>
                  <span className="w-2 h-4 bg-white animate-pulse" />
                </div>
              </div>
            ) : (
              <pre className="text-emerald-400 select-text text-left font-mono">
                {configCode}
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 py-16 relative z-10 border-t border-white/5 bg-[#09090b]/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="relative rounded-2xl border border-white/5 bg-[#0b0b0d]/50 p-6 text-center group overflow-hidden">
              <div className={cn("absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", s.glow)} />
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight relative z-10">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold relative z-10">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Technical Grid */}
      <section className="px-4 sm:px-6 py-24 relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Architected for Enterprise Sandboxes
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto font-light">
              Unified design, secure local runtimes, and multi-model routing protocols.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div 
                key={f.title} 
                className="group relative rounded-2xl border border-white/5 bg-[#0b0b0d]/40 p-8 transition-all hover:border-white/10 hover:-translate-y-1 duration-300"
              >
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 10%, ${f.glowColor}, transparent 55%)`
                  }}
                />
                
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300">
                  <f.icon className="w-5.5 h-5.5 text-white" />
                </div>
                
                <h3 className="text-sm font-bold text-white mb-3 relative z-10 uppercase tracking-wider">{f.title}</h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-light relative z-10">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Dynamic CTA */}
      <section className="px-4 sm:px-6 py-24 border-t border-white/5 bg-gradient-to-b from-[#09090b] to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">Ready to compile?</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto font-light">
            Deploy your code, compile templates, and consult visual nodes inside a secure, high-performance sandbox.
          </p>
          <button 
            onClick={() => navigate('/chat')} 
            className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white text-black hover:bg-neutral-100 hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            Enter Workspace Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-12 border-t border-white/5 bg-black text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-light">© 2026 COXMOX. Engineered for compiling layouts.</p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/chat')} className="text-[10px] hover:text-white transition-colors">Workspace</button>
            <button onClick={() => navigate('/cereva')} className="text-[10px] hover:text-white transition-colors">Cereva App</button>
            <button onClick={() => navigate('/office')} className="text-[10px] hover:text-white transition-colors">Office Studio</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
