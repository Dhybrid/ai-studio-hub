import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Smartphone } from 'lucide-react';
import MobileBuilder from './MobileBuilder';

const mobileProjects: Project[] = [
  { id: 'mob-1', name: 'Fitness Tracker', description: 'Cross-platform fitness tracking app with workout logs and progress charts.', updatedAt: '3 days ago', status: 'active' as const },
  { id: 'mob-2', name: 'Recipe App', description: 'Social recipe sharing app with meal planning features.', updatedAt: '1 week ago', status: 'draft' as const },
];

const mobileTemplates: Template[] = [
  { id: 'mtmpl-1', name: 'Social Feed App', description: 'Instagram-style social feed with stories, posts, and profiles.', author: 'COXMOX Team', category: 'Social' },
  { id: 'mtmpl-2', name: 'Task Manager', description: 'Kanban-style task management app with drag-and-drop.', author: 'Community', category: 'Productivity' },
  { id: 'mtmpl-3', name: 'Chat Messenger', description: 'Real-time messaging app with group chats and media sharing.', author: 'COXMOX Team', category: 'Messaging' },
];

const MobileBuilderDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return <MobileBuilder />;
  }

  return (
    <ProjectDashboard
      title="Mobile Builder"
      subtitle="Build cross-platform mobile apps with AI"
      icon={<Smartphone className="w-4 h-4" />}
      projects={mobileProjects}
      templates={mobileTemplates}
      onOpenProject={(id) => navigate(`/mobile-builder/${id}`)}
      onNewProject={() => navigate('/mobile-builder/new')}
      promptPlaceholder="Describe the mobile app you want to build..."
    />
  );
};

export default MobileBuilderDashboard;
