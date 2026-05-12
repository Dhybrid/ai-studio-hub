import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Presentation, Sparkles, Briefcase, GraduationCap, Rocket, BarChart3, Palette, Heart, Award, Lightbulb, Target, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  accent: string;
  previewBg: string;
  titleColor: string;
}

const templates: Template[] = [
  { id: 'blank', name: 'Blank Presentation', description: 'Start from a clean slide', icon: Presentation, category: 'Basic', accent: 'from-zinc-200 to-zinc-50', previewBg: 'bg-white', titleColor: 'bg-zinc-300' },
  { id: 'pitch-deck', name: 'Startup Pitch Deck', description: '10-slide investor pitch', icon: Rocket, category: 'Business', accent: 'from-orange-200 to-orange-50', previewBg: 'bg-gradient-to-br from-orange-500 to-pink-500', titleColor: 'bg-white/80' },
  { id: 'business-review', name: 'Business Review', description: 'Quarterly business review', icon: BarChart3, category: 'Business', accent: 'from-blue-200 to-blue-50', previewBg: 'bg-gradient-to-br from-blue-600 to-indigo-700', titleColor: 'bg-white/80' },
  { id: 'product-launch', name: 'Product Launch', description: 'Announce a new product', icon: Award, category: 'Marketing', accent: 'from-purple-200 to-purple-50', previewBg: 'bg-gradient-to-br from-purple-600 to-pink-600', titleColor: 'bg-white/80' },
  { id: 'lesson-plan', name: 'Lesson Plan', description: 'Educational template', icon: GraduationCap, category: 'Education', accent: 'from-emerald-200 to-emerald-50', previewBg: 'bg-gradient-to-br from-emerald-600 to-teal-600', titleColor: 'bg-white/80' },
  { id: 'portfolio', name: 'Creative Portfolio', description: 'Showcase your work', icon: Palette, category: 'Creative', accent: 'from-rose-200 to-rose-50', previewBg: 'bg-gradient-to-br from-rose-500 to-fuchsia-600', titleColor: 'bg-white/80' },
  { id: 'team-update', name: 'Team Update', description: 'Status & milestones', icon: Users, category: 'Work', accent: 'from-cyan-200 to-cyan-50', previewBg: 'bg-gradient-to-br from-cyan-600 to-sky-700', titleColor: 'bg-white/80' },
  { id: 'training', name: 'Training Deck', description: 'Onboarding & training', icon: BookOpen, category: 'Education', accent: 'from-amber-200 to-amber-50', previewBg: 'bg-gradient-to-br from-amber-500 to-orange-600', titleColor: 'bg-white/80' },
  { id: 'minimal-dark', name: 'Minimal Dark', description: 'Sleek dark theme', icon: Target, category: 'Creative', accent: 'from-zinc-700 to-zinc-900', previewBg: 'bg-zinc-900', titleColor: 'bg-zinc-100' },
  { id: 'sales-proposal', name: 'Sales Proposal', description: 'Win the deal', icon: Briefcase, category: 'Business', accent: 'from-indigo-200 to-indigo-50', previewBg: 'bg-gradient-to-br from-indigo-700 to-blue-900', titleColor: 'bg-white/80' },
  { id: 'wedding', name: 'Event Slides', description: 'Special occasion', icon: Heart, category: 'Personal', accent: 'from-red-200 to-red-50', previewBg: 'bg-gradient-to-br from-red-400 to-rose-500', titleColor: 'bg-white/80' },
  { id: 'idea-board', name: 'Idea Board', description: 'Brainstorm session', icon: Lightbulb, category: 'Creative', accent: 'from-yellow-200 to-yellow-50', previewBg: 'bg-gradient-to-br from-yellow-400 to-amber-500', titleColor: 'bg-zinc-900/70' },
];

const categories = ['All', 'Basic', 'Business', 'Marketing', 'Education', 'Creative', 'Work', 'Personal'];

export default function PresentationTemplatePicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    (active === 'All' || t.category === active) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const open = (id: string) => {
    const projectId = `pres-${Date.now()}`;
    const prompt = searchParams.get('prompt');
    const params = new URLSearchParams({ template: id });
    if (prompt) params.set('prompt', prompt);
    navigate(`/office/presentations/${projectId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4 sm:px-6 gap-3 bg-background">
        <button onClick={() => navigate('/office/presentations')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Presentation className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <h1 className="text-base font-semibold text-foreground truncate">New Presentation</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent w-32 sm:w-64"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Start a new presentation</h2>
              <p className="text-xs text-muted-foreground mt-1">Pick a designed template or start blank — your PowerPoint workspace opens after this.</p>
            </div>

            <button
              onClick={() => open('blank')}
              className="group w-full sm:max-w-xs flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
            >
              <div className="w-20 h-12 bg-card border border-border rounded-md flex items-center justify-center flex-shrink-0 group-hover:border-accent">
                <Presentation className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Blank presentation</div>
                <div className="text-[11px] text-muted-foreground">Start from scratch</div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-border">
              {categories.map(c => (
                <button key={c} onClick={() => setActive(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active === c
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
              {filtered.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => open(t.id)}
                    className="group flex flex-col text-left rounded-xl overflow-hidden border border-border hover:border-accent hover:shadow-lg transition-all bg-card">
                    <div className={`aspect-[16/9] bg-gradient-to-br ${t.accent} relative flex items-center justify-center p-4`}>
                      <div className={`absolute inset-3 ${t.previewBg} rounded-md shadow-md p-3 flex flex-col gap-2`}>
                        <div className={`h-2.5 w-2/3 ${t.titleColor} rounded-sm`} />
                        <div className={`h-1.5 w-full ${t.titleColor} opacity-50 rounded-sm`} />
                        <div className={`h-1.5 w-4/5 ${t.titleColor} opacity-50 rounded-sm`} />
                        <div className="flex-1" />
                        <div className="flex gap-1">
                          <div className={`h-1 w-8 ${t.titleColor} opacity-30 rounded-sm`} />
                          <div className={`h-1 w-8 ${t.titleColor} opacity-30 rounded-sm`} />
                        </div>
                      </div>
                      <Icon className="absolute bottom-2 right-2 w-4 h-4 text-zinc-700/40" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-semibold text-foreground truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-12 rounded-xl border border-border bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Generate slides with AI</div>
                <div className="text-xs text-muted-foreground">Describe your topic — get a fully designed deck.</div>
              </div>
              <button onClick={() => open('blank')} className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 flex-shrink-0">
                Try it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
