import { useState, useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, PaintBucket, Type, Plus, Wand2, Loader2, DollarSign, Percent, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROWS = 30;
const COLS = 10;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

type CellData = { raw: string; display: string };
type SheetData = Record<string, CellData>;

const parseCellRef = (ref: string): [number, number] | null => {
  const match = ref.match(/^([A-Z])(\d+)$/);
  if (!match) return null;
  return [parseInt(match[2]) - 1, match[1].charCodeAt(0) - 65];
};

const cellId = (r: number, c: number) => `${COL_LETTERS[c]}${r + 1}`;

const evaluateFormula = (formula: string, data: SheetData, visited: Set<string> = new Set()): string => {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.substring(1).toUpperCase().trim();

  // Range parser e.g. A1:A5
  const parseRange = (range: string): string[] => {
    const [start, end] = range.split(':');
    const s = parseCellRef(start);
    const e = parseCellRef(end);
    if (!s || !e) return [];
    const cells: string[] = [];
    for (let r = Math.min(s[0], e[0]); r <= Math.max(s[0], e[0]); r++) {
      for (let c = Math.min(s[1], e[1]); c <= Math.max(s[1], e[1]); c++) {
        cells.push(cellId(r, c));
      }
    }
    return cells;
  };

  const getCellValue = (id: string): number => {
    if (visited.has(id)) return 0; // circular ref
    const cell = data[id];
    if (!cell || !cell.raw) return 0;
    const v = evaluateFormula(cell.raw, data, new Set([...visited, id]));
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const getValues = (arg: string): number[] => {
    if (arg.includes(':')) return parseRange(arg).map(getCellValue);
    const ref = parseCellRef(arg);
    if (ref) return [getCellValue(arg)];
    const n = parseFloat(arg);
    return isNaN(n) ? [] : [n];
  };

  // SUM
  let m = expr.match(/^SUM\((.+)\)$/);
  if (m) { const vals = getValues(m[1]); return vals.reduce((a, b) => a + b, 0).toString(); }

  // AVERAGE
  m = expr.match(/^AVERAGE\((.+)\)$/);
  if (m) { const vals = getValues(m[1]); return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toString() : '0'; }

  // MIN
  m = expr.match(/^MIN\((.+)\)$/);
  if (m) { const vals = getValues(m[1]); return vals.length ? Math.min(...vals).toString() : '0'; }

  // MAX
  m = expr.match(/^MAX\((.+)\)$/);
  if (m) { const vals = getValues(m[1]); return vals.length ? Math.max(...vals).toString() : '0'; }

  // COUNT
  m = expr.match(/^COUNT\((.+)\)$/);
  if (m) { const vals = getValues(m[1]); return vals.length.toString(); }

  // Simple arithmetic: cell references and numbers
  try {
    let evalExpr = expr;
    // Replace cell references with values
    evalExpr = evalExpr.replace(/[A-Z]\d+/g, (ref) => {
      const parsed = parseCellRef(ref);
      if (!parsed) return '0';
      return getCellValue(ref).toString();
    });
    // Only allow safe chars
    if (/^[\d\s+\-*/().]+$/.test(evalExpr)) {
      const result = Function('"use strict"; return (' + evalExpr + ')')();
      return typeof result === 'number' && isFinite(result) ? result.toString() : '#ERROR';
    }
  } catch { /* fall through */ }

  return '#ERROR';
};

const recalcAll = (data: SheetData): SheetData => {
  const newData: SheetData = {};
  for (const [key, cell] of Object.entries(data)) {
    newData[key] = {
      raw: cell.raw,
      display: cell.raw.startsWith('=') ? evaluateFormula(cell.raw, data) : cell.raw,
    };
  }
  return newData;
};

// Initial sample data
const initData = (): SheetData => {
  const d: SheetData = {};
  const samples: [string, string][] = [
    ['A1', 'Product'], ['B1', 'Q1'], ['C1', 'Q2'], ['D1', 'Q3'], ['E1', 'Q4'], ['F1', 'Total'],
    ['A2', 'Widget A'], ['B2', '120'], ['C2', '145'], ['D2', '190'], ['E2', '210'], ['F2', '=SUM(B2:E2)'],
    ['A3', 'Widget B'], ['B3', '80'], ['C3', '95'], ['D3', '110'], ['E3', '130'], ['F3', '=SUM(B3:E3)'],
    ['A4', 'Widget C'], ['B4', '200'], ['C4', '180'], ['D4', '220'], ['E4', '250'], ['F4', '=SUM(B4:E4)'],
    ['A5', 'Total'], ['B5', '=SUM(B2:B4)'], ['C5', '=SUM(C2:C4)'], ['D5', '=SUM(D2:D4)'], ['E5', '=SUM(E2:E4)'], ['F5', '=SUM(F2:F4)'],
    ['A7', 'Average'], ['B7', '=AVERAGE(B2:B4)'], ['C7', '=AVERAGE(C2:C4)'],
  ];
  samples.forEach(([id, val]) => { d[id] = { raw: val, display: val }; });
  return recalcAll(d);
};

const SpreadsheetEditor = ({ isMobile }: { isMobile: boolean }) => {
  const [data, setData] = useState<SheetData>(initData);
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState('');
  const [activeSheet, setActiveSheet] = useState(0);
  const editRef = useRef<HTMLInputElement>(null);
  const formulaRef = useRef<HTMLInputElement>(null);

  const updateCell = useCallback((id: string, value: string) => {
    setData(prev => {
      const next = { ...prev, [id]: { raw: value, display: value } };
      return recalcAll(next);
    });
  }, []);

  const startEdit = (id: string) => {
    setEditingCell(id);
    setFormulaInput(data[id]?.raw || '');
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (editingCell) {
      updateCell(editingCell, formulaInput);
      setEditingCell(null);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    else if (e.key === 'Escape') { setEditingCell(null); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      const ref = parseCellRef(id);
      if (ref) {
        const nextC = Math.min(ref[1] + 1, COLS - 1);
        const next = cellId(ref[0], nextC);
        setSelectedCell(next);
        startEdit(next);
      }
    }
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); updateCell(selectedCell, formulaInput); }
  };

  useEffect(() => {
    setFormulaInput(data[selectedCell]?.raw || '');
  }, [selectedCell, data]);

  const toolbarButtons = [
    { icon: Undo2, label: 'Undo' }, { icon: Redo2, label: 'Redo' }, null,
    { icon: Bold, label: 'Bold' }, { icon: Italic, label: 'Italic' }, { icon: Underline, label: 'Underline' }, null,
    { icon: AlignLeft, label: 'Left' }, { icon: AlignCenter, label: 'Center' }, { icon: AlignRight, label: 'Right' }, null,
    { icon: DollarSign, label: 'Currency' }, { icon: Percent, label: 'Percent' }, { icon: Hash, label: 'Number' }, null,
    { icon: PaintBucket, label: 'Fill' }, { icon: Type, label: 'Font' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center gap-0.5 px-2 sm:px-3 overflow-x-auto flex-shrink-0 bg-surface/50">
        <select className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground mr-1 flex-shrink-0">
          <option>Arial</option><option>Calibri</option><option>Times New Roman</option><option>Courier New</option>
        </select>
        <select className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground mr-1 flex-shrink-0 w-12">
          <option>10</option><option>11</option><option>12</option><option>14</option><option>16</option>
        </select>
        {toolbarButtons.map((btn, i) =>
          btn === null
            ? <div key={i} className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
            : <button key={i} title={btn.label} className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground flex-shrink-0">
                <btn.icon className="w-3.5 h-3.5" />
              </button>
        )}
      </div>

      {/* Formula bar */}
      <div className="h-9 border-b border-border flex items-center gap-2 px-2 sm:px-3 bg-surface/30 flex-shrink-0">
        <span className="text-xs font-mono font-semibold text-accent w-10 text-center flex-shrink-0 bg-accent/10 rounded px-1 py-0.5">{selectedCell}</span>
        <div className="w-px h-5 bg-border" />
        <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">fx</span>
        <input
          ref={formulaRef}
          value={formulaInput}
          onChange={(e) => setFormulaInput(e.target.value)}
          onKeyDown={handleFormulaBarKeyDown}
          onBlur={() => updateCell(selectedCell, formulaInput)}
          className="flex-1 text-xs bg-transparent outline-none text-foreground font-mono border border-transparent focus:border-accent/30 rounded px-2 py-1"
          placeholder="Enter value or formula (e.g. =SUM(A1:A5))..."
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${COLS * 100 + 40}px` }}>
          <thead>
            <tr>
              <th className="w-10 h-7 bg-muted/50 border border-border text-[10px] text-muted-foreground font-medium sticky top-0 left-0 z-20" />
              {COL_LETTERS.map((c) => (
                <th key={c} className="h-7 bg-muted/50 border border-border text-[10px] text-muted-foreground font-medium min-w-[100px] sticky top-0 z-10">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, r) => (
              <tr key={r}>
                <td className="w-10 h-7 bg-muted/50 border border-border text-[10px] text-muted-foreground text-center font-medium sticky left-0 z-10">{r + 1}</td>
                {COL_LETTERS.map((_, c) => {
                  const id = cellId(r, c);
                  const cell = data[id];
                  const isSelected = selectedCell === id;
                  const isEditing = editingCell === id;
                  const isFormula = cell?.raw?.startsWith('=');
                  const isHeader = r === 0 && cell?.raw;
                  const isError = cell?.display === '#ERROR';

                  return (
                    <td
                      key={c}
                      onClick={() => { setSelectedCell(id); if (editingCell && editingCell !== id) commitEdit(); }}
                      onDoubleClick={() => startEdit(id)}
                      className={cn(
                        "h-7 border border-border text-xs px-2 cursor-cell relative",
                        isSelected && !isEditing && "ring-2 ring-accent ring-inset bg-accent/5",
                        isEditing && "ring-2 ring-accent ring-inset p-0",
                        isHeader && "font-semibold bg-muted/30",
                        isError && "text-red-500",
                        isFormula && !isError && !isEditing && "text-foreground",
                        !isSelected && !isEditing && "hover:bg-muted/20"
                      )}
                    >
                      {isEditing ? (
                        <input
                          ref={editRef}
                          value={formulaInput}
                          onChange={(e) => setFormulaInput(e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, id)}
                          onBlur={commitEdit}
                          className="w-full h-full text-xs font-mono bg-background outline-none px-2"
                        />
                      ) : (
                        <span className="block truncate">{cell?.display || ''}</span>
                      )}
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
        {['Sheet 1', 'Sheet 2', 'Sheet 3'].map((name, i) => (
          <button
            key={i}
            onClick={() => setActiveSheet(i)}
            className={cn("px-3 py-1 rounded text-[10px] font-medium", activeSheet === i ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:bg-surface-hover")}
          >{name}</button>
        ))}
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Plus className="w-3 h-3" /></button>
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to create formulas, analyze data, generate charts..." onGenerate={() => {}} />
      </div>
    </div>
  );
};

// Inline AI prompt (same as OfficeEditor)
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

export default SpreadsheetEditor;
