import { useState } from 'react';
import { FileSpreadsheet, Presentation, FileText, BarChart3, PieChart, TrendingUp, Sparkles, Loader2, Wand2, Download, Plus, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [controlsOpen, setControlsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const ControlsContent = () => (
    <>
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Document Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {docTypes.map((t) => (
            <button key={t.id} onClick={() => setDocType(t.id)} className={cn("flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium border transition-all", docType === t.id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover")}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Prompt</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground" placeholder="Describe the document..." />
      </div>
      <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
        {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate</>}
      </button>
    </>
  );

  return (
    <div className={cn("flex h-full", isMobile && "flex-col")}>
      {/* Left Panel - desktop */}
      {!isMobile && (
        <div className="w-[300px] border-r border-border flex flex-col bg-background flex-shrink-0">
          <div className="p-4 border-b border-border">
            <button onClick={() => navigate('/office')} className="text-xs text-muted-foreground hover:text-foreground mb-2 block">← Back</button>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Office</h2>
          </div>
          <div className="flex-1 p-3 space-y-4 overflow-y-auto"><ControlsContent /></div>
          {docType === 'presentation' && (
            <div className="border-t border-border p-3 max-h-[250px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Slides</span>
                <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="space-y-1">
                {mockSlides.map((slide) => (
                  <button key={slide.id} onClick={() => setSelectedSlide(slide.id)} className={cn("w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs", selectedSlide === slide.id ? "bg-accent/10 text-accent border border-accent/30" : "hover:bg-surface-hover text-muted-foreground border border-transparent")}>
                    <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[9px] font-bold flex-shrink-0">{slide.id}</span>
                    <p className="font-medium truncate text-[11px]">{slide.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="p-3 border-t border-border">
            <button className="w-full py-2 rounded-lg border border-border text-[11px] font-medium text-foreground hover:bg-surface-hover flex items-center justify-center gap-1"><Download className="w-3 h-3" /> Export</button>
          </div>
        </div>
      )}

      {/* Mobile header + controls */}
      {isMobile && (
        <>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-background flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/office')} className="text-xs text-muted-foreground">←</button>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Office</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setControlsOpen(true)} className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"><SlidersHorizontal className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Slide strip on mobile */}
          {docType === 'presentation' && (
            <div className="h-10 flex items-center gap-2 px-4 border-b border-border overflow-x-auto flex-shrink-0">
              {mockSlides.map((slide) => (
                <button key={slide.id} onClick={() => setSelectedSlide(slide.id)} className={cn("px-3 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors flex-shrink-0", selectedSlide === slide.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>
                  {slide.id}. {slide.title}
                </button>
              ))}
            </div>
          )}

          <div className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-200", controlsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={() => setControlsOpen(false)} />
          <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50 flex flex-col max-h-[85vh] transition-transform duration-200", controlsOpen ? "translate-y-0" : "translate-y-full")}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Settings</span>
              <button onClick={() => setControlsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto"><ControlsContent /></div>
          </div>
        </>
      )}

      {/* Center - Editor */}
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 md:p-8 overflow-auto">
        <div className={cn("w-full rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center p-6 md:p-12 relative", isMobile ? "aspect-[4/3]" : "max-w-4xl aspect-[16/9]")}>
          <div className="text-center">
            <h1 className={cn("font-bold text-foreground mb-4", isMobile ? "text-xl" : "text-3xl")}>
              {mockSlides.find(s => s.id === selectedSlide)?.content || 'Title'}
            </h1>
            <p className="text-muted-foreground text-sm">{mockSlides.find(s => s.id === selectedSlide)?.title}</p>
            {selectedSlide === 3 && (
              <div className="mt-6 md:mt-8 flex items-end justify-center gap-2 md:gap-3 h-20 md:h-32">
                {[65, 78, 45, 92, 85, 70, 88].map((h, i) => (
                  <div key={i} className="w-6 md:w-10 bg-accent/30 hover:bg-accent/50 rounded-t transition-colors" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
            {selectedSlide === 4 && (
              <div className="mt-6 md:mt-8 flex justify-center gap-6 md:gap-8">
                <div className="text-center"><PieChart className="w-10 md:w-16 h-10 md:h-16 text-accent/40 mx-auto" /><p className="text-xs text-muted-foreground mt-2">Market Share</p></div>
                <div className="text-center"><TrendingUp className="w-10 md:w-16 h-10 md:h-16 text-success/40 mx-auto" /><p className="text-xs text-muted-foreground mt-2">Growth Trend</p></div>
              </div>
            )}
          </div>
          <div className="absolute bottom-3 md:bottom-4 right-4 md:right-6 text-[10px] text-muted-foreground/40">
            Slide {selectedSlide} of {mockSlides.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeEditor;
