import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { ProjectDashboard, Project } from '@/components/shared/ProjectDashboard';

const allProjects: Project[] = [
  { id: 'web-1', name: 'SaaS Landing Page', description: 'Modern landing page with hero section, pricing, and testimonials.', updatedAt: '2 hours ago', status: 'deployed' as const },
  { id: 'web-2', name: 'E-commerce Dashboard', description: 'Admin dashboard for managing products, orders, and analytics.', updatedAt: '1 day ago', status: 'active' as const },
  { id: 'mobile-1', name: 'Fitness Tracker', description: 'Cross-platform fitness tracking app built with Flutter.', updatedAt: '3 days ago', status: 'active' as const },
  { id: 'img-1', name: 'Brand Assets', description: 'Generated brand imagery and logo variations.', updatedAt: '1 week ago', status: 'draft' as const },
];

const ProjectsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-foreground">Projects</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ProjectDashboard
          title="All Projects"
          subtitle="Manage all your projects across workspaces"
          icon={<FolderOpen className="w-4 h-4" />}
          projects={allProjects}
          onOpenProject={(id) => navigate(`/projects/${id}`)}
          onNewProject={() => navigate('/web-builder')}
          promptPlaceholder="Describe what you want to build..."
        />
      </div>
    </div>
  );
};

export default ProjectsPage;
