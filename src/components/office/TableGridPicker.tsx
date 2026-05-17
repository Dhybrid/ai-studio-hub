import { useState, useRef, useEffect } from 'react';
import { Table as TableIcon, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onInsert: (rows: number, cols: number, opts: { header: boolean; bordered: boolean }) => void;
  trigger?: React.ReactNode;
  /** When true, the picker mounts open and calls onClose when dismissed (controlled-ish). */
  triggerClass?: string;
}

const MAX = 10;

export default function TableGridPicker({ onInsert, trigger, triggerClass }: Props) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [hover, setHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [dRows, setDRows] = useState(3);
  const [dCols, setDCols] = useState(3);
  const [header, setHeader] = useState(true);
  const [bordered, setBordered] = useState(true);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(v => !v)}
        title="Insert Table"
        className={triggerClass || "flex flex-col items-center justify-center rounded gap-0.5 px-2 py-1.5 min-w-[56px] h-[60px] text-foreground hover:bg-surface-hover"}
      >
        {trigger || (<><TableIcon className="w-5 h-5" /><span className="text-[9px] leading-tight">Table</span></>)}
      </button>

      {open && (
        <div ref={popRef} className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-2xl p-3 w-[240px]">
          <div className="text-[10px] text-muted-foreground mb-2">
            {hover.r > 0 ? `${hover.r} × ${hover.c} Table` : 'Insert Table'}
          </div>
          <div className="inline-block" onMouseLeave={() => setHover({ r: 0, c: 0 })}>
            {Array.from({ length: MAX }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: MAX }).map((_, c) => {
                  const active = r < hover.r && c < hover.c;
                  return (
                    <div
                      key={c}
                      onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                      onClick={() => { onInsert(r + 1, c + 1, { header, bordered }); setOpen(false); }}
                      className={cn(
                        "w-[18px] h-[18px] m-[1px] border cursor-pointer transition-colors",
                        active ? "bg-accent border-accent" : "bg-card border-border hover:border-accent/60"
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} className="w-3 h-3" />
              Header row
            </label>
            <button
              onClick={() => { setOpen(false); setDialog(true); }}
              className="text-[10px] text-accent hover:underline flex items-center gap-1"
            >
              <Settings2 className="w-3 h-3" /> More…
            </button>
          </div>
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDialog(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Insert Table</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Choose dimensions and style.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Columns</span>
                <input type="number" min={1} max={50} value={dCols} onChange={(e) => setDCols(Math.max(1, Math.min(50, +e.target.value || 1)))}
                  className="w-full text-sm bg-surface border border-border rounded px-2 py-1.5 outline-none focus:border-accent" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Rows</span>
                <input type="number" min={1} max={200} value={dRows} onChange={(e) => setDRows(Math.max(1, Math.min(200, +e.target.value || 1)))}
                  className="w-full text-sm bg-surface border border-border rounded px-2 py-1.5 outline-none focus:border-accent" />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} /> Header row
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={bordered} onChange={(e) => setBordered(e.target.checked)} /> Borders
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setDialog(false)} className="px-3 py-1.5 text-xs rounded hover:bg-surface-hover">Cancel</button>
              <button onClick={() => { onInsert(dRows, dCols, { header, bordered }); setDialog(false); }}
                className="px-4 py-1.5 text-xs rounded bg-foreground text-background font-medium">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function buildTableHTML(rows: number, cols: number, opts: { header: boolean; bordered: boolean }) {
  const border = opts.bordered ? '1px solid hsl(var(--border))' : '0';
  let h = `<table data-rich-table="1" style="border-collapse:collapse;margin:8px 0;table-layout:fixed" contenteditable="true"><colgroup>`;
  for (let c = 0; c < cols; c++) h += `<col style="width:${Math.floor(100 / cols)}%">`;
  h += `</colgroup><tbody>`;
  for (let r = 0; r < rows; r++) {
    h += '<tr>';
    for (let c = 0; c < cols; c++) {
      const isH = r === 0 && opts.header;
      const tag = isH ? 'th' : 'td';
      const bg = isH ? 'background:hsl(var(--muted));font-weight:600;' : '';
      h += `<${tag} style="border:${border};padding:6px 8px;min-width:48px;vertical-align:top;${bg}position:relative">${isH ? `Header ${c + 1}` : '&nbsp;'}</${tag}>`;
    }
    h += '</tr>';
  }
  h += '</tbody></table><p><br></p>';
  return h;
}
