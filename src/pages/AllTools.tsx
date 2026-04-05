import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Image, Video, Music, FileSpreadsheet, BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const tools = [
  { icon: BookOpen, label: 'Cereva', description: 'AI teaching assistant with voice mode, diagrams & live explanations', path: '/cereva', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: Globe, label: 'Web Builder', description: 'Build & deploy responsive web applications with AI', path: '/web-builder', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Smartphone, label: 'Mobile Builder', description: 'Create cross-platform mobile apps with Flutter, React Native', path: '/mobile-builder', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { icon: Image, label: 'Image Studio', description: 'Generate and edit images with AI-powered tools', path: '/image-studio', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { icon: Video, label: 'Video Studio', description: 'Create and edit videos with AI generation & editing', path: '/video-studio', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Music, label: 'Audio Studio', description: 'Generate music, voiceovers & sound effects with voices', path: '/audio-studio', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: FileSpreadsheet, label: 'Office', description: 'Create presentations, reports & data analysis with AI', path: '/office', color: 'text-green-500', bg: 'bg-green-500/10' },
];

const AllTools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">All Tools & Builders</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <motion.a
              key={tool.path}
              href={tool.path}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-lg transition-all"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", tool.bg)}>
                <tool.icon className={cn("w-5 h-5", tool.color)} />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                {tool.label}
                <ExternalLink className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllTools;
