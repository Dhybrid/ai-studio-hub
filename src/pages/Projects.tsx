import { useNavigate } from 'react-router-dom';
import { ProjectDashboard, Project } from '@/components/shared/ProjectDashboard';
import { Folder } from 'lucide-react';

const allProjects: Project[] = [
  { id: 'web-1', name: 'SaaS Landing Page', description: 'Modern landing page with hero section, pricing, and testimonials.', updatedAt: '2 hours ago', status: 'deployed' as const },
  { id: 'web-2', name: 'E-commerce Dashboard', description: 'Admin dashboard for managing products, orders, and analytics.', updatedAt: '1 day ago', status: 'active' as const },
  { id: 'mobile-1', name: 'Fitness Tracker', description: 'Cross-platform fitness tracking app built with Flutter.', updatedAt: '3 days ago', status: 'active' as const },
  { id: 'img-1', name: 'Brand Assets', description: 'Generated brand imagery and logo variations.', updatedAt: '1 week ago', status: 'draft' as const },
];

const ProjectsPage = () => {
  const navigate = useNavigate();

  return (
    <ProjectDashboard
      title="All Projects"
      subtitle="Manage all your projects across workspaces"
      icon={<Folder className="w-5 h-5 text-accent" />}
      projects={allProjects}
      onOpenProject={(id) => navigate(`/projects/${id}`)}
      onNewProject={() => navigate('/web-builder/new')}
    />
  );
};

export default ProjectsPage;
