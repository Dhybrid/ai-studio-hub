import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Clock, ArrowRight, Sparkles, LayoutGrid, Users } from 'lucide-react';
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero / Prompt Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-5">
            {icon}
            <span>{title}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{subtitle}</h1>
          <p className="text-sm text-muted-foreground mb-8">Start with a prompt or continue an existing project</p>

          {/* Prompt Input */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-start gap-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-accent focus-within:border-accent transition-all">
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
                className="flex-1 px-4 py-3.5 text-sm text-foreground bg-transparent outline-none resize-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleCreate}
                disabled={!prompt.trim()}
                className="m-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Tab Toggle + Search */}
        <div className="flex items-center justify-between mb-5 gap-4">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted">
            <button
              onClick={() => setTab('projects')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                tab === 'projects'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              My Projects
            </button>
            {templates.length > 0 && (
              <button
                onClick={() => setTab('templates')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  tab === 'templates'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* New Project Card */}
                <motion.button
                  onClick={() => onNewProject('')}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all min-h-[220px] group"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    New Project
                  </span>
                  <span className="text-[11px] text-muted-foreground/60 mt-1">Start from scratch</span>
                </motion.button>

                {filtered.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => onOpenProject(project.id)}
                    className="group flex flex-col rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="h-[130px] bg-muted/50 relative overflow-hidden">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
                            {icon}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm',
                            project.status === 'deployed'
                              ? 'bg-success/20 text-success'
                              : project.status === 'active'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-muted/80 text-muted-foreground'
                          )}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {project.updatedAt}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-sm text-muted-foreground">No projects found</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => onOpenProject(template.id)}
                    className="group flex flex-col rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="h-[130px] bg-muted/50 relative overflow-hidden flex items-center justify-center">
                      {template.thumbnail ? (
                        <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
                          {icon}
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent/20 text-accent backdrop-blur-sm">
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{template.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">by {template.author}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-sm text-muted-foreground">No templates available yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
