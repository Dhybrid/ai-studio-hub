import { useState } from 'react';
import {
  ClipboardPaste, Scissors, Copy, Brush, Bold, Italic, Underline, Strikethrough,
  Type, PaintBucket, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, ChevronDown, Image as ImageIcon, Table as TableIcon,
  Link2, Shapes, Smile, BarChart3, Box, MessageSquare, StickyNote, Calendar, Sigma, Hash,
  Pen, Pencil, Highlighter, Eraser, Palette, Layers, FileText, Eye, Ruler,
  ZoomIn, ZoomOut, Maximize2, Search, Replace, SpellCheck, Languages, Sparkles, Wand2,
  MonitorPlay, Play, Timer, Mic, Volume2, Frame, RotateCw, FileImage, Lightbulb,
  HelpCircle, MessageCircle, Lock, GitMerge, Plus, Trash2, LayoutGrid, Columns,
  Square, Circle, Triangle, ArrowRight, Star, Maximize, Wand, Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TableGridPicker from './TableGridPicker';

export type PptRibbonTab = 'home' | 'insert' | 'draw' | 'design' | 'transitions' | 'animations' | 'slideshow' | 'review' | 'view' | 'help';

interface Props {
  activeTab: PptRibbonTab;
  onTabChange: (t: PptRibbonTab) => void;
  exec: (cmd: string, value?: string) => void;
  activeFormats: Set<string>;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onInsertImage: () => void;
  onInsertText: () => void;
  onInsertShape: (shape: string) => void;
  onInsertTable: (rows: number, cols: number, opts: { header: boolean; bordered: boolean }) => void;
  onInsertChart: () => void;
  onApplyTheme: (id: string) => void;
  onApplyTransition: (id: string) => void;
  onApplyAnimation: (id: string) => void;
  onStartShow: (fromBeginning: boolean) => void;
  onAIGenerate: () => void;
  zoom: number;
  setZoom: (z: number) => void;
}

const tabs: { id: PptRibbonTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' },
  { id: 'draw', label: 'Draw' },
  { id: 'design', label: 'Design' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'animations', label: 'Animations' },
  { id: 'slideshow', label: 'Slide Show' },
  { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' },
  { id: 'help', label: 'Help' },
];

const fontFamilies = ['Calibri', 'Arial', 'Aptos', 'Times New Roman', 'Georgia', 'Verdana', 'Trebuchet MS', 'Tahoma'];
const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '44', '54', '66', '88'];

const themes = [
  { id: 'office', name: 'Office', bg: 'bg-white', accent: 'bg-blue-500' },
  { id: 'ion', name: 'Ion', bg: 'bg-gradient-to-br from-blue-700 to-blue-900', accent: 'bg-cyan-400' },
  { id: 'gallery', name: 'Gallery', bg: 'bg-gradient-to-br from-zinc-100 to-zinc-300', accent: 'bg-amber-500' },
  { id: 'facet', name: 'Facet', bg: 'bg-gradient-to-br from-emerald-600 to-teal-700', accent: 'bg-lime-300' },
  { id: 'organic', name: 'Organic', bg: 'bg-gradient-to-br from-amber-100 to-orange-200', accent: 'bg-orange-600' },
  { id: 'wisp', name: 'Wisp', bg: 'bg-gradient-to-br from-violet-100 to-violet-300', accent: 'bg-violet-600' },
  { id: 'dividend', name: 'Dividend', bg: 'bg-gradient-to-br from-zinc-800 to-zinc-950', accent: 'bg-rose-500' },
  { id: 'berlin', name: 'Berlin', bg: 'bg-gradient-to-br from-rose-500 to-pink-700', accent: 'bg-yellow-300' },
];

const transitions = ['None', 'Fade', 'Push', 'Wipe', 'Split', 'Reveal', 'Cut', 'Random Bars', 'Cover', 'Uncover', 'Morph', 'Zoom'];
const animations = ['None', 'Appear', 'Fade', 'Fly In', 'Float In', 'Zoom', 'Bounce', 'Spin', 'Pulse', 'Shake', 'Swivel'];

const Btn = ({ icon: Icon, label, onClick, active, large, disabled }: any) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "flex flex-col items-center justify-center rounded gap-0.5 transition-colors flex-shrink-0 disabled:opacity-40",
      large ? "px-2 py-1.5 min-w-[56px] h-[60px]" : "w-7 h-7",
      active ? "bg-accent/15 text-accent" : "text-foreground hover:bg-surface-hover"
    )}
  >
    {large ? (<><Icon className="w-5 h-5" /><span className="text-[9px] leading-tight text-center">{label}</span></>) : (<Icon className="w-3.5 h-3.5" />)}
  </button>
);

