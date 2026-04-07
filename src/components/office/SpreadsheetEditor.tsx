import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2,
  PaintBucket, Type, Plus, Wand2, Loader2, DollarSign, Percent, Hash,
  BarChart3, LineChart, PieChart, X, Mic, Filter, SortAsc, SortDesc,
  Merge, Grid3x3, Trash2, Copy, Scissors, ClipboardPaste, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ROWS = 50;
const COLS = 15;
const COL_LETTERS = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

type CellData = { raw: string; display: string; format?: string; bold?: boolean; italic?: boolean; align?: string; bg?: string; color?: string };
type SheetData = Record<string, CellData>;
type ChartConfig = { type: 'bar' | 'line' | 'pie'; title: string; data: { name: string; value: number }[]; };

const parseCellRef = (ref: string): [number, number] | null => {
  const match = ref.match(/^([A-Z])(\d+)$/);
  if (!match) return null;
  return [parseInt(match[2]) - 1, match[1].charCodeAt(0) - 65];
};

const cellId = (r: number, c: number) => `${COL_LETTERS[c]}${r + 1}`;

const evaluateFormula = (formula: string, data: SheetData, visited: Set<string> = new Set()): string => {
  if (!formula.startsWith('=')) return formula;
  const expr = formula.substring(1).toUpperCase().trim();

  const parseRange = (range: string): string[] => {
    const [start, end] = range.split(':');
    const s = parseCellRef(start);
    const e = parseCellRef(end);
    if (!s || !e) return [];
    const cells: string[] = [];
    for (let r = Math.min(s[0], e[0]); r <= Math.max(s[0], e[0]); r++)
      for (let c = Math.min(s[1], e[1]); c <= Math.max(s[1], e[1]); c++)
        cells.push(cellId(r, c));
    return cells;
  };

  const getCellValue = (id: string): number => {
    if (visited.has(id)) return 0;
    const cell = data[id];
    if (!cell || !cell.raw) return 0;
    const v = evaluateFormula(cell.raw, data, new Set([...visited, id]));
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const getValues = (arg: string): number[] => {
    const parts = arg.split(',').map(s => s.trim());
    const vals: number[] = [];
    for (const p of parts) {
      if (p.includes(':')) vals.push(...parseRange(p).map(getCellValue));
      else {
        const ref = parseCellRef(p);
        if (ref) vals.push(getCellValue(p));
        else { const n = parseFloat(p); if (!isNaN(n)) vals.push(n); }
      }
    }
    return vals;
  };

  const fnMatch = expr.match(/^(\w+)\((.+)\)$/);
  if (fnMatch) {
    const [, fn, args] = fnMatch;
    const vals = getValues(args);
    switch (fn) {
      case 'SUM': return vals.reduce((a, b) => a + b, 0).toString();
      case 'AVERAGE': return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toString() : '0';
      case 'MIN': return vals.length ? Math.min(...vals).toString() : '0';
      case 'MAX': return vals.length ? Math.max(...vals).toString() : '0';
      case 'COUNT': return vals.length.toString();
      case 'ABS': return vals.length ? Math.abs(vals[0]).toString() : '0';
      case 'ROUND': return vals.length >= 1 ? (vals.length >= 2 ? vals[0].toFixed(vals[1]) : Math.round(vals[0]).toString()) : '0';
      case 'IF': {
        const argParts = args.split(',').map(s => s.trim());
        if (argParts.length >= 3) {
          const cond = getCellValue(argParts[0]);
          return cond ? argParts[1] : argParts[2];
        }
        return '#ERROR';
      }
    }
  }

  try {
    let evalExpr = expr;
    evalExpr = evalExpr.replace(/[A-Z]\d+/g, (ref) => {
      parseCellRef(ref);
      return getCellValue(ref).toString();
    });
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
      ...cell,
      display: cell.raw.startsWith('=') ? evaluateFormula(cell.raw, data) : cell.raw,
    };
  }
  return newData;
};

const formatDisplay = (cell: CellData): string => {
  if (!cell?.display) return '';
  const num = parseFloat(cell.display);
  if (isNaN(num)) return cell.display;
  switch (cell.format) {
    case 'currency': return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent': return `${(num * 100).toFixed(1)}%`;
    case 'number': return num.toLocaleString();
    default: return cell.display;
  }
};

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

const CHART_COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 67%, 55%)', 'hsl(190, 80%, 45%)'];

