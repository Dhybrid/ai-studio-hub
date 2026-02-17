import { useState } from 'react';
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
            {mobileProjects.find(p => p.id === activeProjectId)?.name || 'New Project'}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <MobileBuilder />
        </div>
      </div>
    );
  }

  return (
    <ProjectDashboard
      title="Mobile Builder"
      subtitle="Build cross-platform mobile apps with AI"
      icon={<Smartphone className="w-4 h-4" />}
      projects={mobileProjects}
      templates={mobileTemplates}
      onOpenProject={(id) => setActiveProjectId(id)}
      onNewProject={() => setActiveProjectId('new')}
      promptPlaceholder="Describe the mobile app you want to build..."
    />
  );
};

export default MobileBuilderDashboard;
