import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send, Sparkles, Globe, Smartphone, Image, Video, Music,
  FileSpreadsheet, BookOpen, ArrowRight, Zap, Shield, Cpu,
  MessageSquare, Sun, Moon, ChevronDown, User, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tools = [
  { id: 'chat', icon: MessageSquare, label: 'AI Chat', path: '/', color: 'text-accent' },
  { id: 'image', icon: Image, label: 'Image', path: '/image-studio', color: 'text-pink-500' },
  { id: 'video', icon: Video, label: 'Video', path: '/video-studio', color: 'text-purple-500' },
  { id: 'audio', icon: Music, label: 'Audio', path: '/audio-studio', color: 'text-orange-500' },
  { id: 'web', icon: Globe, label: 'Web', path: '/web-builder', color: 'text-cyan-500' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', path: '/mobile-builder', color: 'text-green-500' },
  { id: 'office', icon: FileSpreadsheet, label: 'Office', path: '/office', color: 'text-yellow-500' },
];

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Generate code, images, and content in seconds with state-of-the-art AI models.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data stays yours. Enterprise-grade security with end-to-end encryption.' },
  { icon: Cpu, title: 'Multi-Model', desc: 'Choose from GPT-4, Claude, and custom models. Bring your own API keys.' },
];

const IndexPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useWorkspace();
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState('chat');

  const handleSubmit = () => {
    if (!input.trim()) return;
    const tool = tools.find(t => t.id === activeTool);
    if (tool) {
      if (activeTool === 'chat') {
        navigate('/chat');
      } else {
        window.open(tool.path, '_blank');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">COXMOX</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/chat')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Chat</button>
            <a href="/cereva" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cereva</a>
            <button onClick={() => navigate('/all-tools')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</button>
            <button onClick={() => navigate('/projects')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</button>
            <button onClick={() => navigate('/history')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">History</button>
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 ml-1 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">II</div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
              What can I help you<br className="hidden sm:block" /> build today?
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl mx-auto">
              Chat, generate images, build websites, create videos — all powered by AI.
            </p>
          </motion.div>

          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
            <div className="bg-surface border border-border rounded-2xl p-2 max-w-2xl mx-auto shadow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to create..."
                rows={2}
                className="w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base py-2 px-3 text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between px-1">
                {/* Tool pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                        activeTool === tool.id
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-muted-foreground hover:bg-surface-hover border border-transparent"
                      )}
                    >
                      <tool.icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all group"
            >
              <MessageSquare className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-foreground">AI Chat</span>
            </button>
            <a
              href="/cereva"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all group"
            >
              <BookOpen className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-foreground">Cereva</span>
            </a>
            <a
              href="/web-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all group"
            >
              <Globe className="w-6 h-6 text-cyan-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-foreground">Web Builder</span>
            </a>
            <button
              onClick={() => navigate('/all-tools')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all group"
            >
              <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-foreground">All Tools</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 py-16 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-10">Built for creators & developers</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </div>
            <span className="text-xs font-semibold text-foreground">COXMOX</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Settings</button>
            <button onClick={() => navigate('/projects')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</button>
            <button onClick={() => navigate('/history')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">History</button>
          </div>
          <p className="text-[10px] text-muted-foreground">© 2026 COXMOX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
