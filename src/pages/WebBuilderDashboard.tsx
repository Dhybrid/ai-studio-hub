import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return <WebBuilder />;
  }

  return (
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
  );
};

export default WebBuilderDashboard;