const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col items-stretch border-r border-border/60 px-2 py-1 flex-shrink-0">
    <div className="flex items-center gap-0.5 flex-1 min-h-[60px]">{children}</div>
    <div className="text-[9px] text-muted-foreground text-center pt-0.5 select-none">{label}</div>
  </div>
);

const SmallStack = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5 flex-shrink-0">{children}</div>
);

export default function PowerPointRibbon(props: Props) {
  const { activeTab, onTabChange, exec, activeFormats, onAddSlide, onDuplicateSlide, onDeleteSlide,
    onInsertImage, onInsertText, onInsertShape, onInsertTable, onInsertChart,
    onApplyTheme, onApplyTransition, onApplyAnimation, onStartShow, onAIGenerate, zoom, setZoom } = props;
  const [font, setFont] = useState('Calibri');
  const [size, setSize] = useState('18');

  return (
    <div className="border-b border-border bg-surface/40 flex-shrink-0">
      <div className="flex items-center px-2 gap-0 border-b border-border/60 h-8 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={cn(
              "px-3 h-8 text-xs font-medium transition-colors border-b-2 flex-shrink-0",
              activeTab === t.id ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-hover"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-stretch overflow-x-auto h-[78px] bg-background">
        {activeTab === 'home' && (
          <>
            <Group label="Clipboard">
              <Btn icon={ClipboardPaste} label="Paste" large onClick={() => exec('paste')} />
              <SmallStack>
                <Btn icon={Scissors} label="Cut" onClick={() => exec('cut')} />
                <Btn icon={Copy} label="Copy" onClick={() => exec('copy')} />
                <Btn icon={Brush} label="Format Painter" onClick={() => {}} />
              </SmallStack>
            </Group>
            <Group label="Slides">
              <Btn icon={Plus} label="New Slide" large onClick={onAddSlide} />
              <Btn icon={LayoutGrid} label="Layout" large onClick={() => {}} />
              <SmallStack>
                <Btn icon={Copy} label="Duplicate" onClick={onDuplicateSlide} />
                <Btn icon={Trash2} label="Delete" onClick={onDeleteSlide} />
              </SmallStack>
            </Group>
            <Group label="Font">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <select value={font} onChange={(e) => { setFont(e.target.value); exec('fontName', e.target.value); }}
                    className="text-xs bg-card border border-border rounded px-1.5 py-0.5 w-24 outline-none">
                    {fontFamilies.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select value={size} onChange={(e) => { setSize(e.target.value); }}
                    className="text-xs bg-card border border-border rounded px-1.5 py-0.5 w-12 outline-none">
                    {fontSizes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-0.5">
                  <Btn icon={Bold} label="Bold" active={activeFormats.has('bold')} onClick={() => exec('bold')} />
                  <Btn icon={Italic} label="Italic" active={activeFormats.has('italic')} onClick={() => exec('italic')} />
                  <Btn icon={Underline} label="Underline" active={activeFormats.has('underline')} onClick={() => exec('underline')} />
                  <Btn icon={Strikethrough} label="Strike" active={activeFormats.has('strikeThrough')} onClick={() => exec('strikeThrough')} />
                  <Btn icon={PaintBucket} label="Highlight" onClick={() => { const i=document.createElement('input'); i.type='color'; i.value='#ffff00'; i.onchange=()=>exec('hiliteColor', i.value); i.click(); }} />
                  <Btn icon={Type} label="Color" onClick={() => { const i=document.createElement('input'); i.type='color'; i.onchange=()=>exec('foreColor', i.value); i.click(); }} />
                </div>
              </div>
            </Group>
            <Group label="Paragraph">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  <Btn icon={List} label="Bullets" active={activeFormats.has('insertUnorderedList')} onClick={() => exec('insertUnorderedList')} />
                  <Btn icon={ListOrdered} label="Numbering" active={activeFormats.has('insertOrderedList')} onClick={() => exec('insertOrderedList')} />
                  <Btn icon={Outdent} label="Outdent" onClick={() => exec('outdent')} />
                  <Btn icon={Indent} label="Indent" onClick={() => exec('indent')} />
                </div>
                <div className="flex items-center gap-0.5">
                  <Btn icon={AlignLeft} label="Left" active={activeFormats.has('justifyLeft')} onClick={() => exec('justifyLeft')} />
                  <Btn icon={AlignCenter} label="Center" active={activeFormats.has('justifyCenter')} onClick={() => exec('justifyCenter')} />
                  <Btn icon={AlignRight} label="Right" active={activeFormats.has('justifyRight')} onClick={() => exec('justifyRight')} />
                  <Btn icon={AlignJustify} label="Justify" active={activeFormats.has('justifyFull')} onClick={() => exec('justifyFull')} />
                  <Btn icon={Columns} label="Columns" onClick={() => {}} />
                </div>
              </div>
            </Group>
            <Group label="Drawing">
              {[Square, Circle, Triangle, ArrowRight, Star].map((Ic, i) => (
                <button key={i} onMouseDown={(e)=>e.preventDefault()} onClick={() => onInsertShape(['rect','circle','triangle','arrow','star'][i])}
                  className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Ic className="w-3.5 h-3.5" /></button>
              ))}
              <Btn icon={Shapes} label="Arrange" onClick={() => {}} />
              <Btn icon={Palette} label="Quick Styles" onClick={() => {}} />
            </Group>
            <Group label="AI">
              <Btn icon={Sparkles} label="Designer" large onClick={onAIGenerate} />
              <SmallStack>
                <Btn icon={Wand2} label="Rewrite" onClick={onAIGenerate} />
                <Btn icon={Lightbulb} label="Suggest" onClick={onAIGenerate} />
              </SmallStack>
            </Group>
          </>
        )}

        {activeTab === 'insert' && (
          <>
            <Group label="Slides">
              <Btn icon={Plus} label="New Slide" large onClick={onAddSlide} />
            </Group>
            <Group label="Tables">
              <TableGridPicker onInsert={onInsertTable} />
            </Group>
            <Group label="Images">
              <Btn icon={ImageIcon} label="Pictures" large onClick={onInsertImage} />
              <Btn icon={Sparkles} label="AI Image" large onClick={onAIGenerate} />
              <Btn icon={FileImage} label="Stock" large onClick={onInsertImage} />
              <Btn icon={Frame} label="Screenshot" large onClick={() => {}} />
            </Group>
            <Group label="Illustrations">
              <Btn icon={Shapes} label="Shapes" large onClick={() => onInsertShape('rect')} />
              <Btn icon={Smile} label="Icons" large onClick={() => onInsertShape('icon')} />
              <Btn icon={Box} label="3D Models" large onClick={() => {}} />
              <Btn icon={GitMerge} label="SmartArt" large onClick={() => {}} />
              <Btn icon={BarChart3} label="Charts" large onClick={onInsertChart} />
            </Group>
            <Group label="Text">
              <Btn icon={Type} label="Text Box" large onClick={onInsertText} />
              <Btn icon={Type} label="WordArt" large onClick={onInsertText} />
              <Btn icon={Hash} label="Slide #" large onClick={() => {}} />
              <Btn icon={Calendar} label="Date" large onClick={() => exec('insertText', new Date().toLocaleDateString())} />
            </Group>
            <Group label="Media">
              <Btn icon={MonitorPlay} label="Video" large onClick={() => {}} />
              <Btn icon={Volume2} label="Audio" large onClick={() => {}} />
              <Btn icon={Mic} label="Record" large onClick={() => {}} />
            </Group>
            <Group label="Links">
              <Btn icon={Link2} label="Hyperlink" large onClick={() => exec('createLink', prompt('URL:') || '')} />
              <Btn icon={MessageSquare} label="Comment" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'draw' && (
          <>
            <Group label="Tools">
              <Btn icon={Pen} label="Pen" large onClick={() => {}} />
              <Btn icon={Pencil} label="Pencil" large onClick={() => {}} />
              <Btn icon={Highlighter} label="Highlighter" large onClick={() => {}} />
              <Btn icon={Eraser} label="Eraser" large onClick={() => {}} />
            </Group>
            <Group label="Convert">
              <Btn icon={Type} label="Ink to Text" large onClick={() => {}} />
              <Btn icon={Shapes} label="Ink to Shape" large onClick={() => {}} />
            </Group>
            <Group label="Replay">
              <Btn icon={Play} label="Ink Replay" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'design' && (
          <>
            <Group label="Themes">
              <div className="flex items-center gap-1.5 px-1 overflow-x-auto max-w-[480px]">
                {themes.map(th => (
                  <button key={th.id} onClick={() => onApplyTheme(th.id)} title={th.name}
                    className={cn("flex flex-col items-center gap-1 group flex-shrink-0")}>
                    <div className={cn("w-16 h-10 rounded border border-border hover:border-accent overflow-hidden relative", th.bg)}>
                      <div className={cn("absolute bottom-1 left-1 w-6 h-1 rounded", th.accent)} />
                      <div className="absolute bottom-1 left-8 w-4 h-1 rounded bg-current opacity-30" />
                    </div>
                    <span className="text-[9px] text-muted-foreground group-hover:text-foreground">{th.name}</span>
                  </button>
                ))}
              </div>
            </Group>
            <Group label="Variants">
              <Btn icon={Palette} label="Colors" large onClick={() => {}} />
              <Btn icon={Type} label="Fonts" large onClick={() => {}} />
              <Btn icon={Sparkles} label="Effects" large onClick={() => {}} />
            </Group>
            <Group label="Customize">
              <Btn icon={Maximize} label="Slide Size" large onClick={() => {}} />
              <Btn icon={PaintBucket} label="Background" large onClick={() => {}} />
              <Btn icon={Sparkles} label="Designer" large onClick={onAIGenerate} />
            </Group>
          </>
        )}

        {activeTab === 'transitions' && (
          <>
            <Group label="Transition to This Slide">
              <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-[520px]">
                {transitions.map(t => (
                  <button key={t} onClick={() => onApplyTransition(t)} className="flex flex-col items-center gap-1 group flex-shrink-0">
                    <div className="w-14 h-10 rounded border border-border bg-card hover:border-accent flex items-center justify-center text-[9px] text-muted-foreground group-hover:text-accent">
                      {t === 'None' ? '—' : <Wand className="w-4 h-4" />}
                    </div>
                    <span className="text-[9px] text-muted-foreground group-hover:text-foreground">{t}</span>
                  </button>
                ))}
              </div>
            </Group>
            <Group label="Timing">
              <Btn icon={Volume2} label="Sound" large onClick={() => {}} />
              <Btn icon={Timer} label="Duration" large onClick={() => {}} />
              <Btn icon={Eye} label="Apply To All" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'animations' && (
          <>
            <Group label="Animation">
              <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-[520px]">
                {animations.map(a => (
                  <button key={a} onClick={() => onApplyAnimation(a)} className="flex flex-col items-center gap-1 group flex-shrink-0">
                    <div className="w-14 h-10 rounded border border-border bg-card hover:border-accent flex items-center justify-center text-[9px] text-muted-foreground group-hover:text-accent">
                      {a === 'None' ? '—' : <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-[9px] text-muted-foreground group-hover:text-foreground">{a}</span>
                  </button>
                ))}
              </div>
            </Group>
            <Group label="Advanced">
              <Btn icon={Layers} label="Animation Pane" large onClick={() => {}} />
              <Btn icon={Sigma} label="Trigger" large onClick={() => {}} />
              <Btn icon={Timer} label="Duration" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'slideshow' && (
          <>
            <Group label="Start Slide Show">
              <Btn icon={Play} label="From Beginning" large onClick={() => onStartShow(true)} />
              <Btn icon={MonitorPlay} label="From Current" large onClick={() => onStartShow(false)} />
              <Btn icon={Eye} label="Presenter View" large onClick={() => onStartShow(false)} />
            </Group>
            <Group label="Set Up">
              <Btn icon={Timer} label="Rehearse" large onClick={() => {}} />
              <Btn icon={Mic} label="Record" large onClick={() => {}} />
              <Btn icon={SettingsIcon} label="Setup" large onClick={() => {}} />
            </Group>
            <Group label="Monitors">
              <Btn icon={MonitorPlay} label="Resolution" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'review' && (
          <>
            <Group label="Proofing">
              <Btn icon={SpellCheck} label="Spelling" large onClick={() => {}} />
              <Btn icon={Sparkles} label="AI Grammar" large onClick={onAIGenerate} />
              <Btn icon={Languages} label="Translate" large onClick={() => {}} />
            </Group>
            <Group label="Comments">
              <Btn icon={MessageSquare} label="New Comment" large onClick={() => {}} />
              <SmallStack>
                <Btn icon={MessageCircle} label="Previous" onClick={() => {}} />
                <Btn icon={MessageCircle} label="Next" onClick={() => {}} />
              </SmallStack>
            </Group>
            <Group label="Compare">
              <Btn icon={GitMerge} label="Compare" large onClick={() => {}} />
            </Group>
            <Group label="Protect">
              <Btn icon={Lock} label="Restrict" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'view' && (
          <>
            <Group label="Views">
              <Btn icon={FileText} label="Normal" large onClick={() => {}} />
              <Btn icon={LayoutGrid} label="Slide Sorter" large onClick={() => {}} />
              <Btn icon={StickyNote} label="Notes" large onClick={() => {}} />
              <Btn icon={Eye} label="Reading" large onClick={() => {}} />
              <Btn icon={Layers} label="Outline" large onClick={() => {}} />
            </Group>
            <Group label="Show">
              <Btn icon={Ruler} label="Ruler" onClick={() => {}} />
              <Btn icon={Eye} label="Gridlines" onClick={() => {}} />
              <Btn icon={Frame} label="Guides" onClick={() => {}} />
            </Group>
            <Group label="Zoom">
              <Btn icon={ZoomOut} label="Zoom Out" onClick={() => setZoom(Math.max(40, zoom - 10))} />
              <span className="text-xs px-1 min-w-[40px] text-center">{zoom}%</span>
              <Btn icon={ZoomIn} label="Zoom In" onClick={() => setZoom(Math.min(200, zoom + 10))} />
              <Btn icon={Maximize2} label="Fit" onClick={() => setZoom(100)} />
            </Group>
          </>
        )}

        {activeTab === 'help' && (
          <Group label="Help">
            <Btn icon={HelpCircle} label="Help" large onClick={() => {}} />
            <Btn icon={MessageCircle} label="Feedback" large onClick={() => {}} />
            <Btn icon={Lightbulb} label="Tips" large onClick={() => {}} />
          </Group>
        )}
      </div>
    </div>
  );
}
