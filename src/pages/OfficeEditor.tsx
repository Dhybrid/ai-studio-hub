import { useState } from 'react';
import { FileSpreadsheet, Presentation, FileText, BarChart3, PieChart, TrendingUp, Sparkles, Loader2, Wand2, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

const docTypes = [
  { id: 'presentation', icon: Presentation, label: 'Presentation' },
  { id: 'spreadsheet', icon: FileSpreadsheet, label: 'Spreadsheet' },
  { id: 'document', icon: FileText, label: 'Document' },
  { id: 'analysis', icon: BarChart3, label: 'Analysis' },
];

const mockSlides = [
  { id: 1, title: 'Title Slide', content: 'Q4 Business Report' },
  { id: 2, title: 'Executive Summary', content: 'Key metrics and highlights' },
  { id: 3, title: 'Revenue Analysis', content: 'Revenue trends and breakdown' },
  { id: 4, title: 'Market Position', content: 'Competitive landscape' },
  { id: 5, title: 'Next Steps', content: 'Action items and roadmap' },
];

const OfficeEditor = () => {
  const [prompt, setPrompt] = useState('');
  const [docType, setDocType] = useState('presentation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-[300px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <button onClick={() => navigate('/office')} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 block">← Back</button>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Office
          </h2>
        </div>

        {/* Doc Type */}
        <div className="p-3 border-b border-border">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Document Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {docTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setDocType(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium border transition-all",
                  docType === t.id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="flex-1 p-3 flex flex-col overflow-hidden">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            placeholder="Describe the document you want to create..."
          />
          <button
            onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }}
            disabled={isGenerating}
            className="mt-2 w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate</>}
          </button>
        </div>

        {/* Slide Navigator */}
        {docType === 'presentation' && (
          <div className="border-t border-border p-3 max-h-[250px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Slides</span>
              <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {mockSlides.map((slide) => (
                <button
                  key={slide.id}
                  onClick={() => setSelectedSlide(slide.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all text-xs",
                    selectedSlide === slide.id ? "bg-accent/10 text-accent border border-accent/30" : "hover:bg-surface-hover text-muted-foreground border border-transparent"
                  )}
                >
                  <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {slide.id}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-[11px]">{slide.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border flex gap-1.5">
          <button className="flex-1 py-2 rounded-lg border border-border text-[11px] font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center gap-1">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* Center - Editor */}
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-8 overflow-auto">
        <div className="w-full max-w-4xl aspect-[16/9] rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center p-12 relative">
          {/* Slide Content */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {mockSlides.find(s => s.id === selectedSlide)?.content || 'Title'}
            </h1>
            <p className="text-muted-foreground">
              {mockSlides.find(s => s.id === selectedSlide)?.title}
            </p>
            {selectedSlide === 3 && (
              <div className="mt-8 flex items-end justify-center gap-3 h-32">
                {[65, 78, 45, 92, 85, 70, 88].map((h, i) => (
                  <div key={i} className="w-10 bg-accent/30 hover:bg-accent/50 rounded-t transition-colors" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
            {selectedSlide === 4 && (
              <div className="mt-8 flex justify-center gap-8">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-accent/40 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">Market Share</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-success/40 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">Growth Trend</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-6 text-[10px] text-muted-foreground/40">
            Slide {selectedSlide} of {mockSlides.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeEditor;
