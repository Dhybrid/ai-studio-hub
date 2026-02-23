import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Smartphone } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import MobileBuilder from './MobileBuilder';

const mobileProjects: Project[] = [
  { id: 'mob-1', name: 'Fitness Tracker', description: 'Cross-platform fitness tracking app with workout logs and progress charts.', updatedAt: '3 days ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=250&fit=crop' },
  { id: 'mob-2', name: 'Recipe App', description: 'Social recipe sharing app with meal planning features.', updatedAt: '1 week ago', status: 'draft' as const, thumbnail: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=250&fit=crop' },
];

const mobileTemplates: Template[] = [
  { id: 'mtmpl-1', name: 'Social Feed App', description: 'Instagram-style social feed with stories, posts, and profiles.', author: 'COXMOX Team', category: 'Social', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop' },
  { id: 'mtmpl-2', name: 'Task Manager', description: 'Kanban-style task management app with drag-and-drop.', author: 'Community', category: 'Productivity', thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=250&fit=crop' },
  { id: 'mtmpl-3', name: 'Chat Messenger', description: 'Real-time messaging app with group chats and media sharing.', author: 'COXMOX Team', category: 'Messaging', thumbnail: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=250&fit=crop' },
];

const MobileBuilderDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const sidebarItems = mobileProjects.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: p.status,
    time: p.updatedAt,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar
        title="Mobile Builder"
        icon={Smartphone}
        items={sidebarItems}
        selectedId={projectId}
        onSelectItem={(id) => navigate(`/mobile-builder/${id}`)}
        onNewItem={() => navigate('/mobile-builder/new')}
        newItemLabel="New App"
        searchPlaceholder="Search apps..."
        itemsLabel="Projects"
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {projectId ? (
          <MobileBuilder />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default MobileBuilderDashboard;
