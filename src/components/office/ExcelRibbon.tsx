import { useState } from 'react';
import {
  Scissors, Copy, ClipboardPaste, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  PaintBucket, Type as TypeIcon, ChevronDown, Wand2, BarChart3, Image as ImageIcon, Table as TableIcon,
  Sigma, Filter, ArrowUpAZ, ArrowDownAZ, Search, Replace as ReplaceIcon, Eye, EyeOff, Grid3X3,
  Snowflake, Plus, Minus, Percent, DollarSign, Trash2, Rows, Columns, MessageSquare, Sparkles,
  ChevronsUpDown, WrapText, Merge, Hash, Calendar, Link2, Shapes
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExcelTab = 'home' | 'insert' | 'page' | 'formulas' | 'data' | 'review' | 'view';

interface RibbonProps {
  active: ExcelTab;
  onTabChange: (t: ExcelTab) => void;
  onAction: (action: string, value?: any) => void;
  cellFormat: {
    bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    fontFamily?: string; fontSize?: number;
    color?: string; bg?: string;
    numberFormat?: string;
    wrap?: boolean;
  };
}

const TABS: ExcelTab[] = ['home', 'insert', 'page', 'formulas', 'data', 'review', 'view'];
const TAB_LABELS: Record<ExcelTab, string> = {
  home: 'Home', insert: 'Insert', page: 'Page Layout', formulas: 'Formulas',
  data: 'Data', review: 'Review', view: 'View',
};

const FONTS = ['Calibri', 'Arial', 'Times New Roman', 'Verdana', 'Courier New', 'Georgia', 'Tahoma'];
const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-2 border-r border-border last:border-r-0 h-full justify-between py-1">
      <div className="flex items-center gap-1">{children}</div>
      <div className="text-[9px] text-muted-foreground mt-1">{title}</div>
    </div>
  );
}

function IconBtn({ icon: Icon, active, onClick, label, size = 'sm' }: { icon: any; active?: boolean; onClick?: () => void; label?: string; size?: 'sm' | 'lg' }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "rounded hover:bg-surface-hover flex items-center justify-center transition-colors",
        size === 'sm' ? "w-7 h-7" : "w-12 h-12 flex-col gap-0.5",
        active && "bg-accent/15 text-accent"
      )}
    >
      <Icon className={size === 'sm' ? "w-3.5 h-3.5" : "w-5 h-5"} />
      {size === 'lg' && label && <span className="text-[9px]">{label}</span>}
    </button>
  );
}

