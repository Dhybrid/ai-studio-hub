import { useEffect, useRef, useState, ReactNode } from 'react';
import {
  Scissors, Copy as CopyIcon, ClipboardPaste, Bold, Italic, Underline, Link2, Image as ImageIcon,
  Table as TableIcon, Trash2, Rows3, Columns3, Palette, Type, RotateCw, Maximize2, ArrowUp, ArrowDown,
  AlignLeft, AlignCenter, AlignRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TargetKind = 'text' | 'image' | 'table' | 'cell' | 'default';

interface MenuItem {
  label: string;
  icon?: any;
  onClick?: () => void;
  divider?: boolean;
  danger?: boolean;
  shortcut?: string;
}

interface Props {
  children: ReactNode;
  exec: (cmd: string, value?: string) => void;
  onAI?: () => void;
  /** Called after the menu acts so the host can mark unsaved. */
  onAction?: () => void;
  className?: string;
}

const ICONS: Record<string, any> = {};

export default function EditorContextMenu({ children, exec, onAI, onAction, className }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<MenuItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ctxTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const act = (fn: () => void) => () => { fn(); onAction?.(); setOpen(false); };

  const buildItems = (target: HTMLElement): MenuItem[] => {
    const inImage = target.closest('img') as HTMLImageElement | null;
    const inCell = target.closest('td,th') as HTMLTableCellElement | null;
    const inTable = target.closest('table');
    const hasSel = !!window.getSelection()?.toString();

    if (inImage) {
      ctxTargetRef.current = inImage;
      return [
        { label: 'Replace image', icon: ImageIcon, onClick: act(() => {
          const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
          i.onchange = () => { const f = i.files?.[0]; if (!f) return;
            const r = new FileReader(); r.onload = (ev) => { inImage.src = ev.target?.result as string; }; r.readAsDataURL(f);
          }; i.click();
        })},
        { label: 'Resize 25%', icon: Maximize2, onClick: act(() => { inImage.style.width = '25%'; inImage.style.height = 'auto'; }) },
        { label: 'Resize 50%', icon: Maximize2, onClick: act(() => { inImage.style.width = '50%'; inImage.style.height = 'auto'; }) },
        { label: 'Resize 100%', icon: Maximize2, onClick: act(() => { inImage.style.width = '100%'; inImage.style.height = 'auto'; }) },
        { label: '', divider: true },
        { label: 'Align left', icon: AlignLeft, onClick: act(() => { inImage.style.float = 'left'; inImage.style.marginRight = '12px'; }) },
        { label: 'Align center', icon: AlignCenter, onClick: act(() => { inImage.style.float = 'none'; inImage.style.display = 'block'; inImage.style.margin = '8px auto'; }) },
        { label: 'Align right', icon: AlignRight, onClick: act(() => { inImage.style.float = 'right'; inImage.style.marginLeft = '12px'; }) },
        { label: 'Free move (drag)', icon: RotateCw, onClick: act(() => makeFloating(inImage)) },
        { label: '', divider: true },
        { label: 'Delete', icon: Trash2, danger: true, onClick: act(() => inImage.remove()) },
      ];
    }

    if (inCell) {
      ctxTargetRef.current = inCell;
      const table = inTable as HTMLTableElement;
      return [
        { label: 'Insert row above', icon: Rows3, onClick: act(() => insertRow(table, inCell, 'above')) },
        { label: 'Insert row below', icon: Rows3, onClick: act(() => insertRow(table, inCell, 'below')) },
        { label: 'Insert column left', icon: Columns3, onClick: act(() => insertCol(table, inCell, 'left')) },
        { label: 'Insert column right', icon: Columns3, onClick: act(() => insertCol(table, inCell, 'right')) },
        { label: '', divider: true },
        { label: 'Delete row', icon: Trash2, onClick: act(() => inCell.parentElement?.remove()) },
        { label: 'Delete column', icon: Trash2, onClick: act(() => deleteCol(table, inCell)) },
        { label: 'Delete table', icon: Trash2, danger: true, onClick: act(() => table?.remove()) },
        { label: '', divider: true },
        { label: 'Cell color', icon: Palette, onClick: act(() => {
          const i = document.createElement('input'); i.type = 'color';
          i.onchange = () => { inCell.style.background = i.value; }; i.click();
        }) },
        { label: 'Text color', icon: Type, onClick: act(() => {
          const i = document.createElement('input'); i.type = 'color';
          i.onchange = () => { inCell.style.color = i.value; }; i.click();
        }) },
      ];
    }

    // Text / default
    const items: MenuItem[] = [];
    if (hasSel) {
      items.push(
        { label: 'Cut', icon: Scissors, shortcut: '⌘X', onClick: act(() => exec('cut')) },
        { label: 'Copy', icon: CopyIcon, shortcut: '⌘C', onClick: act(() => exec('copy')) },
      );
    }
    items.push({ label: 'Paste', icon: ClipboardPaste, shortcut: '⌘V', onClick: act(() => exec('paste')) });
    if (hasSel) {
      items.push(
        { label: '', divider: true },
        { label: 'Bold', icon: Bold, shortcut: '⌘B', onClick: act(() => exec('bold')) },
        { label: 'Italic', icon: Italic, shortcut: '⌘I', onClick: act(() => exec('italic')) },
        { label: 'Underline', icon: Underline, shortcut: '⌘U', onClick: act(() => exec('underline')) },
        { label: 'Link…', icon: Link2, onClick: act(() => { const u = prompt('URL:'); if (u) exec('createLink', u); }) },
      );
      if (onAI) items.push({ label: 'Ask AI', icon: Sparkles, onClick: act(onAI) });
    }
    items.push(
      { label: '', divider: true },
      { label: 'Select all', shortcut: '⌘A', onClick: act(() => exec('selectAll')) },
    );
    return items;
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const tgt = e.target as HTMLElement;
    if (!wrapperRef.current?.contains(tgt)) return;
    e.preventDefault();
    const built = buildItems(tgt);
    setItems(built);
    setPos({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  return (
    <div ref={wrapperRef} onContextMenu={onContextMenu} className={className}>
      {children}
      {open && (
        <div
          ref={menuRef}
          className="fixed z-[70] min-w-[220px] bg-card border border-border rounded-lg shadow-2xl py-1 text-sm animate-in fade-in zoom-in-95"
          style={{ left: Math.min(pos.x, window.innerWidth - 240), top: Math.min(pos.y, window.innerHeight - items.length * 32) }}
        >
          {items.map((it, i) => it.divider ? (
            <div key={i} className="h-px bg-border my-1" />
          ) : (
            <button
              key={i}
              onClick={it.onClick}
              className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-hover",
                it.danger && "text-red-500")}
            >
              {it.icon && <it.icon className="w-3.5 h-3.5 flex-shrink-0" />}
              <span className="flex-1 text-xs">{it.label}</span>
              {it.shortcut && <span className="text-[10px] text-muted-foreground">{it.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- helpers
function insertRow(table: HTMLTableElement, cell: HTMLTableCellElement, where: 'above' | 'below') {
  if (!table) return;
  const row = cell.parentElement as HTMLTableRowElement;
  const cols = row.cells.length;
  const newRow = table.insertRow(row.rowIndex + (where === 'below' ? 1 : 0));
  for (let i = 0; i < cols; i++) {
    const td = newRow.insertCell();
    td.style.cssText = (row.cells[i] as HTMLElement).style.cssText;
    td.innerHTML = '&nbsp;';
  }
}
function insertCol(table: HTMLTableElement, cell: HTMLTableCellElement, where: 'left' | 'right') {
  if (!table) return;
  const colIdx = cell.cellIndex + (where === 'right' ? 1 : 0);
  for (const r of Array.from(table.rows)) {
    const ref = r.cells[colIdx];
    const td = r.insertCell(colIdx);
    td.style.cssText = (r.cells[0] as HTMLElement)?.style.cssText || '';
    td.innerHTML = '&nbsp;';
  }
}
function deleteCol(table: HTMLTableElement, cell: HTMLTableCellElement) {
  if (!table) return;
  const idx = cell.cellIndex;
  for (const r of Array.from(table.rows)) r.deleteCell(idx);
}
function makeFloating(el: HTMLElement) {
  el.style.position = 'absolute';
  el.style.cursor = 'move';
  el.draggable = true;
  let sx = 0, sy = 0, ox = 0, oy = 0;
  el.addEventListener('dragstart', (e) => {
    sx = e.clientX; sy = e.clientY;
    const r = el.getBoundingClientRect();
    ox = r.left; oy = r.top;
    e.dataTransfer?.setData('text/plain', 'move');
  });
  el.addEventListener('dragend', (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    el.style.left = ox + dx + 'px';
    el.style.top = oy + dy + 'px';
  });
}
