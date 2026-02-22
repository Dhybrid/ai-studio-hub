import { useState } from 'react';
import { Play, Pause, Download, Wand2, Sparkles, Loader2, Mic, Music, Volume2, AudioWaveform } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

const voices = [
  { id: 'v1', name: 'Alex', type: 'Male', accent: 'American', style: 'Professional' },
  { id: 'v2', name: 'Sarah', type: 'Female', accent: 'British', style: 'Warm' },
  { id: 'v3', name: 'James', type: 'Male', accent: 'American', style: 'Narration' },
  { id: 'v4', name: 'Mia', type: 'Female', accent: 'Australian', style: 'Energetic' },
  { id: 'v5', name: 'Carlos', type: 'Male', accent: 'Spanish', style: 'Conversational' },
  { id: 'v6', name: 'Yuki', type: 'Female', accent: 'Japanese', style: 'Calm' },
];

const categories = ['Voice', 'Music', 'SFX'];

const AudioStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'voice' | 'music' | 'sfx'>('voice');
  const [selectedVoice, setSelectedVoice] = useState('v1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-full">
      {/* Left Controls */}
      <div className="w-[320px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <button onClick={() => navigate('/audio-studio')} className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 block">← Back</button>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Audio Studio
          </h2>
        </div>

        {/* Type Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'voice' as const, icon: Mic, label: 'Voice' },
            { id: 'music' as const, icon: Music, label: 'Music' },
            { id: 'sfx' as const, icon: AudioWaveform, label: 'SFX' },
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
          {activeTab === 'voice' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Script</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
                  placeholder="Enter the text to convert to speech..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Select Voice</label>
                <div className="space-y-1.5">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        selectedVoice === voice.id ? "border-accent bg-accent/5" : "border-border hover:bg-surface-hover"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        selectedVoice === voice.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {voice.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{voice.name}</p>
                        <p className="text-[10px] text-muted-foreground">{voice.type} · {voice.accent} · {voice.style}</p>
                      </div>
                      <button className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-surface-hover transition-colors">
                        <Play className="w-3 h-3 text-muted-foreground ml-0.5" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Speed</label>
                <input type="range" min={50} max={200} defaultValue={100} className="w-full accent-accent" />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">0.5x</span>
                  <span className="text-[9px] text-muted-foreground font-medium">1.0x</span>
                  <span className="text-[9px] text-muted-foreground">2.0x</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'music' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Describe the Music</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
                  placeholder="Upbeat corporate background music, 120 BPM..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Pop', 'Classical', 'Electronic', 'Jazz', 'Lo-fi', 'Rock', 'Ambient', 'Hip-hop'].map((g) => (
                    <button key={g} className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-surface-hover transition-all">
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Duration</label>
                <div className="flex gap-1.5">
                  {['10s', '30s', '60s', '3min', '5min'].map((d) => (
                    <button key={d} className="flex-1 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-surface-hover transition-all text-center">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'sfx' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Describe the Sound</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-28 rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
                  placeholder="Cinematic whoosh transition, dramatic impact hit..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {['UI Sounds', 'Nature', 'Sci-fi', 'Impact', 'Transition', 'Ambient', 'Foley', 'Game'].map((c) => (
                    <button key={c} className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:bg-surface-hover transition-all">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> Generate</>}
          </button>
        </div>
      </div>

      {/* Center - Audio Visualization */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl space-y-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Volume2 className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Audio Preview</h3>
              <p className="text-sm text-muted-foreground">Generate audio to see the waveform here</p>
            </div>
            
            {/* Mock Waveform */}
            <div className="flex items-end justify-center gap-[2px] h-24 px-8">
              {Array.from({ length: 60 }, (_, i) => {
                const h = 15 + Math.sin(i * 0.3) * 30 + Math.random() * 25;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-accent/20 rounded-t-sm min-w-[2px]"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="h-16 border-t border-border flex items-center justify-center gap-4 px-6 bg-surface/50">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="flex-1 mx-4 max-w-lg">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-0 bg-accent rounded-full" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground font-mono">0:00</span>
              <span className="text-[10px] text-muted-foreground font-mono">0:30</span>
            </div>
          </div>
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Download className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default AudioStudio;
