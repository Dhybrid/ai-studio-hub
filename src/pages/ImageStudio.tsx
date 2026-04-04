import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Maximize2, Copy, Wand2, Sparkles, Image as ImageIcon, Loader2, Menu, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const stylePresets = ['Photorealistic', 'Digital Art', 'Oil Painting', 'Anime', 'Watercolor', '3D Render', 'Pixel Art', 'Minimalist'];
const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:2'];

const mockImages = [
  { id: '1', prompt: 'A futuristic city at sunset, cyberpunk style', style: 'Digital Art' },
  { id: '2', prompt: 'Mountain landscape with aurora borealis', style: 'Photorealistic' },
  { id: '3', prompt: 'Abstract geometric patterns in gold', style: 'Minimalist' },
  { id: '4', prompt: 'Japanese garden in spring, cherry blossoms', style: 'Watercolor' },
];

const ImageStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [ratio, setRatio] = useState('1:1');
  const [quality, setQuality] = useState(80);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isMobile = useIsMobile();

  const ControlsContent = () => (
    <>
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Prompt</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground" placeholder="Describe the image you want to create..." />
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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Aspect Ratio</label>
        <div className="flex gap-1.5">
          {aspectRatios.map((r) => (
            <button key={r} onClick={() => setRatio(r)} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all border text-center", ratio === r ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover")}>{r}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-xs text-muted-foreground">{quality}%</span>
        </div>
        <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-accent" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Seed</label>
        <input className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-accent font-mono" placeholder="Random" type="number" />
      </div>
    </>
  );

  return (
    <div className={cn("flex h-full", isMobile && "flex-col")}>
      {/* Left Controls - desktop */}
      {!isMobile && (
        <div className="w-[320px] border-r border-border flex flex-col bg-background flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Image Studio
            </h2>
          </div>
          <div className="flex-1 p-4 space-y-5 overflow-y-auto"><ControlsContent /></div>
          <div className="p-4 border-t border-border">
            <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </div>
      )}

      {/* Mobile controls sheet */}
      {isMobile && (
        <>
          <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-background flex-shrink-0">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Image Studio</h2>
            <div className="flex gap-2">
              <button onClick={() => setControlsOpen(true)} className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"><SlidersHorizontal className="w-4 h-4" /></button>
              {selectedImage && <button onClick={() => setDetailsOpen(true)} className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"><ImageIcon className="w-4 h-4" /></button>}
            </div>
          </div>

          {/* Controls bottom sheet */}
          <div className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-200", controlsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={() => setControlsOpen(false)} />
          <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50 flex flex-col max-h-[85vh] transition-transform duration-200", controlsOpen ? "translate-y-0" : "translate-y-full")}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Settings</span>
              <button onClick={() => setControlsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-4 space-y-5 overflow-y-auto"><ControlsContent /></div>
            <div className="p-4 border-t border-border">
              <button onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); setControlsOpen(false); }} disabled={isGenerating} className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate</>}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Center - Image Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className={cn("grid gap-3 md:gap-4 max-w-4xl mx-auto", isMobile ? "grid-cols-2" : "grid-cols-2")}>
          {mockImages.map((img, idx) => (
            <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
              className={cn("group relative aspect-square rounded-xl overflow-hidden bg-surface border border-border cursor-pointer transition-all", selectedImage === img.id && "ring-2 ring-accent")}
              onClick={() => { setSelectedImage(img.id); if (isMobile) setDetailsOpen(true); }}
            >
              <div className="w-full h-full bg-gradient-to-br from-accent/20 via-muted to-surface" style={{ opacity: 0.4 + idx * 0.15 }} />
              <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 md:w-12 h-8 md:h-12 text-muted-foreground/20" /></div>
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {[Download, Maximize2, Copy, Wand2].map((Ic, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-surface-hover"><Ic className="w-3.5 h-3.5 text-foreground" /></button>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-background/80 to-transparent">
                <p className="text-[10px] md:text-xs text-foreground font-medium truncate">{img.prompt}</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground">{img.style}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right - Details (desktop) */}
      {!isMobile && (
        <div className="w-[280px] border-l border-border flex flex-col bg-background flex-shrink-0">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Details</h3></div>
          {selectedImage ? (
            <div className="p-4 space-y-4">
              <div><label className="text-xs text-muted-foreground">Prompt</label><p className="text-sm text-foreground mt-1">{mockImages.find(i => i.id === selectedImage)?.prompt}</p></div>
              <div><label className="text-xs text-muted-foreground">Style</label><p className="text-sm text-foreground mt-1">{mockImages.find(i => i.id === selectedImage)?.style}</p></div>
              <div><label className="text-xs text-muted-foreground">Resolution</label><p className="text-sm text-foreground mt-1">1024 × 1024</p></div>
              <div><label className="text-xs text-muted-foreground">Created</label><p className="text-sm text-foreground mt-1">Just now</p></div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4"><p className="text-xs text-muted-foreground text-center">Select an image to view details</p></div>
          )}
        </div>
      )}

      {/* Mobile details sheet */}
      {isMobile && (
        <>
          <div className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-200", detailsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={() => setDetailsOpen(false)} />
          <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50 p-4 transition-transform duration-200", detailsOpen ? "translate-y-0" : "translate-y-full")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>
              <button onClick={() => setDetailsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            {selectedImage && (
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground">Prompt</label><p className="text-sm text-foreground mt-1">{mockImages.find(i => i.id === selectedImage)?.prompt}</p></div>
                <div><label className="text-xs text-muted-foreground">Style</label><p className="text-sm text-foreground mt-1">{mockImages.find(i => i.id === selectedImage)?.style}</p></div>
                <div className="flex gap-4">
                  <div><label className="text-xs text-muted-foreground">Resolution</label><p className="text-sm text-foreground mt-1">1024 × 1024</p></div>
                  <div><label className="text-xs text-muted-foreground">Created</label><p className="text-sm text-foreground mt-1">Just now</p></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageStudio;
