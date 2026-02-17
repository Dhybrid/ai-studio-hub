import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Clock, Folder, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  status: 'active' | 'draft' | 'deployed';
}

interface ProjectDashboardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  projects: Project[];
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

export const ProjectDashboard = ({
  title,
  subtitle,
  icon,
  projects,
  onOpenProject,
  onNewProject,
}: ProjectDashboardProps) => {
  const [search, setSearch] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
          />
        </div>

        {/* Projects Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Folder className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-1">No projects yet</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New Project Card */}
            <motion.button
              onClick={onNewProject}
              whileHover={{ scale: 1.01 }}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all min-h-[160px] group"
            >
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                New Project
              </span>
            </motion.button>

            {filtered.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onOpenProject(project.id)}
                className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-sm transition-all cursor-pointer min-h-[160px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      project.status === 'deployed'
                        ? 'bg-success/10 text-success'
                        : project.status === 'active'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex-1 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {project.updatedAt}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