const SpreadsheetEditor = ({ isMobile }: { isMobile: boolean }) => {
  const [data, setData] = useState<SheetData>(initData);
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState('');
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheets, setSheets] = useState(['Sheet 1', 'Sheet 2', 'Sheet 3']);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [showVoice, setShowVoice] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const formulaRef = useRef<HTMLInputElement>(null);

  const updateCell = useCallback((id: string, value: string) => {
    setData(prev => {
      const next = { ...prev, [id]: { ...prev[id], raw: value, display: value } };
      return recalcAll(next);
    });
  }, []);

  const setCellFormat = useCallback((format: string) => {
    setData(prev => {
      const cell = prev[selectedCell] || { raw: '', display: '' };
      const next = { ...prev, [selectedCell]: { ...cell, format } };
      return recalcAll(next);
    });
  }, [selectedCell]);

  const setCellStyle = useCallback((key: 'bold' | 'italic' | 'align', value: any) => {
    setData(prev => {
      const cell = prev[selectedCell] || { raw: '', display: '' };
      const next = { ...prev, [selectedCell]: { ...cell, [key]: key === 'bold' || key === 'italic' ? !cell[key] : value } };
      return next;
    });
  }, [selectedCell]);

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
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); const ref = parseCellRef(id); if (ref) { const next = cellId(Math.min(ref[0] + 1, ROWS - 1), ref[1]); setSelectedCell(next); } }
    else if (e.key === 'Escape') { setEditingCell(null); }
    else if (e.key === 'Tab') {
      e.preventDefault(); commitEdit();
      const ref = parseCellRef(id);
      if (ref) { const next = cellId(ref[0], Math.min(ref[1] + 1, COLS - 1)); setSelectedCell(next); startEdit(next); }
    }
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); updateCell(selectedCell, formulaInput); }
  };

  useEffect(() => { setFormulaInput(data[selectedCell]?.raw || ''); }, [selectedCell, data]);

  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    if (editingCell) return;
    const ref = parseCellRef(selectedCell);
    if (!ref) return;
    let [r, c] = ref;
    switch (e.key) {
      case 'ArrowUp': r = Math.max(0, r - 1); break;
      case 'ArrowDown': r = Math.min(ROWS - 1, r + 1); break;
      case 'ArrowLeft': c = Math.max(0, c - 1); break;
      case 'ArrowRight': c = Math.min(COLS - 1, c + 1); break;
      case 'Enter': startEdit(selectedCell); e.preventDefault(); return;
      case 'Delete': case 'Backspace': updateCell(selectedCell, ''); return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { startEdit(selectedCell); setFormulaInput(e.key); e.preventDefault(); }
        return;
    }
    e.preventDefault();
    setSelectedCell(cellId(r, c));
  }, [selectedCell, editingCell, updateCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  const generateChart = (type: 'bar' | 'line' | 'pie') => {
    // Build chart data from column A (labels) and B (values) rows 2-4
    const chartData: { name: string; value: number }[] = [];
    for (let r = 1; r <= 4; r++) {
      const label = data[cellId(r, 0)]?.display || `Row ${r + 1}`;
      const val = parseFloat(data[cellId(r, 1)]?.display || '0');
      if (!isNaN(val) && val !== 0) chartData.push({ name: label, value: val });
    }
    if (chartData.length === 0) {
      chartData.push({ name: 'No Data', value: 0 });
    }
    setCharts(prev => [...prev, { type, title: `Chart ${prev.length + 1}`, data: chartData }]);
    setShowChartMenu(false);
  };

  const removeChart = (idx: number) => setCharts(prev => prev.filter((_, i) => i !== idx));

  const addSheet = () => {
    setSheets(prev => [...prev, `Sheet ${prev.length + 1}`]);
    setActiveSheet(sheets.length);
  };

  const cell = data[selectedCell];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="h-10 border-b border-border flex items-center gap-0.5 px-2 sm:px-3 overflow-x-auto flex-shrink-0 bg-surface/50">
        <select className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground mr-1 flex-shrink-0 w-20">
          <option>Arial</option><option>Calibri</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option>
        </select>
        <select className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground mr-1 flex-shrink-0 w-12">
          <option>10</option><option>11</option><option>12</option><option>14</option><option>16</option><option>18</option><option>24</option>
        </select>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button onClick={() => setCellStyle('bold', null)} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.bold ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Bold"><Bold className="w-3.5 h-3.5" /></button>
        <button onClick={() => setCellStyle('italic', null)} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.italic ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Italic"><Italic className="w-3.5 h-3.5" /></button>
        <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button onClick={() => setCellStyle('align', 'left')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.align === 'left' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")}><AlignLeft className="w-3.5 h-3.5" /></button>
        <button onClick={() => setCellStyle('align', 'center')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.align === 'center' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")}><AlignCenter className="w-3.5 h-3.5" /></button>
        <button onClick={() => setCellStyle('align', 'right')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.align === 'right' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")}><AlignRight className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button onClick={() => setCellFormat('currency')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.format === 'currency' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Currency"><DollarSign className="w-3.5 h-3.5" /></button>
        <button onClick={() => setCellFormat('percent')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.format === 'percent' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Percent"><Percent className="w-3.5 h-3.5" /></button>
        <button onClick={() => setCellFormat('number')} className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0", cell?.format === 'number' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Number"><Hash className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-0.5" />
        {/* Chart button */}
        <div className="relative">
          <button onClick={() => setShowChartMenu(!showChartMenu)} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0" title="Insert Chart">
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          {showChartMenu && (
            <div className="absolute top-8 left-0 bg-card border border-border rounded-lg shadow-xl z-30 p-1 w-36">
              <button onClick={() => generateChart('bar')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-surface-hover text-foreground">
                <BarChart3 className="w-3.5 h-3.5 text-accent" /> Bar Chart
              </button>
              <button onClick={() => generateChart('line')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-surface-hover text-foreground">
                <LineChart className="w-3.5 h-3.5 text-green-500" /> Line Chart
              </button>
              <button onClick={() => generateChart('pie')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-surface-hover text-foreground">
                <PieChart className="w-3.5 h-3.5 text-orange-500" /> Pie Chart
              </button>
            </div>
          )}
        </div>
        <div className="w-px h-5 bg-border mx-0.5" />
        <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0" title="Sort Asc"><SortAsc className="w-3.5 h-3.5" /></button>
        <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0" title="Sort Desc"><SortDesc className="w-3.5 h-3.5" /></button>
        <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0" title="Filter"><Filter className="w-3.5 h-3.5" /></button>
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

      {/* Grid + Charts */}
      <div className="flex-1 overflow-auto">
        {/* Charts */}
        {charts.length > 0 && (
          <div className="p-3 space-y-3 border-b border-border bg-surface/20">
            <div className={cn("grid gap-3", charts.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
              {charts.map((chart, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-foreground">{chart.title}</h4>
                    <button onClick={() => removeChart(idx)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'bar' ? (
                        <BarChart data={chart.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chart.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      ) : chart.type === 'line' ? (
                        <ReLineChart data={chart.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                          <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                        </ReLineChart>
                      ) : (
                        <RePieChart>
                          <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'hsl(var(--muted-foreground))' }} fontSize={10}>
                            {chart.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                        </RePieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <table className="w-full border-collapse" style={{ minWidth: `${COLS * 90 + 40}px` }}>
          <thead>
            <tr>
              <th className="w-10 h-7 bg-muted/50 border border-border text-[10px] text-muted-foreground font-medium sticky top-0 left-0 z-20" />
              {COL_LETTERS.map((c) => (
                <th key={c} className="h-7 bg-muted/50 border border-border text-[10px] text-muted-foreground font-medium min-w-[90px] sticky top-0 z-10">{c}</th>
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
                        !isSelected && !isEditing && "hover:bg-muted/20"
                      )}
                      style={{ textAlign: (cell?.align as any) || (isHeader ? 'center' : 'left'), fontWeight: cell?.bold ? 700 : undefined, fontStyle: cell?.italic ? 'italic' : undefined }}
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
                        <span className="block truncate">{formatDisplay(cell) || ''}</span>
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
        {sheets.map((name, i) => (
          <button key={i} onClick={() => setActiveSheet(i)}
            className={cn("px-3 py-1 rounded text-[10px] font-medium", activeSheet === i ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:bg-surface-hover")}
          >{name}</button>
        ))}
        <button onClick={addSheet} className="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Plus className="w-3 h-3" /></button>
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to create formulas, analyze data, generate charts..." onGenerate={() => {}} />
      </div>

      {/* Floating voice */}
      <button
        onClick={() => setShowVoice(!showVoice)}
        className={cn(
          "fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 transition-all",
          showVoice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105"
        )}
      >
        <Mic className="w-5 h-5" />
      </button>
      {showVoice && (
        <div className="fixed bottom-40 right-6 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">Listening...</span>
          </div>
          <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 bg-accent/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Speak to enter data or formulas</p>
        </div>
      )}
    </div>
  );
};

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
          {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
        </button>
      </div>
    </div>
  );
};

export default SpreadsheetEditor;
