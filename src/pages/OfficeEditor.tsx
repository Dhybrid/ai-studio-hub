import { useState, useRef, useEffect } from 'react';
import { FileSpreadsheet, Presentation, FileText, Wand2, Loader2, Download, Plus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Table, Image, BarChart3, Undo2, Redo2, Type, PaintBucket, ChevronDown, X, SlidersHorizontal, PieChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

type OfficeMode = 'select' | 'document' | 'spreadsheet' | 'presentation';

const mockSlides = [
  { id: 1, title: 'Title Slide', content: 'Q4 Business Report' },
  { id: 2, title: 'Executive Summary', content: 'Key metrics and highlights' },
  { id: 3, title: 'Revenue Analysis', content: 'Revenue trends and breakdown' },
  { id: 4, title: 'Market Position', content: 'Competitive landscape' },
  { id: 5, title: 'Next Steps', content: 'Action items and roadmap' },
];

const spreadsheetData = Array.from({ length: 20 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => (r === 0 ? String.fromCharCode(65 + c) : r < 5 && c < 4 ? `${Math.floor(Math.random() * 1000)}` : ''))
);

// ---- Mode Selection Screen ----
const ModeSelector = ({ onSelect }: { onSelect: (m: OfficeMode) => void }) => {
  const modes = [
    { id: 'document' as const, icon: FileText, title: 'Document', desc: 'Create Word-style documents with rich text editing', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'spreadsheet' as const, icon: FileSpreadsheet, title: 'Spreadsheet', desc: 'Build Excel-style spreadsheets with formulas', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'presentation' as const, icon: Presentation, title: 'Presentation', desc: 'Design PowerPoint-style slide decks', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">What do you want to create?</h1>
          <p className="text-sm text-muted-foreground">Choose a format or let AI generate it from a prompt</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {modes.map((m) => (
            <button key={m.id} onClick={() => onSelect(m.id)} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border hover:border-accent/30 hover:bg-surface-hover transition-all group text-center">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", m.bg)}>
                <m.icon className={cn("w-7 h-7", m.color)} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{m.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="max-w-lg mx-auto">
          <AIPromptBox placeholder="Or describe what you need — e.g. 'Create a Q4 sales report with charts'" onGenerate={(prompt) => onSelect('document')} />
        </div>
      </div>
    </div>
  );
};

// ---- AI Prompt Box (reusable) ----
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
          {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate with AI</>}
        </button>
      </div>
    </div>
  );
};

// ---- Document Editor (Word-like) ----
const DocumentEditor = ({ isMobile }: { isMobile: boolean }) => {
  const toolbarBtns = [
    { icon: Undo2 }, { icon: Redo2 }, null,
    { icon: Bold }, { icon: Italic }, { icon: Underline }, null,
    { icon: AlignLeft }, { icon: AlignCenter }, { icon: AlignRight }, null,
    { icon: Table }, { icon: Image },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center gap-0.5 px-2 sm:px-4 overflow-x-auto flex-shrink-0 bg-surface/50">
        <select className="text-xs bg-transparent border border-border rounded px-2 py-1 text-foreground mr-1 flex-shrink-0">
          <option>Normal</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option>
        </select>
        <select className="text-xs bg-transparent border border-border rounded px-2 py-1 text-foreground mr-1 flex-shrink-0">
          <option>12</option><option>14</option><option>16</option><option>18</option><option>24</option>
        </select>
        {toolbarBtns.map((btn, i) =>
          btn === null
            ? <div key={i} className="w-px h-5 bg-border mx-1 flex-shrink-0" />
            : <button key={i} className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground flex-shrink-0"><btn.icon className="w-3.5 h-3.5" /></button>
        )}
      </div>

      {/* Page area */}
      <div className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4 sm:p-8">
        <div className={cn("bg-card border border-border shadow-sm rounded-sm", isMobile ? "w-full min-h-[500px]" : "w-[816px] min-h-[1056px]")} style={{ padding: isMobile ? '24px' : '96px 72px' }}>
          <div contentEditable suppressContentEditableWarning className="outline-none text-foreground text-sm leading-relaxed min-h-[200px]">
            <h1 className="text-2xl font-bold mb-4">Untitled Document</h1>
            <p className="text-muted-foreground">Start typing or use AI to generate content...</p>
          </div>
        </div>
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to write, edit or format..." onGenerate={() => {}} />
      </div>
    </div>
  );
};

// ---- Spreadsheet Editor (Excel-like) ----
const SpreadsheetEditor = ({ isMobile }: { isMobile: boolean }) => {
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const cols = 'ABCDEFGH'.split('');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Formula bar */}
      <div className="h-9 border-b border-border flex items-center gap-2 px-2 sm:px-4 bg-surface/50 flex-shrink-0">
        <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{selectedCell}</span>
        <div className="w-px h-5 bg-border" />
        <input className="flex-1 text-xs bg-transparent outline-none text-foreground font-mono" placeholder="Enter value or formula..." />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="w-10 h-7 bg-surface border border-border text-[10px] text-muted-foreground font-medium sticky top-0 z-10" />
              {cols.map((c) => (
                <th key={c} className="h-7 bg-surface border border-border text-[10px] text-muted-foreground font-medium min-w-[100px] sticky top-0 z-10">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spreadsheetData.slice(1).map((row, r) => (
              <tr key={r}>
                <td className="w-10 h-7 bg-surface border border-border text-[10px] text-muted-foreground text-center font-medium">{r + 1}</td>
                {row.map((cell, c) => {
                  const cellId = `${cols[c]}${r + 1}`;
                  return (
                    <td
                      key={c}
                      onClick={() => setSelectedCell(cellId)}
                      className={cn("h-7 border border-border text-xs font-mono px-2 cursor-cell", selectedCell === cellId ? "bg-accent/10 ring-2 ring-accent ring-inset" : "hover:bg-surface-hover")}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div className="h-8 border-t border-border flex items-center gap-1 px-2 bg-surface/50 flex-shrink-0">
        <button className="px-3 py-1 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">Sheet 1</button>
        <button className="px-3 py-1 rounded text-[10px] font-medium text-muted-foreground hover:bg-surface-hover">Sheet 2</button>
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Plus className="w-3 h-3" /></button>
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to create formulas, analyze data, generate charts..." onGenerate={() => {}} />
      </div>
    </div>
  );
};

// ---- Presentation Editor (PowerPoint-like) ----
const PresentationEditor = ({ isMobile }: { isMobile: boolean }) => {
  const [selectedSlide, setSelectedSlide] = useState(1);

  return (
    <div className="flex-1 flex min-h-0">
      {/* Slide panel (left on desktop, horizontal strip on mobile) */}
      {!isMobile && (
        <div className="w-[180px] border-r border-border flex flex-col bg-surface/30 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Slides</span>
            <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Plus className="w-3 h-3" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {mockSlides.map((slide) => (
              <button
                key={slide.id}
                onClick={() => setSelectedSlide(slide.id)}
                className={cn("w-full rounded-lg border overflow-hidden transition-all", selectedSlide === slide.id ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-muted-foreground/30")}
              >
                <div className="aspect-[16/9] bg-card flex items-center justify-center p-2">
                  <p className="text-[8px] text-muted-foreground text-center truncate">{slide.content}</p>
                </div>
                <div className="px-2 py-1 bg-surface/50">
                  <p className="text-[9px] font-medium text-foreground truncate">{slide.id}. {slide.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile slide strip */}
        {isMobile && (
          <div className="h-10 flex items-center gap-2 px-3 border-b border-border overflow-x-auto flex-shrink-0">
            {mockSlides.map((slide) => (
              <button key={slide.id} onClick={() => setSelectedSlide(slide.id)} className={cn("px-3 py-1 rounded-md text-[10px] font-medium whitespace-nowrap flex-shrink-0", selectedSlide === slide.id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>
                {slide.id}
              </button>
            ))}
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground flex-shrink-0"><Plus className="w-3 h-3" /></button>
          </div>
        )}

        {/* Slide canvas */}
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-3 sm:p-8 overflow-auto">
          <div className={cn("rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center relative", isMobile ? "w-full aspect-[16/9]" : "w-full max-w-4xl aspect-[16/9]")} style={{ padding: isMobile ? '16px' : '48px' }}>
            <div className="text-center">
              <h1 className={cn("font-bold text-foreground mb-3", isMobile ? "text-lg" : "text-3xl")}>
                {mockSlides.find(s => s.id === selectedSlide)?.content}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">{mockSlides.find(s => s.id === selectedSlide)?.title}</p>
              {selectedSlide === 3 && (
                <div className="mt-4 sm:mt-8 flex items-end justify-center gap-1 sm:gap-3 h-16 sm:h-32">
                  {[65, 78, 45, 92, 85, 70, 88].map((h, i) => (
                    <div key={i} className="w-4 sm:w-10 bg-accent/30 hover:bg-accent/50 rounded-t transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
              )}
              {selectedSlide === 4 && (
                <div className="mt-4 sm:mt-8 flex justify-center gap-4 sm:gap-8">
                  <div className="text-center"><PieChart className="w-8 sm:w-16 h-8 sm:h-16 text-accent/40 mx-auto" /><p className="text-[10px] text-muted-foreground mt-1">Market Share</p></div>
                  <div className="text-center"><TrendingUp className="w-8 sm:w-16 h-8 sm:h-16 text-green-400/40 mx-auto" /><p className="text-[10px] text-muted-foreground mt-1">Growth</p></div>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-3 text-[9px] text-muted-foreground/40">
              {selectedSlide} / {mockSlides.length}
            </div>
          </div>
        </div>

        {/* AI bar */}
        <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
          <AIPromptBox placeholder="Ask AI to create slides, add charts, redesign layout..." onGenerate={() => {}} />
        </div>
      </div>
    </div>
  );
};

// ---- Main OfficeEditor ----
const OfficeEditor = () => {
  const [mode, setMode] = useState<OfficeMode>('select');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const modeLabels: Record<string, { icon: any; label: string }> = {
    document: { icon: FileText, label: 'Document' },
    spreadsheet: { icon: FileSpreadsheet, label: 'Spreadsheet' },
    presentation: { icon: Presentation, label: 'Presentation' },
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      {mode !== 'select' && (
        <div className="h-11 flex items-center justify-between px-3 sm:px-4 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode('select')} className="text-xs text-muted-foreground hover:text-foreground">←</button>
            {(() => {
              const m = modeLabels[mode];
              return m ? (
                <div className="flex items-center gap-1.5">
                  <m.icon className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">{m.label}</span>
                </div>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Download className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {mode === 'select' && (
        <div className="h-11 flex items-center px-3 sm:px-4 border-b border-border bg-background flex-shrink-0">
          <button onClick={() => navigate('/office')} className="text-xs text-muted-foreground hover:text-foreground mr-3">← Back</button>
          <span className="text-sm font-semibold text-foreground">Office</span>
        </div>
      )}

      {mode === 'select' && <ModeSelector onSelect={setMode} />}
      {mode === 'document' && <DocumentEditor isMobile={isMobile} />}
      {mode === 'spreadsheet' && <SpreadsheetEditor isMobile={isMobile} />}
      {mode === 'presentation' && <PresentationEditor isMobile={isMobile} />}
    </div>
  );
};

export default OfficeEditor;
