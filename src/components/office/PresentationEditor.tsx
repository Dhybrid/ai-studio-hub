import { useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Copy, Play, ChevronDown, Image, Type, Square, Circle,
  PieChart, TrendingUp, Layout, Palette, Wand2, Loader2, Mic,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Undo2, Redo2, Table, LayoutGrid, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  layout: 'title' | 'content' | 'two-column' | 'image' | 'chart' | 'blank';
  bgColor: string;
  elements: SlideElement[];
};

type SlideElement = {
  id: string;
  type: 'text' | 'shape' | 'image' | 'chart';
  x: number; y: number; w: number; h: number;
  content?: string;
  style?: Record<string, string>;
};

const defaultSlides: Slide[] = [
  { id: 1, title: 'Q4 Business Report', subtitle: 'Annual Review & Strategy', layout: 'title', bgColor: 'bg-gradient-to-br from-accent/10 to-accent/5', elements: [] },
  { id: 2, title: 'Executive Summary', subtitle: 'Key metrics and highlights from Q4', layout: 'content', bgColor: 'bg-card', elements: [] },
  { id: 3, title: 'Revenue Analysis', subtitle: 'Revenue trends and breakdown by segment', layout: 'chart', bgColor: 'bg-card', elements: [] },
  { id: 4, title: 'Market Position', subtitle: 'Competitive landscape overview', layout: 'two-column', bgColor: 'bg-card', elements: [] },
  { id: 5, title: 'Next Steps', subtitle: 'Action items and roadmap for Q1', layout: 'content', bgColor: 'bg-card', elements: [] },
];

const layouts = [
  { id: 'title', label: 'Title Slide', icon: Layout },
  { id: 'content', label: 'Content', icon: Type },
  { id: 'two-column', label: 'Two Column', icon: LayoutGrid },
  { id: 'chart', label: 'Chart', icon: PieChart },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'blank', label: 'Blank', icon: Square },
];

const themes = [
  { name: 'Default', bg: 'bg-card', accent: 'bg-accent' },
  { name: 'Dark', bg: 'bg-zinc-900', accent: 'bg-blue-500' },
  { name: 'Warm', bg: 'bg-amber-50', accent: 'bg-orange-500' },
  { name: 'Nature', bg: 'bg-emerald-50', accent: 'bg-emerald-600' },
  { name: 'Corporate', bg: 'bg-slate-50', accent: 'bg-indigo-600' },
];

