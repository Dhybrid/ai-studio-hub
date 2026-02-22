import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Download, Wand2, Sparkles, Loader2, Clock, Film, Music, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

const stylePresets = ['Cinematic', 'Anime', 'Documentary', 'Motion Graphics', 'Realistic', 'Abstract'];
const durations = ['15s', '30s', '60s', '2min', '5min'];

const VideoStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [duration, setDuration] = useState('30s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'timeline' | 'audio'>('generate');
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <div className="flex h-full">
      {/* Left Controls */}
      <div className="w-[320px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <button onClick={() => navigate('/video-studio')} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 block">← Back</button>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Video Studio
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'generate' as const, icon: Film, label: 'Generate' },
            { id: 'timeline' as const, icon: Clock, label: 'Timeline' },
            { id: 'audio' as const, icon: Music, label: 'Audio' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2",
                activeTab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 space-y-5 overflow-y-auto">
          {activeTab === 'generate' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
                  placeholder="Describe the video you want to create..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {stylePresets.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        style === s ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
                <div className="flex gap-1.5">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-medium transition-all border text-center",
                        duration === d ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-surface-hover"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                <div className="flex gap-1.5">
                  {['16:9', '9:16', '1:1', '4:3'].map((r) => (
                    <button key={r} className="flex-1 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-surface-hover transition-all text-center">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Generate a video first</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Timeline editor will appear here</p>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Background Music</label>
                <select className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none">
                  <option>None</option>
                  <option>Upbeat Corporate</option>
                  <option>Cinematic Epic</option>
                  <option>Chill Lo-fi</option>
                  <option>Custom Upload</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Voiceover</label>
                <select className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none">
                  <option>None</option>
                  <option>Male - Professional</option>
                  <option>Female - Warm</option>
                  <option>Male - Narration</option>
                  <option>Female - Energetic</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Voiceover Script</label>
                <textarea
                  className="w-full h-20 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground"
                  placeholder="Enter voiceover text..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 3000); }}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate Video</>}
          </button>
        </div>
      </div>

      {/* Center - Video Preview */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
          <div className="w-full max-w-3xl aspect-video rounded-xl bg-gradient-to-br from-accent/10 via-muted to-surface border border-border flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <Film className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Video preview will appear here</p>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="h-16 border-t border-border flex items-center justify-center gap-4 px-6 bg-surface/50">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/3 bg-accent rounded-full" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground font-mono">0:10</span>
              <span className="text-[10px] text-muted-foreground font-mono">0:30</span>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
