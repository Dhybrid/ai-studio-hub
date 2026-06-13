import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, FileSpreadsheet, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  {
    icon: MessageSquare,
    label: 'AI Chat',
    description: 'General-purpose intelligent assistant powered by COXMOX Core. Ask anything, get expert-level answers.',
    path: '/chat',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]',
    badge: 'Active',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    icon: BookOpen,
    label: 'Cereva',
    description: 'AI-powered teaching assistant with interactive blackboard diagrams, voice mode, and step-by-step explanations.',
    path: '/cereva',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    badge: 'Active',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    icon: FileSpreadsheet,
    label: 'Office Studio',
    description: 'Create, edit and AI-generate documents, spreadsheets and presentations — all in one unified workspace.',
    path: '/office',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'hover:border-yellow-500/40 hover:shadow-[0_0_20px_rgba(234,179,8,0.08)]',
    badge: 'Active',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
];

const AllTools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070708]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-sm font-semibold text-white">COXMOX Tools</h1>
          </div>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono border border-white/5 rounded-full px-2 py-0.5">
            3 active modules
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Workspace</h2>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            All active COXMOX modules available in your plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <motion.button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={cn(
                "group flex flex-col p-5 rounded-2xl border bg-[#0b0b0d] text-left transition-all duration-300 relative overflow-hidden",
                tool.border,
                tool.glow
              )}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)]" />
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tool.bg)}>
                  <tool.icon className={cn("w-5 h-5", tool.color)} />
                </div>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5", tool.badgeColor)}>
                  {tool.badge}
                </span>
              </div>
              <h3 className={cn("text-sm font-bold text-white mb-1.5 transition-colors group-hover:", tool.color)}>
                {tool.label}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-light flex-1">
                {tool.description}
              </p>
              <div className={cn("mt-4 text-[10px] font-semibold flex items-center gap-1", tool.color)}>
                Open →
              </div>
            </motion.button>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-4">
            Coming Soon
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-40">
            {['Web Builder', 'Mobile Builder', 'Image Studio', 'Video Studio'].map((name) => (
              <div key={name} className="p-3 rounded-xl border border-white/5 bg-[#0b0b0d]">
                <p className="text-xs text-muted-foreground font-medium">{name}</p>
                <span className="text-[9px] text-muted-foreground/50 border border-white/5 rounded-full px-1.5 py-0.5 mt-1.5 inline-block">
                  Roadmap
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTools;
