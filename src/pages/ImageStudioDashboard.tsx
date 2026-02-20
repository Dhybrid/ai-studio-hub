import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Image } from 'lucide-react';
import ImageStudio from './ImageStudio';

const imageProjects: Project[] = [
  { id: 'img-1', name: 'Brand Assets', description: 'Generated brand imagery, logos, and marketing visuals.', updatedAt: '1 week ago', status: 'active' as const },
  { id: 'img-2', name: 'Social Media Pack', description: 'Instagram and Twitter post images with consistent branding.', updatedAt: '2 weeks ago', status: 'deployed' as const },
];

const imageTemplates: Template[] = [
  { id: 'itmpl-1', name: 'Product Photography', description: 'Studio-quality product shots with clean backgrounds.', author: 'COXMOX Team', category: 'Product' },
  { id: 'itmpl-2', name: 'Social Media Kit', description: 'Consistent brand imagery for Instagram, Twitter and LinkedIn.', author: 'Community', category: 'Social' },
];

const ImageStudioDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-10 flex items-center gap-3 px-4 border-b border-border bg-surface/50 flex-shrink-0">
          <button
            onClick={() => navigate('/image-studio')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Projects
          </button>
          <span className="text-xs text-border">|</span>
          <span className="text-xs font-medium text-foreground">
            {imageProjects.find(p => p.id === projectId)?.name || 'New Project'}
          </span>
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            ↗ Open in new tab
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ImageStudio />
        </div>
      </div>
    );
  }

  return (
    <ProjectDashboard
      title="Image Studio"
      subtitle="Generate and manage AI-powered images"
      icon={<Image className="w-4 h-4" />}
      projects={imageProjects}
      templates={imageTemplates}
      onOpenProject={(id) => navigate(`/image-studio/${id}`)}
      onNewProject={() => navigate('/image-studio/new')}
      promptPlaceholder="Describe the image you want to generate..."
    />
  );
};

export default ImageStudioDashboard;
