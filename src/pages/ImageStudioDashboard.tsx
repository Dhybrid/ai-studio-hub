import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Image } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import ImageStudio from './ImageStudio';

const imageProjects: Project[] = [
  { id: 'img-1', name: 'Brand Assets', description: 'Generated brand imagery, logos, and marketing visuals.', updatedAt: '1 week ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop' },
  { id: 'img-2', name: 'Social Media Pack', description: 'Instagram and Twitter post images with consistent branding.', updatedAt: '2 weeks ago', status: 'deployed' as const, thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=250&fit=crop' },
];

const imageTemplates: Template[] = [
  { id: 'itmpl-1', name: 'Product Photography', description: 'Studio-quality product shots with clean backgrounds.', author: 'COXMOX Team', category: 'Product', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=250&fit=crop' },
  { id: 'itmpl-2', name: 'Social Media Kit', description: 'Consistent brand imagery for Instagram, Twitter and LinkedIn.', author: 'Community', category: 'Social', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=250&fit=crop' },
];

const ImageStudioDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const sidebarItems = imageProjects.map(p => ({
    id: p.id,
    name: p.name,
    subtitle: p.status,
    time: p.updatedAt,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar
        title="Image Studio"
        icon={Image}
        items={sidebarItems}
        selectedId={projectId}
        onSelectItem={(id) => navigate(`/image-studio/${id}`)}
        onNewItem={() => navigate('/image-studio/new')}
        newItemLabel="New Image Project"
        searchPlaceholder="Search projects..."
        itemsLabel="Projects"
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {projectId ? (
          <ImageStudio />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ImageStudioDashboard;
