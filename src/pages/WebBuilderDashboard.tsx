import { useState } from 'react';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Globe } from 'lucide-react';
import WebBuilder from './WebBuilder';

const webProjects: Project[] = [
  { id: 'web-1', name: 'SaaS Landing Page', description: 'Modern landing page with hero section, pricing tables, and testimonials.', updatedAt: '2 hours ago', status: 'deployed' as const },
  { id: 'web-2', name: 'E-commerce Dashboard', description: 'Admin dashboard for managing products, orders, and analytics.', updatedAt: '1 day ago', status: 'active' as const },
  { id: 'web-3', name: 'Portfolio Site', description: 'Minimal personal portfolio with project showcase and contact form.', updatedAt: '5 days ago', status: 'draft' as const },
];

const webTemplates: Template[] = [
  { id: 'tmpl-1', name: 'Startup Landing', description: 'Clean startup landing page with pricing, features, and CTA sections.', author: 'COXMOX Team', category: 'Landing Page' },
  { id: 'tmpl-2', name: 'Blog Platform', description: 'Full-featured blog with markdown support, categories, and search.', author: 'Community', category: 'Blog' },
  { id: 'tmpl-3', name: 'Admin Dashboard', description: 'Analytics dashboard with charts, tables, and user management.', author: 'COXMOX Team', category: 'Dashboard' },
  { id: 'tmpl-4', name: 'E-commerce Store', description: 'Product catalog with cart, checkout, and order management.', author: 'Community', category: 'E-commerce' },
];

const WebBuilderDashboard = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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
      icon={<Globe className="w-4 h-4" />}
      projects={webProjects}
      templates={webTemplates}
      onOpenProject={(id) => setActiveProjectId(id)}
      onNewProject={() => setActiveProjectId('new')}
      promptPlaceholder="Describe the website you want to build..."
    />
  );
};

export default WebBuilderDashboard;
