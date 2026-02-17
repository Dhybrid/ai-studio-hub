import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectDashboard, Project } from '@/components/shared/ProjectDashboard';
import { Globe } from 'lucide-react';
import WebBuilder from './WebBuilder';

const webProjects: Project[] = [
  { id: 'web-1', name: 'SaaS Landing Page', description: 'Modern landing page with hero section, pricing tables, and testimonials.', updatedAt: '2 hours ago', status: 'deployed' as const },
  { id: 'web-2', name: 'E-commerce Dashboard', description: 'Admin dashboard for managing products, orders, and analytics.', updatedAt: '1 day ago', status: 'active' as const },
  { id: 'web-3', name: 'Portfolio Site', description: 'Minimal personal portfolio with project showcase and contact form.', updatedAt: '5 days ago', status: 'draft' as const },
];

const WebBuilderDashboard = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (activeProjectId) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-10 flex items-center gap-3 px-4 border-b border-border bg-surface/50 flex-shrink-0">
          <button
            onClick={() => setActiveProjectId(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Projects
          </button>
          <span className="text-xs text-border">|</span>
          <span className="text-xs font-medium text-foreground">
            {webProjects.find(p => p.id === activeProjectId)?.name || 'New Project'}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <WebBuilder />
        </div>
      </div>
    );
  }

  return (
    <ProjectDashboard
      title="Web Builder"
      subtitle="Build and deploy web applications with AI"
      icon={<Globe className="w-5 h-5 text-accent" />}
      projects={webProjects}
      onOpenProject={(id) => setActiveProjectId(id)}
      onNewProject={() => setActiveProjectId('new')}
    />
  );
};

export default WebBuilderDashboard;
