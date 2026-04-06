import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileSpreadsheet, FileText, Presentation, Wand2, Loader2, ArrowLeft, Clock, Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import OfficeEditor from './OfficeEditor';

type OfficeType = 'document' | 'spreadsheet' | 'presentation';

const officeTypes = [
  {
    id: 'document' as const,
    icon: FileText,
    title: 'Document',
    desc: 'Create rich text documents with formatting, tables, and images',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    recentItems: [
      { name: 'Q4 Business Report', time: '2 hours ago' },
      { name: 'Meeting Notes - Dec', time: '1 day ago' },
      { name: 'Project Proposal', time: '3 days ago' },
    ]
  },
  {
    id: 'spreadsheet' as const,
    icon: FileSpreadsheet,
    title: 'Spreadsheet',
    desc: 'Build data tables with formulas, charts, and analysis tools',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    recentItems: [
      { name: 'Sales Dashboard 2024', time: '5 hours ago' },
      { name: 'Budget Tracker', time: '2 days ago' },
      { name: 'Inventory List', time: '1 week ago' },
    ]
  },
  {
    id: 'presentation' as const,
    icon: Presentation,
    title: 'Presentation',
    desc: 'Design professional slide decks with layouts and visuals',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    recentItems: [
      { name: 'Product Pitch Deck', time: '1 day ago' },
      { name: 'Company Overview', time: '4 days ago' },
      { name: 'Team Update Q4', time: '1 week ago' },
    ]
  },
];

const OfficeDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<OfficeType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }
  }, [prompt]);

  if (projectId) {
    return <div className="flex h-screen w-full overflow-hidden bg-background"><OfficeEditor /></div>;
  }

  const handleCreate = (type: OfficeType) => {
    navigate(`/office/new?mode=${type}`);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const type = selectedType || 'document';
    setTimeout(() => {
      setIsGenerating(false);
      navigate(`/office/new?mode=${type}`);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 sm:px-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            <h1 className="text-base font-semibold text-foreground">Office Suite</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-2">What do you want to create?</h2>
            <p className="text-sm text-muted-foreground">Choose a format below or describe what you need with AI</p>
          </div>

          {/* AI Prompt */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-surface border border-border rounded-xl p-3">
              {/* Type pills */}
              <div className="flex items-center gap-2 mb-2 px-1">
                {officeTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(selectedType === t.id ? null : t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      selectedType === t.id ? `${t.bg} ${t.color} ${t.border} border` : "text-muted-foreground hover:bg-surface-hover border border-transparent"
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {!isMobile && t.title}
                  </button>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[44px] max-h-[160px] overflow-y-auto"
                placeholder={selectedType ? `Describe the ${selectedType} you want to create...` : "Describe what you need — e.g. 'Create a Q4 sales report with charts'"}
                rows={1}
              />
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-muted-foreground">{selectedType ? `Will create a ${selectedType}` : 'Select a type or let AI decide'}</p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium flex items-center gap-2 disabled:opacity-30 transition-opacity"
                >
                  {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
                </button>
              </div>
            </div>
          </div>

          {/* Office Type Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {officeTypes.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-accent/30 transition-colors group">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.bg)}>
                      <t.icon className={cn("w-5 h-5", t.color)} />
                    </div>
                    <button
                      onClick={() => handleCreate(t.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>

                {/* Recent items */}
                <div className="border-t border-border px-4 py-3 bg-muted/20">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Recent</p>
                  <div className="space-y-1.5">
                    {t.recentItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/office/recent-${t.id}-${i}?mode=${t.id}`)}
                        className="w-full flex items-center justify-between py-1 hover:bg-surface-hover rounded px-1.5 -mx-1.5 transition-colors"
                      >
                        <span className="text-xs text-foreground truncate">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{item.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3">Or start a blank file</p>
            <div className="flex items-center justify-center gap-3">
              {officeTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleCreate(t.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all text-sm text-muted-foreground hover:text-foreground"
                >
                  <t.icon className={cn("w-4 h-4", t.color)} />
                  Blank {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