export default function ExcelRibbon({ active, onTabChange, onAction, cellFormat }: RibbonProps) {
  const [fillOpen, setFillOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const COLORS = ['#000000', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#f3f4f6', '#9ca3af'];

  return (
    <div className="bg-card border-b border-border flex-shrink-0">
      {/* tabs */}
      <div className="h-8 flex items-center px-2 border-b border-border bg-surface/30 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={cn(
              "px-3 h-full text-xs font-medium transition-colors whitespace-nowrap",
              active === t ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ribbon body */}
      <div className="h-[68px] flex items-stretch overflow-x-auto px-1">
        {active === 'home' && (
          <>
            <Group title="Clipboard">
              <IconBtn icon={ClipboardPaste} size="lg" label="Paste" onClick={() => onAction('paste')} />
              <div className="flex flex-col gap-0.5">
                <IconBtn icon={Scissors} label="Cut" onClick={() => onAction('cut')} />
                <IconBtn icon={Copy} label="Copy" onClick={() => onAction('copy')} />
              </div>
            </Group>
            <Group title="Font">
              <select
                value={cellFormat.fontFamily || 'Calibri'}
                onChange={(e) => onAction('fontFamily', e.target.value)}
                className="h-7 text-xs bg-surface border border-border rounded px-1 w-24"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select
                value={cellFormat.fontSize || 11}
                onChange={(e) => onAction('fontSize', Number(e.target.value))}
                className="h-7 text-xs bg-surface border border-border rounded px-1 w-12"
              >
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <IconBtn icon={Bold} active={cellFormat.bold} onClick={() => onAction('toggle', 'bold')} label="Bold (Ctrl+B)" />
              <IconBtn icon={Italic} active={cellFormat.italic} onClick={() => onAction('toggle', 'italic')} label="Italic" />
              <IconBtn icon={Underline} active={cellFormat.underline} onClick={() => onAction('toggle', 'underline')} label="Underline" />
              <IconBtn icon={Strikethrough} active={cellFormat.strike} onClick={() => onAction('toggle', 'strike')} label="Strikethrough" />
              <div className="relative">
                <button onClick={() => { setColorOpen(o => !o); setFillOpen(false); }} className="w-7 h-7 rounded hover:bg-surface-hover flex flex-col items-center justify-center">
                  <TypeIcon className="w-3 h-3" />
                  <div className="w-4 h-1" style={{ background: cellFormat.color || '#000' }} />
                </button>
                {colorOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 z-50 grid grid-cols-6 gap-1">
                    {COLORS.map(c => <button key={c} onClick={() => { onAction('color', c); setColorOpen(false); }} className="w-5 h-5 rounded border border-border" style={{ background: c }} />)}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setFillOpen(o => !o); setColorOpen(false); }} className="w-7 h-7 rounded hover:bg-surface-hover flex flex-col items-center justify-center">
                  <PaintBucket className="w-3 h-3" />
                  <div className="w-4 h-1" style={{ background: cellFormat.bg || 'transparent', border: '1px solid #ccc' }} />
                </button>
                {fillOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 z-50 grid grid-cols-6 gap-1">
                    <button onClick={() => { onAction('bg', null); setFillOpen(false); }} className="w-5 h-5 rounded border border-border bg-transparent text-[8px]">×</button>
                    {COLORS.map(c => <button key={c} onClick={() => { onAction('bg', c); setFillOpen(false); }} className="w-5 h-5 rounded border border-border" style={{ background: c }} />)}
                  </div>
                )}
              </div>
            </Group>
            <Group title="Alignment">
              <IconBtn icon={AlignVerticalJustifyStart} active={cellFormat.valign === 'top'} onClick={() => onAction('valign', 'top')} label="Top Align" />
              <IconBtn icon={AlignVerticalJustifyCenter} active={cellFormat.valign === 'middle'} onClick={() => onAction('valign', 'middle')} label="Middle Align" />
              <IconBtn icon={AlignVerticalJustifyEnd} active={cellFormat.valign === 'bottom'} onClick={() => onAction('valign', 'bottom')} label="Bottom Align" />
              <IconBtn icon={AlignLeft} active={cellFormat.align === 'left'} onClick={() => onAction('align', 'left')} label="Align Left" />
              <IconBtn icon={AlignCenter} active={cellFormat.align === 'center'} onClick={() => onAction('align', 'center')} label="Center" />
              <IconBtn icon={AlignRight} active={cellFormat.align === 'right'} onClick={() => onAction('align', 'right')} label="Align Right" />
              <IconBtn icon={WrapText} active={cellFormat.wrap} onClick={() => onAction('toggle', 'wrap')} label="Wrap Text" />
              <IconBtn icon={Merge} onClick={() => onAction('merge')} label="Merge & Center" />
            </Group>
            <Group title="Number">
              <select
                value={cellFormat.numberFormat || 'general'}
                onChange={(e) => onAction('numberFormat', e.target.value)}
                className="h-7 text-xs bg-surface border border-border rounded px-1 w-24"
              >
                <option value="general">General</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percent">Percent</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="text">Text</option>
              </select>
              <IconBtn icon={DollarSign} onClick={() => onAction('numberFormat', 'currency')} label="Currency" />
              <IconBtn icon={Percent} onClick={() => onAction('numberFormat', 'percent')} label="Percent" />
              <IconBtn icon={Hash} onClick={() => onAction('numberFormat', 'number')} label="Number" />
            </Group>
            <Group title="Cells">
              <IconBtn icon={Plus} size="lg" label="Insert" onClick={() => onAction('insert-row')} />
              <IconBtn icon={Trash2} size="lg" label="Delete" onClick={() => onAction('delete-row')} />
            </Group>
            <Group title="Editing">
              <IconBtn icon={Sigma} size="lg" label="AutoSum" onClick={() => onAction('autosum')} />
              <div className="flex flex-col gap-0.5">
                <IconBtn icon={ArrowUpAZ} label="Sort A-Z" onClick={() => onAction('sort', 'asc')} />
                <IconBtn icon={ArrowDownAZ} label="Sort Z-A" onClick={() => onAction('sort', 'desc')} />
              </div>
              <IconBtn icon={Search} label="Find" onClick={() => onAction('find')} />
              <IconBtn icon={ReplaceIcon} label="Replace" onClick={() => onAction('replace')} />
            </Group>
          </>
        )}

        {active === 'insert' && (
          <>
            <Group title="Tables">
              <IconBtn icon={TableIcon} size="lg" label="Table" onClick={() => onAction('insert-table')} />
            </Group>
            <Group title="Charts">
              <IconBtn icon={BarChart3} size="lg" label="Bar" onClick={() => onAction('insert-chart', 'bar')} />
              <IconBtn icon={BarChart3} size="lg" label="Line" onClick={() => onAction('insert-chart', 'line')} />
              <IconBtn icon={BarChart3} size="lg" label="Pie" onClick={() => onAction('insert-chart', 'pie')} />
            </Group>
            <Group title="Illustrations">
              <IconBtn icon={ImageIcon} size="lg" label="Image" onClick={() => onAction('insert-image')} />
              <IconBtn icon={Shapes} size="lg" label="Shapes" onClick={() => onAction('insert-shape')} />
            </Group>
            <Group title="Links">
              <IconBtn icon={Link2} size="lg" label="Link" onClick={() => onAction('insert-link')} />
            </Group>
            <Group title="Comments">
              <IconBtn icon={MessageSquare} size="lg" label="Comment" onClick={() => onAction('insert-comment')} />
            </Group>
          </>
        )}

        {active === 'page' && (
          <>
            <Group title="Themes">
              <IconBtn icon={Sparkles} size="lg" label="Themes" onClick={() => onAction('themes')} />
            </Group>
            <Group title="Page Setup">
              <IconBtn icon={Rows} size="lg" label="Margins" />
              <IconBtn icon={Columns} size="lg" label="Orientation" />
              <IconBtn icon={Hash} size="lg" label="Size" />
            </Group>
            <Group title="Scale to Fit">
              <select className="h-7 text-xs bg-surface border border-border rounded px-1 w-20">
                <option>Width: Auto</option>
              </select>
              <select className="h-7 text-xs bg-surface border border-border rounded px-1 w-20">
                <option>Height: Auto</option>
              </select>
            </Group>
          </>
        )}

        {active === 'formulas' && (
          <>
            <Group title="Function Library">
              <IconBtn icon={Sigma} size="lg" label="AutoSum" onClick={() => onAction('autosum')} />
              <IconBtn icon={Calendar} size="lg" label="Date & Time" onClick={() => onAction('insert-fn', 'TODAY')} />
              <IconBtn icon={Hash} size="lg" label="Math" onClick={() => onAction('insert-fn', 'SUM')} />
              <IconBtn icon={TypeIcon} size="lg" label="Text" onClick={() => onAction('insert-fn', 'CONCAT')} />
              <IconBtn icon={Filter} size="lg" label="Logical" onClick={() => onAction('insert-fn', 'IF')} />
              <IconBtn icon={Search} size="lg" label="Lookup" onClick={() => onAction('insert-fn', 'VLOOKUP')} />
            </Group>
            <Group title="Calculation">
              <IconBtn icon={Wand2} size="lg" label="Calculate" onClick={() => onAction('recalc')} />
            </Group>
          </>
        )}

        {active === 'data' && (
          <>
            <Group title="Sort & Filter">
              <IconBtn icon={ArrowUpAZ} size="lg" label="Sort A-Z" onClick={() => onAction('sort', 'asc')} />
              <IconBtn icon={ArrowDownAZ} size="lg" label="Sort Z-A" onClick={() => onAction('sort', 'desc')} />
              <IconBtn icon={Filter} size="lg" label="Filter" onClick={() => onAction('filter')} />
            </Group>
            <Group title="Data Tools">
              <IconBtn icon={Trash2} size="lg" label="Remove Duplicates" onClick={() => onAction('dedupe')} />
              <IconBtn icon={ChevronsUpDown} size="lg" label="Text to Columns" onClick={() => onAction('text-to-cols')} />
              <IconBtn icon={Wand2} size="lg" label="Flash Fill" onClick={() => onAction('flash-fill')} />
            </Group>
          </>
        )}

        {active === 'review' && (
          <>
            <Group title="Proofing">
              <IconBtn icon={Search} size="lg" label="Spelling" />
            </Group>
            <Group title="Comments">
              <IconBtn icon={MessageSquare} size="lg" label="New Comment" onClick={() => onAction('insert-comment')} />
            </Group>
            <Group title="Protect">
              <IconBtn icon={EyeOff} size="lg" label="Protect Sheet" />
            </Group>
          </>
        )}

        {active === 'view' && (
          <>
            <Group title="Workbook Views">
              <IconBtn icon={Grid3X3} size="lg" label="Normal" onClick={() => onAction('view', 'normal')} />
              <IconBtn icon={Eye} size="lg" label="Page Layout" onClick={() => onAction('view', 'page')} />
            </Group>
            <Group title="Show">
              <IconBtn icon={Grid3X3} size="lg" label="Gridlines" onClick={() => onAction('toggle-gridlines')} />
              <IconBtn icon={Hash} size="lg" label="Headings" onClick={() => onAction('toggle-headings')} />
            </Group>
            <Group title="Window">
              <IconBtn icon={Snowflake} size="lg" label="Freeze Panes" onClick={() => onAction('freeze')} />
              <IconBtn icon={Columns} size="lg" label="Split" onClick={() => onAction('split')} />
            </Group>
            <Group title="Zoom">
              <IconBtn icon={Plus} size="lg" label="Zoom In" onClick={() => onAction('zoom-in')} />
              <IconBtn icon={Minus} size="lg" label="Zoom Out" onClick={() => onAction('zoom-out')} />
            </Group>
          </>
        )}
      </div>
    </div>
  );
}
