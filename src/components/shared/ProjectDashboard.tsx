import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Clock, ArrowRight, Sparkles, LayoutGrid, Users, Shield, HardDrive, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'deployed';
  thumbnail?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  author: string;
  thumbnail?: string;
  category: string;
}

interface ProjectDashboardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  projects: Project[];
  templates?: Template[];
  onOpenProject: (id: string) => void;
  onNewProject: (prompt: string) => void;
  promptPlaceholder?: string;
}

export const ProjectDashboard = ({
  title,
  subtitle,
  icon,
  projects,
  templates = [],
  onOpenProject,
  onNewProject,
  promptPlaceholder = 'Describe what you want to build...',
}: ProjectDashboardProps) => {
  const [search, setSearch] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tab, setTab] = useState<'projects' | 'templates'>('projects');

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (prompt.trim()) {
      onNewProject(prompt.trim());
      setPrompt('');
    }
  };

  // Determine design system themes depending on office file type
  const labelLower = title.toLowerCase();
  const isDocs = labelLower.includes('document');
  const isSheets = labelLower.includes('spreadsheet');
  
  const themeColor = isDocs ? '#3b82f6' : isSheets ? '#22c55e' : '#f97316';
  const textClass = isDocs ? 'text-blue-400' : isSheets ? 'text-green-400' : 'text-orange-400';
  const bgClass = isDocs ? 'bg-blue-500/10' : isSheets ? 'bg-green-500/10' : 'bg-orange-500/10';
  const borderClass = isDocs 
    ? 'border-blue-500/20 focus-within:border-blue-500/50' 
    : isSheets 
    ? 'border-green-500/20 focus-within:border-green-500/50' 
    : 'border-orange-500/20 focus-within:border-orange-500/50';
  const glowShadow = isDocs 
    ? 'focus-within:shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
    : isSheets 
    ? 'focus-within:shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
    : 'focus-within:shadow-[0_0_30px_rgba(249,115,22,0.15)]';
  const hoverBorder = isDocs 
    ? 'hover:border-blue-500/35' 
    : isSheets 
    ? 'hover:border-green-500/35' 
    : 'hover:border-orange-500/35';

  return (
    <div className="h-full overflow-y-auto bg-[#070708] text-white">
      {/* Repeating grid masks */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      
      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        
        {/* Core Personal Dashboard Stats Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-xl border border-white/5 bg-[#0b0b0d]/50 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Workspace</span>
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", bgClass)}>
                {icon}
              </div>
            </div>
            <p className="text-lg font-bold text-white leading-none capitalize">{title}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-light">Custom local sandbox</p>
          </div>
          
          <div className="rounded-xl border border-white/5 bg-[#0b0b0d]/50 p-4">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Total Files</span>
            <p className="text-lg font-bold text-white leading-none">{projects.length} files</p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-light">Synced locally</p>
          </div>
          
          <div className="rounded-xl border border-white/5 bg-[#0b0b0d]/50 p-4">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Allocated Space</span>
            <p className="text-lg font-bold text-white leading-none flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
              <span>28.4 MB</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-light">Out of 1.0 GB limit</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0b0d]/50 p-4">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">AI Synthetics</span>
            <p className="text-lg font-bold text-white leading-none flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span>85.0K</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-light">Remaining tokens</p>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white border border-white/5 text-[10px] font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Generate draft template</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2 uppercase">{subtitle}</h1>
          <p className="text-xs text-muted-foreground mb-8 font-light">Describe what you need and the AI compiler will generate the workspace nodes.</p>

          <div className="relative max-w-2xl mx-auto">
            <div className={cn(
              "flex items-start rounded-2xl border bg-[#0b0b0d]/90 backdrop-blur-xl p-2.5 transition-all duration-350 shadow-lg",
              borderClass,
              glowShadow
            )}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                placeholder={promptPlaceholder}
                rows={2}
                className="flex-1 px-3 py-2 text-sm text-white bg-transparent outline-none resize-none placeholder:text-muted-foreground font-light"
              />
              <button
                onClick={handleCreate}
                disabled={!prompt.trim()}
                className="m-1.5 px-4.5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-100 transition-all disabled:opacity-20 flex items-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher & Search */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center p-0.5 rounded-xl bg-white/5 border border-white/5">
            <button
              onClick={() => setTab('projects')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                tab === 'projects'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Recent Files
            </button>
            {templates.length > 0 && (
              <button
                onClick={() => setTab('templates')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                  tab === 'templates'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                <Users className="w-3.5 h-3.5" />
                Templates
              </button>
            )}
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e0e11] border border-white/5 text-xs text-white outline-none focus:border-white/10 placeholder:text-muted-foreground font-light"
            />
          </div>
        </div>

        {/* List Grid Content */}
        <AnimatePresence mode="wait">
          {tab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Blank project create button */}
                <button
                  onClick={() => onNewProject('')}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0b0b0d]/20 transition-all min-h-[230px] group",
                    hoverBorder
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    New Blank File
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 mt-1.5 font-light">Compile from scratch</span>
                </button>

                {/* Projects list */}
                {filtered.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => onOpenProject(project.id)}
                    className={cn(
                      "group flex flex-col rounded-2xl border border-white/5 bg-[#0b0b0d]/50 transition-all cursor-pointer overflow-hidden relative",
                      hoverBorder
                    )}
                  >
                    {/* SVG preview thumbnail based on file type */}
                    <div className="h-[130px] bg-[#09090b]/80 border-b border-white/5 flex items-center justify-center relative overflow-hidden p-6">
                      {isDocs ? (
                        <svg className="w-full h-full max-w-[120px] opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 80" fill="none">
                          <rect x="15" y="5" width="70" height="70" rx="3" fill="#131317" stroke="#25252d" strokeWidth="1" />
                          <line x1="25" y1="20" x2="75" y2="20" stroke="#25252d" strokeWidth="2" />
                          <line x1="25" y1="30" x2="70" y2="30" stroke="#25252d" strokeWidth="2" />
                          <line x1="25" y1="40" x2="75" y2="40" stroke="#25252d" strokeWidth="2" />
                          <line x1="25" y1="50" x2="50" y2="50" stroke="#25252d" strokeWidth="2" />
                          {/* glowing indicator */}
                          <line x1="25" y1="60" x2="65" y2="60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                      ) : isSheets ? (
                        <svg className="w-full h-full max-w-[120px] opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 80" fill="none">
                          <rect x="15" y="5" width="70" height="70" rx="3" fill="#131317" stroke="#25252d" strokeWidth="1" />
                          <line x1="15" y1="22" x2="85" y2="22" stroke="#25252d" strokeWidth="1" />
                          <line x1="15" y1="40" x2="85" y2="40" stroke="#25252d" strokeWidth="1" />
                          <line x1="15" y1="58" x2="85" y2="58" stroke="#25252d" strokeWidth="1" />
                          <line x1="38" y1="5" x2="38" y2="75" stroke="#25252d" strokeWidth="1" />
                          <line x1="62" y1="5" x2="62" y2="75" stroke="#25252d" strokeWidth="1" />
                          {/* active cell glow */}
                          <rect x="38" y="22" width="24" height="18" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1" />
                        </svg>
                      ) : (
                        <svg className="w-full h-full max-w-[120px] opacity-75 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 80" fill="none">
                          <rect x="15" y="10" width="70" height="55" rx="3" fill="#131317" stroke="#25252d" strokeWidth="1" />
                          <line x1="35" y1="65" x2="65" y2="65" stroke="#25252d" strokeWidth="1.5" />
                          <line x1="50" y1="65" x2="50" y2="75" stroke="#25252d" strokeWidth="1.5" />
                          {/* slide mockup */}
                          <circle cx="42" cy="38" r="14" fill="#202026" stroke="#2d2d37" />
                          <path d="M42 38 L42 24 A14 14 0 0 1 56 38 Z" fill="#f97316" />
                        </svg>
                      )}
                      
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={cn(
                            'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-sm',
                            project.status === 'deployed'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : project.status === 'active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 border-white/5 text-muted-foreground'
                          )}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Details content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1 uppercase tracking-wide">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1 font-light leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                          <Clock className="w-3 h-3" />
                          {project.updatedAt}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xs text-muted-foreground font-light">No documents stored in this workspace.</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Templates list */
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => onOpenProject(template.id)}
                    className={cn(
                      "group flex flex-col rounded-2xl border border-white/5 bg-[#0b0b0d]/50 transition-all cursor-pointer overflow-hidden relative",
                      hoverBorder
                    )}
                  >
                    {/* SVG mockup previews for templates */}
                    <div className="h-[130px] bg-[#09090b]/80 border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
                      {isDocs ? (
                        <svg className="w-full h-full max-w-[120px] opacity-65 group-hover:opacity-90" viewBox="0 0 100 80" fill="none">
                          <rect x="20" y="5" width="60" height="70" rx="2" fill="#131317" stroke="#2a2a35" />
                          <rect x="28" y="15" width="44" height="6" fill="#202026" />
                          <line x1="28" y1="28" x2="72" y2="28" stroke="#25252d" strokeWidth="2" />
                          <line x1="28" y1="36" x2="65" y2="36" stroke="#25252d" strokeWidth="2" />
                        </svg>
                      ) : isSheets ? (
                        <svg className="w-full h-full max-w-[120px] opacity-65 group-hover:opacity-90" viewBox="0 0 100 80" fill="none">
                          <rect x="15" y="10" width="70" height="60" rx="2" fill="#131317" stroke="#2a2a35" />
                          <line x1="15" y1="25" x2="85" y2="25" stroke="#25252d" strokeWidth="1" />
                          <line x1="15" y1="42" x2="85" y2="42" stroke="#25252d" strokeWidth="1" />
                          <line x1="40" y1="10" x2="40" y2="70" stroke="#25252d" strokeWidth="1" />
                        </svg>
                      ) : (
                        <svg className="w-full h-full max-w-[120px] opacity-65 group-hover:opacity-90" viewBox="0 0 100 80" fill="none">
                          <rect x="15" y="15" width="70" height="50" rx="2" fill="#131317" stroke="#2a2a35" />
                          <circle cx="45" cy="40" r="10" fill="#202026" />
                        </svg>
                      )}
                      
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-muted-foreground backdrop-blur-sm">
                          {template.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1 uppercase tracking-wide">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 font-light leading-relaxed">{template.description}</p>
                      <p className="text-[9px] text-muted-foreground/40 mt-3 font-mono">Segment: {template.author}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-xs text-muted-foreground font-light">No templates configured for this category.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