const PresentationEditor = ({ isMobile }: { isMobile: boolean }) => {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const current = slides[selectedSlide];

  const addSlide = () => {
    const newSlide: Slide = {
      id: slides.length + 1,
      title: 'New Slide',
      subtitle: 'Click to edit',
      layout: 'content',
      bgColor: 'bg-card',
      elements: [],
    };
    setSlides([...slides, newSlide]);
    setSelectedSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== selectedSlide);
    setSlides(next);
    setSelectedSlide(Math.min(selectedSlide, next.length - 1));
  };

  const duplicateSlide = () => {
    const dup = { ...current, id: slides.length + 1 };
    const next = [...slides];
    next.splice(selectedSlide + 1, 0, dup);
    setSlides(next);
    setSelectedSlide(selectedSlide + 1);
  };

  const updateSlide = (key: keyof Slide, value: any) => {
    setSlides(slides.map((s, i) => i === selectedSlide ? { ...s, [key]: value } : s));
  };

  const renderSlideContent = (slide: Slide, isThumb: boolean) => {
    const scale = isThumb ? 'scale-[0.18]' : '';
    switch (slide.layout) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-12">
            {isEditing && !isThumb ? (
              <>
                <input
                  className="text-2xl sm:text-4xl font-bold bg-transparent outline-none text-center w-full text-foreground mb-2 border-b border-dashed border-accent/30 focus:border-accent pb-2"
                  value={slide.title}
                  onChange={(e) => updateSlide('title', e.target.value)}
                />
                <input
                  className="text-sm sm:text-lg bg-transparent outline-none text-center w-full text-muted-foreground border-b border-dashed border-accent/20 focus:border-accent/40 pb-1"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide('subtitle', e.target.value)}
                />
              </>
            ) : (
              <>
                <h1 className={cn("font-bold text-foreground mb-2", isThumb ? "text-[6px]" : isMobile ? "text-xl" : "text-4xl")}>{slide.title}</h1>
                <p className={cn("text-muted-foreground", isThumb ? "text-[4px]" : isMobile ? "text-xs" : "text-lg")}>{slide.subtitle}</p>
              </>
            )}
          </div>
        );
      case 'chart':
        return (
          <div className="h-full flex flex-col p-4 sm:p-8">
            <h2 className={cn("font-semibold text-foreground mb-4", isThumb ? "text-[5px] mb-1" : isMobile ? "text-sm" : "text-xl")}>{slide.title}</h2>
            <div className="flex-1 flex items-end justify-center gap-1 sm:gap-3 pb-4">
              {[65, 78, 45, 92, 85, 70, 88, 60, 75].map((h, i) => (
                <div key={i} className={cn("bg-accent/30 hover:bg-accent/50 rounded-t transition-colors", isThumb ? "w-1" : isMobile ? "w-4" : "w-10")} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        );
      case 'two-column':
        return (
          <div className="h-full flex flex-col p-4 sm:p-8">
            <h2 className={cn("font-semibold text-foreground mb-4", isThumb ? "text-[5px] mb-1" : isMobile ? "text-sm" : "text-xl")}>{slide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-center">
                <PieChart className={cn("text-accent/30", isThumb ? "w-2 h-2" : "w-16 h-16")} />
              </div>
              <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-center">
                <TrendingUp className={cn("text-green-400/30", isThumb ? "w-2 h-2" : "w-16 h-16")} />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col p-4 sm:p-8">
            {isEditing && !isThumb ? (
              <>
                <input
                  className="text-lg sm:text-xl font-semibold bg-transparent outline-none text-foreground mb-3 border-b border-dashed border-accent/30 focus:border-accent pb-1"
                  value={slide.title}
                  onChange={(e) => updateSlide('title', e.target.value)}
                />
                <textarea
                  className="flex-1 bg-transparent outline-none text-muted-foreground text-sm resize-none border border-dashed border-accent/20 rounded-lg p-3 focus:border-accent/40"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide('subtitle', e.target.value)}
                />
              </>
            ) : (
              <>
                <h2 className={cn("font-semibold text-foreground mb-3", isThumb ? "text-[5px] mb-1" : isMobile ? "text-sm" : "text-xl")}>{slide.title}</h2>
                <p className={cn("text-muted-foreground", isThumb ? "text-[3px]" : "text-sm")}>{slide.subtitle}</p>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex min-h-0 relative">
      {/* Slide panel */}
      {!isMobile && (
        <div className="w-[200px] border-r border-border flex flex-col bg-surface/30 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Slides ({slides.length})</span>
            <div className="flex items-center gap-0.5">
              <button onClick={duplicateSlide} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground" title="Duplicate"><Copy className="w-3 h-3" /></button>
              <button onClick={deleteSlide} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground hover:text-red-500" title="Delete"><Trash2 className="w-3 h-3" /></button>
              <button onClick={addSlide} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground" title="Add"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => { setSelectedSlide(i); setIsEditing(false); }}
                className={cn(
                  "w-full rounded-lg border overflow-hidden transition-all group",
                  selectedSlide === i ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-muted-foreground/30"
                )}
              >
                <div className={cn("aspect-[16/9] flex items-center justify-center overflow-hidden", slide.bgColor)}>
                  {renderSlideContent(slide, true)}
                </div>
                <div className="px-2 py-1 bg-surface/50 flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                  <p className="text-[9px] font-medium text-foreground truncate">{slide.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="h-10 border-b border-border flex items-center gap-1 px-2 sm:px-3 overflow-x-auto flex-shrink-0 bg-surface/50">
          {isMobile && (
            <>
              <div className="flex items-center gap-1 overflow-x-auto mr-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setSelectedSlide(i)} className={cn("w-6 h-6 rounded text-[10px] font-medium flex-shrink-0", selectedSlide === i ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>{i + 1}</button>
                ))}
                <button onClick={addSlide} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground flex-shrink-0"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="w-px h-5 bg-border" />
            </>
          )}
          <button onClick={() => setIsEditing(!isEditing)} className={cn("px-2 py-1 rounded text-xs flex-shrink-0", isEditing ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <div className="relative">
            <button onClick={() => { setShowLayouts(!showLayouts); setShowThemes(false); }} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover flex-shrink-0">
              <Layout className="w-3 h-3" /> Layout <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showLayouts && (
              <div className="absolute top-8 left-0 bg-card border border-border rounded-lg shadow-xl z-30 p-2 w-44">
                {layouts.map(l => (
                  <button key={l.id} onClick={() => { updateSlide('layout', l.id); setShowLayouts(false); }}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-surface-hover", current?.layout === l.id && "bg-accent/10 text-accent")}>
                    <l.icon className="w-3.5 h-3.5" /> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setShowThemes(!showThemes); setShowLayouts(false); }} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover flex-shrink-0">
              <Palette className="w-3 h-3" /> Theme <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showThemes && (
              <div className="absolute top-8 left-0 bg-card border border-border rounded-lg shadow-xl z-30 p-2 w-40">
                {themes.map(t => (
                  <button key={t.name} onClick={() => { updateSlide('bgColor', t.bg); setShowThemes(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-surface-hover">
                    <div className={cn("w-4 h-4 rounded border border-border", t.bg)} />
                    <div className={cn("w-2 h-2 rounded-full", t.accent)} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-px h-5 bg-border mx-0.5" />
          <button onClick={addSlide} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover flex-shrink-0">
            <Plus className="w-3 h-3" /> Slide
          </button>
          <button onClick={duplicateSlide} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover flex-shrink-0">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          {!isMobile && (
            <>
              <div className="flex-1" />
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 flex-shrink-0">
                <Play className="w-3 h-3" /> Present
              </button>
            </>
          )}
        </div>

        {/* Stage */}
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-3 sm:p-8 overflow-auto" onClick={() => { setShowThemes(false); setShowLayouts(false); }}>
          <div
            className={cn(
              "rounded-xl border border-border shadow-lg relative overflow-hidden",
              current?.bgColor,
              isMobile ? "w-full aspect-[16/9]" : "w-full max-w-4xl aspect-[16/9]"
            )}
            onDoubleClick={() => setIsEditing(true)}
          >
            {current && renderSlideContent(current, false)}
            <div className="absolute bottom-2 right-3 text-[9px] text-muted-foreground/40">
              {selectedSlide + 1} / {slides.length}
            </div>
          </div>
        </div>

        {/* AI bar */}
        <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
          <AIPromptBox placeholder="Ask AI to create slides, add charts, redesign layout..." onGenerate={() => {}} />
        </div>
      </div>

      {/* Floating voice */}
      <button
        onClick={() => setShowVoice(!showVoice)}
        className={cn(
          "fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 transition-all",
          showVoice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105"
        )}
      >
        <Mic className="w-5 h-5" />
      </button>
      {showVoice && (
        <div className="fixed bottom-40 right-6 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">Listening...</span>
          </div>
          <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 bg-accent/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Speak to add content to slides</p>
        </div>
      )}
    </div>
  );
};

const AIPromptBox = ({ placeholder, onGenerate }: { placeholder: string; onGenerate: (p: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
  }, [prompt]);

  return (
    <div className="bg-surface border border-border rounded-xl p-2">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[120px] overflow-y-auto"
        placeholder={placeholder}
        rows={1}
      />
      <div className="flex justify-end px-1">
        <button
          onClick={() => { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); onGenerate(prompt); }, 2000); }}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium flex items-center gap-2 disabled:opacity-30"
        >
          {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
        </button>
      </div>
    </div>
  );
};

export default PresentationEditor;
