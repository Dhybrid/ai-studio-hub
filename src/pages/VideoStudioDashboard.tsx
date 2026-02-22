import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Video } from 'lucide-react';
import VideoStudio from './VideoStudio';

const videoProjects: Project[] = [
  { id: 'vid-1', name: 'Product Demo Video', description: 'AI-generated product walkthrough with voiceover and animations.', updatedAt: '1 day ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop' },
  { id: 'vid-2', name: 'Social Media Reel', description: 'Short-form vertical video for Instagram and TikTok.', updatedAt: '3 days ago', status: 'deployed' as const, thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop' },
];

const videoTemplates: Template[] = [
  { id: 'vtmpl-1', name: 'Product Showcase', description: 'Clean product demo video with transitions and text overlays.', author: 'COXMOX Team', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=250&fit=crop' },
  { id: 'vtmpl-2', name: 'Explainer Video', description: 'Animated explainer with motion graphics and narration.', author: 'Community', category: 'Education', thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=250&fit=crop' },
];

const VideoStudioDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return <VideoStudio />;
  }

  return (
    <ProjectDashboard
      title="Video Studio"
      subtitle="Create and edit videos with AI"
      icon={<Video className="w-4 h-4" />}
      projects={videoProjects}
      templates={videoTemplates}
      onOpenProject={(id) => navigate(`/video-studio/${id}`)}
      onNewProject={() => navigate('/video-studio/new')}
      promptPlaceholder="Describe the video you want to create..."
    />
  );
};

export default VideoStudioDashboard;
