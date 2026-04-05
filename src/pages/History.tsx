import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, Globe, Smartphone, Image } from 'lucide-react';

const historyItems = [
  { id: '1', type: 'chat', title: 'React hooks explanation', time: '2 hours ago', preview: 'Explain how React hooks work with a code example...' },
  { id: '2', type: 'web', title: 'SaaS Landing Page', time: '5 hours ago', preview: 'Built a modern SaaS landing page with hero, pricing...' },
  { id: '3', type: 'mobile', title: 'Fitness Tracker', time: '1 day ago', preview: 'Created a fitness tracking app with Flutter...' },
  { id: '4', type: 'image', title: 'Cyberpunk City', time: '2 days ago', preview: 'Generated a futuristic city at sunset, cyberpunk style...' },
  { id: '5', type: 'chat', title: 'TypeScript generics', time: '3 days ago', preview: 'Deep dive into TypeScript generics and utility types...' },
  { id: '6', type: 'web', title: 'E-commerce Dashboard', time: '4 days ago', preview: 'Admin dashboard for managing products and orders...' },
  { id: '7', type: 'image', title: 'Mountain Landscape', time: '1 week ago', preview: 'Mountain landscape with aurora borealis, photorealistic...' },
];

const typeIcon: Record<string, React.ReactNode> = {
  chat: <MessageSquare className="w-4 h-4" />,
  web: <Globe className="w-4 h-4" />,
  mobile: <Smartphone className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
};

const typeLabel: Record<string, string> = {
  chat: 'AI Chat',
  web: 'Web Builder',
  mobile: 'Mobile Builder',
  image: 'Image Studio',
};

const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-foreground">History</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-1">
          {historyItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-surface-hover transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                {typeIcon[item.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium flex-shrink-0">
                    {typeLabel[item.type]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.preview}</p>
              </div>
              <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-1">{item.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
