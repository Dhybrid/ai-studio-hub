import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Download, Wand2, Sparkles, Loader2, Clock, Film, Music, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const stylePresets = ['Cinematic', 'Anime', 'Documentary', 'Motion Graphics', 'Realistic', 'Abstract'];
const durations = ['15s', '30s', '60s', '2min', '5min'];

const VideoStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [duration, setDuration] = useState('30s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'timeline' | 'audio'>('generate');
  const [controlsOpen, setControlsOpen] = useState(false);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useIsMobile();

  const ControlsContent = () => (
    <>
      {activeTab === 'generate' && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground" placeholder="Describe the video..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Style</label>
            <div className="flex flex-wrap gap-1.5">
              {stylePresets.map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={cn("px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border", style === s ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover")}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
            <div className="flex gap-1.5">
              {durations.map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all border text-center", duration === d ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover")}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Aspect Ratio</label>
            <div className="flex gap-1.5">
              {['16:9', '9:16', '1:1', '4:3'].map((r) => (
                <button key={r} className="flex-1 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-surface-hover text-center">{r}</button>
              ))}
            </div>
          </div>
        </>
      )}
      {activeTab === 'timeline' && (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Generate a video first</p>
        </div>
      )}
      {activeTab === 'audio' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Background Music</label>
            <select className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none">
              <option>None</option><option>Upbeat Corporate</option><option>Cinematic Epic</option><option>Chill Lo-fi</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Voiceover</label>
            <select className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none">
              <option>None</option><option>Male - Professional</option><option>Female - Warm</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Voiceover Script</label>
            <textarea className="w-full h-20 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground" placeholder="Enter voiceover text..." />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={cn("flex h-full", isMobile && "flex-col")}>
      {/* Left Controls - desktop */}
      {!isMobile && (
        <div className="w-[320px] border-r border-border flex flex-col bg-background flex-shrink-0">
          <div className="p-4 border-b border-border">
            <button onClick={() => navigate('/video-studio')} className="text-xs text-muted-foreground hover:text-foreground mb-2 block">← Back</button>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Video Studio</h2>
          </div>
          <div className="flex border-b border-border">
            {[
              { id: 'generate' as const, icon: Film, label: 'Generate' },
              { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
              { id: 'audio' as const, icon: Music, label: 'Audio' },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2", activeTab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground")}><t.icon className="w-3.5 h-3.5" />{t.label}</button>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-5 overflow-y-auto"><ControlsContent /></div>
          <div className="p-4 border-t border-border">
            <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 3000); }} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Video</>}
            </button>
          </div>
        </div>
      )}

      {/* Mobile header + controls */}
      {isMobile && (
        <>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-background flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/video-studio')} className="text-xs text-muted-foreground">←</button>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Video Studio</h2>
            </div>
            <button onClick={() => setControlsOpen(true)} className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"><SlidersHorizontal className="w-4 h-4" /></button>
          </div>
          <div className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-200", controlsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={() => setControlsOpen(false)} />
          <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50 flex flex-col max-h-[85vh] transition-transform duration-200", controlsOpen ? "translate-y-0" : "translate-y-full")}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Settings</span>
              <button onClick={() => setControlsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex border-b border-border">
              {[
                { id: 'generate' as const, icon: Film, label: 'Generate' },
                { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
                { id: 'audio' as const, icon: Music, label: 'Audio' },
              ].map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2", activeTab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground")}><t.icon className="w-3.5 h-3.5" />{t.label}</button>
              ))}
            </div>
            <div className="flex-1 p-4 space-y-5 overflow-y-auto"><ControlsContent /></div>
            <div className="p-4 border-t border-border">
              <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 3000); setControlsOpen(false); }} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Video</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Center - Video Preview */}
      <div className="flex-1 flex flex-col bg-background min-h-0">
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 md:p-8">
          <div className="w-full max-w-3xl aspect-video rounded-xl bg-gradient-to-br from-accent/10 via-muted to-surface border border-border flex items-center justify-center">
            <div className="text-center">
              <Film className="w-12 md:w-16 h-12 md:h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Video preview will appear here</p>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="h-14 md:h-16 border-t border-border flex items-center justify-center gap-2 md:gap-4 px-4 md:px-6 bg-surface/50 flex-shrink-0">
          <button className="text-muted-foreground hover:text-foreground hidden sm:block"><SkipBack className="w-4 h-4" /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground hidden sm:block"><SkipForward className="w-4 h-4" /></button>
          <div className="flex-1 mx-2 md:mx-4">
            <div className="h-1 rounded-full bg-muted overflow-hidden"><div className="h-full w-1/3 bg-accent rounded-full" /></div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground font-mono">0:10</span>
              <span className="text-[10px] text-muted-foreground font-mono">0:30</span>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground"><Volume2 className="w-4 h-4" /></button>
          <button className="text-muted-foreground hover:text-foreground hidden sm:block"><Maximize2 className="w-4 h-4" /></button>
          <button className="text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
