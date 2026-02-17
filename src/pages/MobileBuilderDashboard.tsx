import { useState } from 'react';
import { ProjectDashboard, Project } from '@/components/shared/ProjectDashboard';
import { Smartphone } from 'lucide-react';
import MobileBuilder from './MobileBuilder';

const mobileProjects: Project[] = [
  { id: 'mob-1', name: 'Fitness Tracker', description: 'Cross-platform fitness tracking app with workout logs and progress charts.', updatedAt: '3 days ago', status: 'active' as const },
  { id: 'mob-2', name: 'Recipe App', description: 'Social recipe sharing app with meal planning features.', updatedAt: '1 week ago', status: 'draft' as const },
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
      icon={<Smartphone className="w-5 h-5 text-accent" />}
      projects={mobileProjects}
      onOpenProject={(id) => setActiveProjectId(id)}
      onNewProject={() => setActiveProjectId('new')}
    />
  );
};

export default MobileBuilderDashboard;
