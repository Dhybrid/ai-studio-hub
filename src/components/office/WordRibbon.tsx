import { useState } from 'react';
import {
  ClipboardPaste, Scissors, Copy, Brush, Bold, Italic, Underline, Strikethrough,
  Subscript, Superscript, Type, PaintBucket, RemoveFormatting, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent, ChevronDown,
  Image as ImageIcon, Table as TableIcon, Link2, Minus, BarChart3, Shapes, Smile,
  Box, MessageSquare, StickyNote, Calendar, Sigma, Hash, Pen, Pencil, Highlighter,
  Eraser, Palette, Layers, FileText, Ruler, Eye, EyeOff, ZoomIn, ZoomOut, SplitSquareHorizontal,
  Search, Replace, SpellCheck, Languages, Wand2, Volume2, Accessibility, MessageCircle,
  GitMerge, Lock, Code, FormInput, BookMarked, Quote, ListChecks, Mail, Stamp,
  RotateCw, Crop, Sparkles, FileSearch, BookOpen, Footprints, Braces, Settings,
  HelpCircle, Lightbulb, Maximize2, Columns, FileImage, Frame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TableGridPicker from './TableGridPicker';

export type RibbonTab = 'home' | 'insert' | 'draw' | 'design' | 'layout' | 'references' | 'mailings' | 'review' | 'view' | 'help';

interface WordRibbonProps {
  activeTab: RibbonTab;
  onTabChange: (t: RibbonTab) => void;
  exec: (cmd: string, value?: string) => void;
  activeFormats: Set<string>;
  onInsertImage: () => void;
  onInsertTable: (rows: number, cols: number, opts: { header: boolean; bordered: boolean }) => void;
  onInsertLink: () => void;
  onAIRewrite: () => void;
  onAddPage?: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  showRuler: boolean;
  setShowRuler: (b: boolean) => void;
}

const tabs: { id: RibbonTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' },
  { id: 'draw', label: 'Draw' },
  { id: 'design', label: 'Design' },
  { id: 'layout', label: 'Layout' },
  { id: 'references', label: 'References' },
  { id: 'mailings', label: 'Mailings' },
  { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' },
  { id: 'help', label: 'Help' },
];

const fontFamilies = ['Calibri', 'Arial', 'Times New Roman', 'Georgia', 'Cambria', 'Verdana', 'Courier New', 'Tahoma', 'Trebuchet MS', 'Garamond'];
const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
const fontSizeMap: Record<string, string> = { '8': '1', '9': '1', '10': '2', '11': '2', '12': '3', '14': '4', '16': '4', '18': '5', '20': '5', '24': '6', '28': '6', '32': '7', '36': '7', '48': '7', '72': '7' };

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
    {large ? (
      <>
        <Icon className="w-5 h-5" />
        <span className="text-[9px] leading-tight text-center">{label}</span>
      </>
    ) : (
      <Icon className="w-3.5 h-3.5" />
    )}
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

export default function WordRibbon(props: WordRibbonProps) {
  const { activeTab, onTabChange, exec, activeFormats, onInsertImage, onInsertTable, onInsertLink, onAIRewrite, onAddPage, zoom, setZoom, showRuler, setShowRuler } = props;
  const [font, setFont] = useState('Calibri');
  const [size, setSize] = useState('11');

  return (
    <div className="border-b border-border bg-surface/40 flex-shrink-0">
      {/* Tabs */}
      <div className="flex items-center px-2 gap-0 border-b border-border/60 h-8 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "px-3 h-8 text-xs font-medium transition-colors border-b-2 flex-shrink-0",
              activeTab === t.id
                ? "text-accent border-accent"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-hover"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ribbon contents */}
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
            <Group label="Font">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <select value={font} onChange={(e) => { setFont(e.target.value); exec('fontName', e.target.value); }}
                    className="text-xs bg-card border border-border rounded px-1.5 py-0.5 w-28 outline-none">
                    {fontFamilies.map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select value={size} onChange={(e) => { setSize(e.target.value); exec('fontSize', fontSizeMap[e.target.value] || '3'); }}
                    className="text-xs bg-card border border-border rounded px-1.5 py-0.5 w-12 outline-none">
                    {fontSizes.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <Btn icon={Type} label="Grow Font" onClick={() => exec('fontSize', '5')} />
                  <Btn icon={RemoveFormatting} label="Clear Formatting" onClick={() => exec('removeFormat')} />
                </div>
                <div className="flex items-center gap-0.5">
                  <Btn icon={Bold} label="Bold" active={activeFormats.has('bold')} onClick={() => exec('bold')} />
                  <Btn icon={Italic} label="Italic" active={activeFormats.has('italic')} onClick={() => exec('italic')} />
                  <Btn icon={Underline} label="Underline" active={activeFormats.has('underline')} onClick={() => exec('underline')} />
                  <Btn icon={Strikethrough} label="Strikethrough" active={activeFormats.has('strikeThrough')} onClick={() => exec('strikeThrough')} />
                  <Btn icon={Subscript} label="Subscript" onClick={() => exec('subscript')} />
                  <Btn icon={Superscript} label="Superscript" onClick={() => exec('superscript')} />
                  <Btn icon={PaintBucket} label="Highlight" onClick={() => {
                    const i = document.createElement('input'); i.type = 'color'; i.value = '#ffff00';
                    i.onchange = () => exec('hiliteColor', i.value); i.click();
                  }} />
                  <Btn icon={Type} label="Font Color" onClick={() => {
                    const i = document.createElement('input'); i.type = 'color';
                    i.onchange = () => exec('foreColor', i.value); i.click();
                  }} />
                </div>
              </div>
            </Group>
            <Group label="Paragraph">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  <Btn icon={List} label="Bullets" active={activeFormats.has('insertUnorderedList')} onClick={() => exec('insertUnorderedList')} />
                  <Btn icon={ListOrdered} label="Numbering" active={activeFormats.has('insertOrderedList')} onClick={() => exec('insertOrderedList')} />
                  <Btn icon={ListChecks} label="Multilevel" onClick={() => exec('insertUnorderedList')} />
                  <Btn icon={Outdent} label="Decrease Indent" onClick={() => exec('outdent')} />
                  <Btn icon={Indent} label="Increase Indent" onClick={() => exec('indent')} />
                </div>
                <div className="flex items-center gap-0.5">
                  <Btn icon={AlignLeft} label="Align Left" active={activeFormats.has('justifyLeft')} onClick={() => exec('justifyLeft')} />
                  <Btn icon={AlignCenter} label="Center" active={activeFormats.has('justifyCenter')} onClick={() => exec('justifyCenter')} />
                  <Btn icon={AlignRight} label="Align Right" active={activeFormats.has('justifyRight')} onClick={() => exec('justifyRight')} />
                  <Btn icon={AlignJustify} label="Justify" active={activeFormats.has('justifyFull')} onClick={() => exec('justifyFull')} />
                  <Btn icon={Minus} label="Borders" onClick={() => exec('insertHorizontalRule')} />
                </div>
              </div>
            </Group>
            <Group label="Styles">
              <div className="flex items-center gap-1 px-1">
                {['Normal', 'H1', 'H2', 'H3', 'Quote'].map(s => (
                  <button key={s} onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const map: any = { Normal: 'p', H1: 'h1', H2: 'h2', H3: 'h3', Quote: 'blockquote' };
                      exec('formatBlock', map[s]);
                    }}
                    className="px-2 h-[52px] min-w-[60px] border border-border rounded bg-card text-xs hover:bg-surface-hover text-foreground flex items-center justify-center">
                    {s}
                  </button>
                ))}
              </div>
            </Group>
            <Group label="Editing">
              <SmallStack>
                <Btn icon={Search} label="Find" onClick={() => {}} />
                <Btn icon={Replace} label="Replace" onClick={() => {}} />
                <Btn icon={ListChecks} label="Select" onClick={() => exec('selectAll')} />
              </SmallStack>
            </Group>
            <Group label="AI">
              <Btn icon={Sparkles} label="AI Rewrite" large onClick={onAIRewrite} />
              <SmallStack>
                <Btn icon={Wand2} label="Summarize" onClick={onAIRewrite} />
                <Btn icon={Lightbulb} label="Suggest" onClick={onAIRewrite} />
              </SmallStack>
            </Group>
          </>
        )}

        {activeTab === 'insert' && (
          <>
            <Group label="Pages">
              <Btn icon={FileText} label="Cover Page" large onClick={() => onAddPage?.()} />
              <Btn icon={FileImage} label="Blank Page" large onClick={() => onAddPage?.()} />
              <Btn icon={SplitSquareHorizontal} label="Page Break" large onClick={() => onAddPage?.()} />
            </Group>
            <Group label="Tables">
              <TableGridPicker onInsert={onInsertTable} />
            </Group>
            <Group label="Illustrations">
              <Btn icon={ImageIcon} label="Pictures" large onClick={onInsertImage} />
              <Btn icon={Sparkles} label="AI Image" large onClick={() => {}} />
              <Btn icon={Shapes} label="Shapes" large onClick={() => {}} />
              <Btn icon={Smile} label="Icons" large onClick={() => {}} />
              <Btn icon={Box} label="3D Models" large onClick={() => {}} />
              <Btn icon={BarChart3} label="Charts" large onClick={() => {}} />
              <Btn icon={Frame} label="Screenshot" large onClick={() => {}} />
            </Group>
            <Group label="Links">
              <Btn icon={Link2} label="Hyperlink" large onClick={onInsertLink} />
              <Btn icon={BookMarked} label="Bookmark" large onClick={() => {}} />
            </Group>
            <Group label="Header & Footer">
              <Btn icon={Layers} label="Header" large onClick={() => {}} />
              <Btn icon={Layers} label="Footer" large onClick={() => {}} />
              <Btn icon={Hash} label="Page #" large onClick={() => {}} />
            </Group>
            <Group label="Text">
              <Btn icon={Type} label="Text Box" large onClick={() => {}} />
              <Btn icon={Type} label="WordArt" large onClick={() => {}} />
              <Btn icon={Calendar} label="Date" large onClick={() => exec('insertText', new Date().toLocaleDateString())} />
            </Group>
            <Group label="Symbols">
              <Btn icon={Sigma} label="Equation" large onClick={() => {}} />
              <Btn icon={Hash} label="Symbol" large onClick={() => {}} />
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
            <Group label="Stencils">
              <Btn icon={Ruler} label="Ruler" large onClick={() => {}} />
              <Btn icon={Palette} label="Color" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'design' && (
          <>
            <Group label="Document Formatting">
              {['Default', 'Modern', 'Classic', 'Minimal', 'Bold', 'Elegant'].map(t => (
                <button key={t} onMouseDown={(e) => e.preventDefault()}
                  className="px-2 h-[60px] min-w-[68px] border border-border rounded bg-card text-xs hover:border-accent text-foreground flex flex-col items-center justify-center gap-1">
                  <div className="w-10 h-6 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-sm" />
                  <span className="text-[9px]">{t}</span>
                </button>
              ))}
            </Group>
            <Group label="Page Background">
              <Btn icon={Stamp} label="Watermark" large onClick={() => {}} />
              <Btn icon={Palette} label="Page Color" large onClick={() => {}} />
              <Btn icon={Frame} label="Page Borders" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <Group label="Page Setup">
              <Btn icon={Frame} label="Margins" large onClick={() => {}} />
              <Btn icon={RotateCw} label="Orientation" large onClick={() => {}} />
              <Btn icon={FileImage} label="Size" large onClick={() => {}} />
              <Btn icon={Columns} label="Columns" large onClick={() => {}} />
              <Btn icon={SplitSquareHorizontal} label="Breaks" large onClick={() => onAddPage?.()} />
              <Btn icon={Hash} label="Line #" large onClick={() => {}} />
            </Group>
            <Group label="Paragraph">
              <Btn icon={Indent} label="Indent +" onClick={() => exec('indent')} />
              <Btn icon={Outdent} label="Indent -" onClick={() => exec('outdent')} />
            </Group>
            <Group label="Arrange">
              <Btn icon={Layers} label="Position" large onClick={() => {}} />
              <Btn icon={Frame} label="Wrap Text" large onClick={() => {}} />
              <Btn icon={RotateCw} label="Rotate" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'references' && (
          <>
            <Group label="Table of Contents">
              <Btn icon={BookOpen} label="TOC" large onClick={() => {}} />
            </Group>
            <Group label="Footnotes">
              <Btn icon={StickyNote} label="Insert Footnote" large onClick={() => {}} />
              <Btn icon={Footprints} label="Endnote" large onClick={() => {}} />
            </Group>
            <Group label="Citations">
              <Btn icon={Quote} label="Insert Citation" large onClick={() => {}} />
              <Btn icon={BookMarked} label="Bibliography" large onClick={() => {}} />
            </Group>
            <Group label="Captions">
              <Btn icon={ImageIcon} label="Insert Caption" large onClick={() => {}} />
              <Btn icon={ListOrdered} label="Index" large onClick={() => {}} />
            </Group>
            <Group label="Research">
              <Btn icon={FileSearch} label="Smart Lookup" large onClick={() => {}} />
              <Btn icon={Sparkles} label="AI Research" large onClick={onAIRewrite} />
            </Group>
          </>
        )}

        {activeTab === 'mailings' && (
          <>
            <Group label="Create">
              <Btn icon={Mail} label="Envelopes" large onClick={() => {}} />
              <Btn icon={Stamp} label="Labels" large onClick={() => {}} />
            </Group>
            <Group label="Start Mail Merge">
              <Btn icon={GitMerge} label="Start Merge" large onClick={() => {}} />
              <Btn icon={ListChecks} label="Recipients" large onClick={() => {}} />
            </Group>
            <Group label="Write & Insert">
              <Btn icon={Type} label="Address Block" large onClick={() => {}} />
              <Btn icon={MessageCircle} label="Greeting Line" large onClick={() => {}} />
              <Btn icon={Braces} label="Merge Field" large onClick={() => {}} />
            </Group>
            <Group label="Finish">
              <Btn icon={Eye} label="Preview" large onClick={() => {}} />
              <Btn icon={GitMerge} label="Finish & Merge" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'review' && (
          <>
            <Group label="Proofing">
              <Btn icon={SpellCheck} label="Spelling" large onClick={() => {}} />
              <Btn icon={Sparkles} label="AI Grammar" large onClick={onAIRewrite} />
              <Btn icon={BookOpen} label="Thesaurus" large onClick={() => {}} />
              <Btn icon={Hash} label="Word Count" large onClick={() => {}} />
              <Btn icon={Volume2} label="Read Aloud" large onClick={() => {}} />
              <Btn icon={Accessibility} label="Accessibility" large onClick={() => {}} />
              <Btn icon={Languages} label="Translate" large onClick={() => {}} />
            </Group>
            <Group label="Comments">
              <Btn icon={MessageSquare} label="New Comment" large onClick={() => {}} />
              <SmallStack>
                <Btn icon={MessageCircle} label="Previous" onClick={() => {}} />
                <Btn icon={MessageCircle} label="Next" onClick={() => {}} />
              </SmallStack>
            </Group>
            <Group label="Tracking">
              <Btn icon={Eye} label="Track Changes" large onClick={() => {}} />
              <Btn icon={EyeOff} label="Markup" large onClick={() => {}} />
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
              <Btn icon={BookOpen} label="Read Mode" large onClick={() => {}} />
              <Btn icon={FileText} label="Print Layout" large onClick={() => {}} />
              <Btn icon={Code} label="Web Layout" large onClick={() => {}} />
              <Btn icon={ListOrdered} label="Outline" large onClick={() => {}} />
            </Group>
            <Group label="Show">
              <Btn icon={Ruler} label="Ruler" active={showRuler} onClick={() => setShowRuler(!showRuler)} />
              <Btn icon={Eye} label="Gridlines" onClick={() => {}} />
              <Btn icon={Layers} label="Navigation" onClick={() => {}} />
            </Group>
            <Group label="Zoom">
              <Btn icon={ZoomOut} label="Zoom Out" onClick={() => setZoom(Math.max(50, zoom - 10))} />
              <span className="text-xs px-1 min-w-[40px] text-center">{zoom}%</span>
              <Btn icon={ZoomIn} label="Zoom In" onClick={() => setZoom(Math.min(200, zoom + 10))} />
              <Btn icon={Maximize2} label="100%" onClick={() => setZoom(100)} />
            </Group>
            <Group label="Window">
              <Btn icon={SplitSquareHorizontal} label="Split" large onClick={() => {}} />
            </Group>
          </>
        )}

        {activeTab === 'help' && (
          <>
            <Group label="Help">
              <Btn icon={HelpCircle} label="Help" large onClick={() => {}} />
              <Btn icon={MessageCircle} label="Feedback" large onClick={() => {}} />
              <Btn icon={Lightbulb} label="Tips" large onClick={() => {}} />
              <Btn icon={BookOpen} label="What's New" large onClick={() => {}} />
            </Group>
          </>
        )}
      </div>
    </div>
  );
}
