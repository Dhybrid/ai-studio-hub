import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileSpreadsheet, FileText, Presentation, Wand2, Loader2, ArrowLeft, Clock, Plus, Sparkles, Shield, Zap, Globe, Users, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import OfficeEditor from './OfficeEditor';

type OfficeType = 'document' | 'spreadsheet' | 'presentation';

const officeTypes = [
  {
    id: 'document' as const, icon: FileText, title: 'Document', desc: 'Rich text documents with formatting, tables, and images',
    color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', homePath: '/office/documents',
    features: ['Rich text formatting', 'Tables & images', 'Headers & footers', 'Export to PDF/DOCX'],
  },
  {
    id: 'spreadsheet' as const, icon: FileSpreadsheet, title: 'Spreadsheet', desc: 'Data tables with formulas, charts, and analysis tools',
    color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', homePath: '/office/spreadsheets',
    features: ['100+ formulas', 'Charts & graphs', 'Cell formatting', 'Export to XLSX'],
  },
  {
    id: 'presentation' as const, icon: Presentation, title: 'Presentation', desc: 'Professional slide decks with themes and animations',
    color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', homePath: '/office/presentations',
    features: ['Multiple layouts', 'Theme templates', 'Fullscreen present', 'Export to PPTX'],
  },
];

const tips = [
  { title: 'Use AI to Draft', desc: 'Type a prompt to generate entire documents, spreadsheets, or presentations instantly.' },
  { title: 'Keyboard Shortcuts', desc: 'Ctrl+S saves, Ctrl+B bolds, Ctrl+P prints. All standard shortcuts work.' },
  { title: 'Real-time Save', desc: 'Your work is auto-saved to the cloud. Look for the green cloud icon.' },
  { title: 'Voice Dictation', desc: 'Click the microphone button in any editor to dictate content hands-free.' },
];

const OfficeDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<OfficeType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }
  }, [prompt]);

  if (projectId === 'new' && (searchParams.get('mode') === 'document' || !searchParams.get('mode'))) {
    return <Navigate to="/office/documents/new" replace />;
  }

  if (projectId) {
    return <div className="flex h-screen w-full overflow-hidden bg-background"><OfficeEditor /></div>;
  }

  const handleCreate = (type: OfficeType) => {
    if (type === 'document') {
      navigate('/office/documents/new');
      return;
    }
    navigate(`/office/new?mode=${type}`);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const type = selectedType || 'document';
    setTimeout(() => {
      setIsGenerating(false);
      if (type === 'document') {
        navigate(`/office/documents/new?prompt=${encodeURIComponent(prompt.trim())}`);
        return;
      }
      navigate(`/office/new?mode=${type}`);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 sm:px-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            <h1 className="text-base font-semibold text-foreground">Office Suite</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" /> AI-Powered Office
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-2">Create anything with AI</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Documents, spreadsheets, and presentations — powered by AI or built manually</p>
          </div>

          {/* AI Prompt */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2 px-1">
                {officeTypes.map((t) => (
                  <button key={t.id} onClick={() => setSelectedType(selectedType === t.id ? null : t.id)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      selectedType === t.id ? `${t.bg} ${t.color} ${t.border} border` : "text-muted-foreground hover:bg-surface-hover border border-transparent")}>
                    <t.icon className="w-3.5 h-3.5" />
                    {!isMobile && t.title}
                  </button>
                ))}
              </div>
              <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[44px] max-h-[160px] overflow-y-auto"
                placeholder={selectedType ? `Describe the ${selectedType} you want to create...` : "Describe what you need — e.g. 'Create a Q4 sales report with charts'"} rows={1} />
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-muted-foreground">{selectedType ? `Will create a ${selectedType}` : 'Select a type or let AI decide'}</p>
                <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium flex items-center gap-2 disabled:opacity-30 transition-opacity">
                  {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
                </button>
              </div>
            </div>
          </div>

          {/* Office Type Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {officeTypes.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-accent/30 transition-colors group">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.bg)}>
                      <t.icon className={cn("w-5 h-5", t.color)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(t.homePath)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface-hover transition-colors">
                        My Files <ChevronRight className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleCreate(t.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
                        <Plus className="w-3 h-3" /> New
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{t.desc}</p>
                  <div className="space-y-1">
                    {t.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-accent/50" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start */}
          <div className="text-center mb-12">
            <p className="text-xs text-muted-foreground mb-3">Quick start a blank file</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {officeTypes.map((t) => (
                <button key={t.id} onClick={() => handleCreate(t.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all text-sm text-muted-foreground hover:text-foreground">
                  <t.icon className={cn("w-4 h-4", t.color)} />
                  Blank {t.title}
                </button>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-foreground text-center mb-6">Why COXMOX Office?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Sparkles, title: 'AI-Powered', desc: 'Generate content with natural language prompts' },
                { icon: Zap, title: 'Real-time', desc: 'Auto-save with cloud sync and collaboration' },
                { icon: Shield, title: 'Secure', desc: 'End-to-end encrypted file storage' },
                { icon: Globe, title: 'Anywhere', desc: 'Works on desktop, tablet, and mobile' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{f.title}</h4>
                  <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-foreground text-center mb-6">Tips & Tricks</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-0.5">{tip.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility */}
          <div className="rounded-xl border border-border bg-card p-6 text-center mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-2">Full Compatibility</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Import and export files in standard formats</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {['.docx', '.xlsx', '.pptx', '.pdf', '.csv', '.txt', '.html'].map(ext => (
                <span key={ext} className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-mono text-muted-foreground">{ext}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
