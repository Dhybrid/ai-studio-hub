import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Globe } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import WebBuilder from './WebBuilder';

const webProjects: Project[] = [
  { id: 'web-1', name: 'SaaS Landing Page', description: 'Modern landing page with hero section, pricing tables, and testimonials.', updatedAt: '2 hours ago', status: 'deployed' as const, thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop' },
  { id: 'web-2', name: 'E-commerce Dashboard', description: 'Admin dashboard for managing products, orders, and analytics.', updatedAt: '1 day ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
  { id: 'web-3', name: 'Portfolio Site', description: 'Minimal personal portfolio with project showcase and contact form.', updatedAt: '5 days ago', status: 'draft' as const, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop' },
];

const webTemplates: Template[] = [
  { id: 'tmpl-1', name: 'Startup Landing', description: 'Clean startup landing page with pricing, features, and CTA sections.', author: 'COXMOX Team', category: 'Landing Page', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
  { id: 'tmpl-2', name: 'Blog Platform', description: 'Full-featured blog with markdown support, categories, and search.', author: 'Community', category: 'Blog', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop' },
  { id: 'tmpl-3', name: 'Admin Dashboard', description: 'Analytics dashboard with charts, tables, and user management.', author: 'COXMOX Team', category: 'Dashboard', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
  { id: 'tmpl-4', name: 'E-commerce Store', description: 'Product catalog with cart, checkout, and order management.', author: 'Community', category: 'E-commerce', thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop' },
];

const WebBuilderDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const sidebarItems = webProjects.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: p.status,
    time: p.updatedAt,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar
        title="Web Builder"
        icon={Globe}
        items={sidebarItems}
        selectedId={projectId}
        onSelectItem={(id) => navigate(`/web-builder/${id}`)}
        onNewItem={() => navigate('/web-builder/new')}
        newItemLabel="New Project"
        searchPlaceholder="Search projects..."
        itemsLabel="Projects"
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {projectId ? (
          <WebBuilder />
        ) : (
          <ProjectDashboard
            title="Web Builder"
            subtitle="Build and deploy web applications with AI"
            icon={<Globe className="w-4 h-4" />}
            projects={webProjects}
            templates={webTemplates}
            onOpenProject={(id) => navigate(`/web-builder/${id}`)}
            onNewProject={() => navigate('/web-builder/new')}
            promptPlaceholder="Describe the website you want to build..."
          />
        )}
      </div>
    </div>
  );
};

export default WebBuilderDashboard;
