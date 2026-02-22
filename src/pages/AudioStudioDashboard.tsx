import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { Music } from 'lucide-react';
import AudioStudio from './AudioStudio';

const audioProjects: Project[] = [
  { id: 'aud-1', name: 'Podcast Episode 12', description: 'AI-generated podcast with multiple voice actors and sound design.', updatedAt: '2 days ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop' },
  { id: 'aud-2', name: 'Product Voiceover', description: 'Professional voiceover for marketing video campaign.', updatedAt: '1 week ago', status: 'deployed' as const, thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop' },
];

const audioTemplates: Template[] = [
  { id: 'atmpl-1', name: 'Podcast', description: 'Multi-voice podcast with intro music and transitions.', author: 'COXMOX Team', category: 'Podcast', thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=250&fit=crop' },
  { id: 'atmpl-2', name: 'Audiobook', description: 'Narrated audiobook with chapter markers and ambient sound.', author: 'Community', category: 'Narration', thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=250&fit=crop' },
  { id: 'atmpl-3', name: 'Sound Effects Pack', description: 'Collection of AI-generated sound effects for games and apps.', author: 'COXMOX Team', category: 'SFX', thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=250&fit=crop' },
];

const AudioStudioDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return <AudioStudio />;
  }

  return (
    <ProjectDashboard
      title="Audio Studio"
      subtitle="Generate music, voiceovers, and sound effects with AI"
      icon={<Music className="w-4 h-4" />}
      projects={audioProjects}
      templates={audioTemplates}
      onOpenProject={(id) => navigate(`/audio-studio/${id}`)}
      onNewProject={() => navigate('/audio-studio/new')}
      promptPlaceholder="Describe the audio you want to create..."
    />
  );
};

export default AudioStudioDashboard;
