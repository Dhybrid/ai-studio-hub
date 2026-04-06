import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send, Sparkles, Globe, Smartphone, Image, Video, Music,
  FileSpreadsheet, MessageSquare, Sun, Moon, ChevronDown, User, Bell,
  Zap, Shield, Cpu, Star, ArrowRight, Check, BookOpen,
  Users, Building2, TrendingUp, Award
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
  { id: 'chat', icon: MessageSquare, label: 'AI Chat', path: '/chat', color: 'text-accent' },
  { id: 'image', icon: Image, label: 'Image', path: '/image-studio', color: 'text-pink-500' },
  { id: 'video', icon: Video, label: 'Video', path: '/video-studio', color: 'text-purple-500' },
  { id: 'audio', icon: Music, label: 'Audio', path: '/audio-studio', color: 'text-orange-500' },
  { id: 'web', icon: Globe, label: 'Web', path: '/web-builder', color: 'text-cyan-500' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', path: '/mobile-builder', color: 'text-green-500' },
  { id: 'office', icon: FileSpreadsheet, label: 'Office', path: '/office', color: 'text-yellow-500' },
];

const suggestedPrompts: Record<string, string[]> = {
  chat: ['Explain quantum computing in simple terms', 'Write a Python script to scrape a website', 'Help me plan a marketing strategy'],
  image: ['A futuristic city at sunset, cyberpunk neon lights', 'Minimalist logo for a coffee brand', 'Oil painting of a serene mountain lake'],
  video: ['30-second product demo with motion graphics', 'Cinematic drone shot of a coastal town', 'Animated explainer for a SaaS product'],
  audio: ['Professional voiceover for a podcast intro', 'Upbeat lo-fi background music, 60 seconds', 'Dramatic cinematic trailer sound effects'],
  web: ['Modern SaaS landing page with pricing section', 'Portfolio website with dark theme and animations', 'E-commerce product page with reviews'],
  mobile: ['Fitness tracker app with dashboard and charts', 'Food delivery app with real-time order tracking', 'Social media app with stories and messaging'],
  office: ['Q4 investor pitch deck with financial charts', 'Project status report with KPI dashboard', 'Marketing budget spreadsheet with forecasts'],
};

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Generate code, images, and content in seconds with state-of-the-art AI models.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data stays yours. Enterprise-grade security with end-to-end encryption.' },
  { icon: Cpu, title: 'Multi-Model', desc: 'Choose from GPT-4, Claude, Gemini and more. Bring your own API keys.' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Generations' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
];

const partners = ['Google Cloud', 'OpenAI', 'Anthropic', 'Stability AI', 'Meta AI', 'Mistral'];

const pricingPlans = [
  { name: 'Free', price: '$0', period: '/month', features: ['5 AI chats/day', '3 image generations', 'Basic templates', 'Community support'], cta: 'Get Started', popular: false },
  { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited AI chats', '100 image generations/day', 'All builders access', 'Priority support', 'Custom API keys', 'Advanced models'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Dedicated infrastructure', 'SSO & team management', 'SLA guarantee', 'Custom integrations', 'White-label option'], cta: 'Contact Sales', popular: false },
];

const blogPosts = [
  { title: 'How AI is Revolutionizing Web Development', category: 'Engineering', date: 'Mar 28, 2026', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop' },
  { title: 'Building Stunning Presentations with AI in Minutes', category: 'Product', date: 'Mar 22, 2026', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
  { title: 'The Future of AI-Powered Content Creation', category: 'AI Research', date: 'Mar 15, 2026', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop' },
];

const IndexPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useWorkspace();
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (tool) navigate(tool.path);
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
            <img src="/favicon.png" alt="COXMOX" className="w-8 h-8" />
            <span className="text-sm font-bold text-foreground tracking-tight">COXMOX</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/chat')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Chat</button>
            <a href="/cereva" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cereva</a>
            <button onClick={() => navigate('/all-tools')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</button>
            <button onClick={() => navigate('/projects')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projects</button>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
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
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">U</div>
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
      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-8">
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
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to create..."
                rows={1}
                className="w-full bg-transparent border-none outline-none resize-none text-sm sm:text-base py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[160px] overflow-y-auto"
              />
              <div className="flex items-center justify-between px-1">
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

            {/* Suggested prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {(suggestedPrompts[activeTool] || []).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput(p)}
                  className="text-xs text-muted-foreground hover:text-foreground bg-surface hover:bg-surface-hover border border-border rounded-full px-3 py-1.5 transition-colors truncate max-w-[280px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
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

      {/* Partners */}
      <section className="px-4 sm:px-6 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {partners.map((p) => (
              <span key={p} className="text-sm font-semibold text-muted-foreground/60">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 sm:px-6 py-16 border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-3">Simple, transparent pricing</h2>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-md mx-auto">Start free, upgrade when you need more power.</p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={cn("rounded-2xl border p-6 flex flex-col", plan.popular ? "border-accent bg-accent/5 ring-1 ring-accent/20 relative" : "border-border bg-background")}>
                {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn("mt-6 w-full py-2.5 rounded-xl text-sm font-medium transition-colors", plan.popular ? "bg-accent text-accent-foreground hover:opacity-90" : "bg-foreground text-background hover:opacity-90")}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="px-4 sm:px-6 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">From the blog</h2>
            <button className="text-xs text-accent font-medium flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {blogPosts.map((post) => (
              <div key={post.title} className="group cursor-pointer">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-muted mb-3">
                  <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-[10px] font-medium text-accent uppercase tracking-wider mb-1">{post.category}</p>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">{post.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{post.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 border-t border-border bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready to build something amazing?</h2>
          <p className="text-sm opacity-70 mb-6">Join 50,000+ creators already using COXMOX.</p>
          <button onClick={() => navigate('/chat')} className="bg-accent text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-10 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.png" alt="COXMOX" className="w-6 h-6" />
                <span className="text-xs font-bold text-foreground">COXMOX</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">AI-powered workspace for creators, developers, and teams.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2">
                <button onClick={() => navigate('/chat')} className="block text-[11px] text-muted-foreground hover:text-foreground">AI Chat</button>
                <button onClick={() => navigate('/all-tools')} className="block text-[11px] text-muted-foreground hover:text-foreground">All Tools</button>
                <a href="#pricing" className="block text-[11px] text-muted-foreground hover:text-foreground">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Resources</h4>
              <div className="space-y-2">
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">Documentation</button>
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">Blog</button>
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">Changelog</button>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2">
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">About</button>
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">Careers</button>
                <button className="block text-[11px] text-muted-foreground hover:text-foreground">Contact</button>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">© 2026 COXMOX. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="text-[10px] text-muted-foreground hover:text-foreground">Privacy</button>
              <button className="text-[10px] text-muted-foreground hover:text-foreground">Terms</button>
              <button onClick={() => navigate('/settings')} className="text-[10px] text-muted-foreground hover:text-foreground">Settings</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
