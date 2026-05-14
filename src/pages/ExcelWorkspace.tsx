import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FileSpreadsheet, Cloud, CloudOff, Save, Share2, Search, Undo2, Redo2,
  Printer, Download, FilePlus, FolderOpen, FileDown, Home, X, Sparkles, Loader2, Send,
  Plus, Trash2, ChevronDown, PanelRight, PanelRightClose, Menu as MenuIcon, Sun, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import ExcelRibbon, { ExcelTab } from '@/components/office/ExcelRibbon';

// ============ Types ============
interface CellFormat {
  bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  fontFamily?: string; fontSize?: number;
  color?: string; bg?: string;
  numberFormat?: 'general' | 'number' | 'currency' | 'percent' | 'date' | 'time' | 'text';
  wrap?: boolean;
}
interface Cell { v: string; f?: CellFormat }
interface Sheet { id: string; name: string; cells: Record<string, Cell>; color?: string }

const NUM_COLS = 52; // A..AZ
const NUM_ROWS = 200;
const COL_WIDTH = 96;
const ROW_HEIGHT = 24;
const HEADER_H = 24;
const HEADER_W = 44;

// ============ Helpers ============
function colName(idx: number): string {
  let s = ''; let n = idx;
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
}
function colIndex(name: string): number {
  let n = 0; for (const c of name.toUpperCase()) n = n * 26 + (c.charCodeAt(0) - 64); return n - 1;
}
function cellId(r: number, c: number): string { return `${colName(c)}${r + 1}`; }
function parseRef(ref: string): { r: number; c: number } | null {
  const m = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!m) return null;
  return { c: colIndex(m[1]), r: parseInt(m[2]) - 1 };
}

// ============ Formula Engine ============
const FUNCS: Record<string, (args: any[]) => any> = {
  SUM: (a) => flat(a).reduce((s, v) => s + numify(v), 0),
  AVERAGE: (a) => { const f = flat(a).map(numify).filter(v => !isNaN(v)); return f.length ? f.reduce((s, v) => s + v, 0) / f.length : 0; },
  MIN: (a) => Math.min(...flat(a).map(numify).filter(v => !isNaN(v))),
  MAX: (a) => Math.max(...flat(a).map(numify).filter(v => !isNaN(v))),
  COUNT: (a) => flat(a).filter(v => !isNaN(numify(v)) && v !== '' && v != null).length,
  COUNTA: (a) => flat(a).filter(v => v !== '' && v != null).length,
  IF: ([c, t, f]) => (truthy(c) ? t : f ?? false),
  IFS: (a) => { for (let i = 0; i < a.length; i += 2) if (truthy(a[i])) return a[i+1]; return '#N/A'; },
  COUNTIF: ([range, crit]) => flat([range]).filter(v => matchCrit(v, crit)).length,
  SUMIF: ([range, crit, sumRange]) => {
    const r = flat([range]); const sr = sumRange ? flat([sumRange]) : r;
    return r.reduce((s, v, i) => matchCrit(v, crit) ? s + numify(sr[i]) : s, 0);
  },
  CONCAT: (a) => flat(a).map(v => v == null ? '' : String(v)).join(''),
  CONCATENATE: (a) => flat(a).map(v => v == null ? '' : String(v)).join(''),
  TEXT: ([v, fmt]) => String(v),
  LEFT: ([s, n]) => String(s ?? '').slice(0, n ?? 1),
  RIGHT: ([s, n]) => { const x = String(s ?? ''); return x.slice(x.length - (n ?? 1)); },
  MID: ([s, st, n]) => String(s ?? '').slice((st ?? 1) - 1, (st ?? 1) - 1 + (n ?? 0)),
  LEN: ([s]) => String(s ?? '').length,
  UPPER: ([s]) => String(s ?? '').toUpperCase(),
  LOWER: ([s]) => String(s ?? '').toLowerCase(),
  TRIM: ([s]) => String(s ?? '').trim(),
  TODAY: () => new Date().toLocaleDateString(),
  NOW: () => new Date().toLocaleString(),
  RAND: () => Math.random(),
  RANDBETWEEN: ([a, b]) => Math.floor(Math.random() * (b - a + 1)) + a,
  ROUND: ([v, n]) => { const m = Math.pow(10, n ?? 0); return Math.round(numify(v) * m) / m; },
  ABS: ([v]) => Math.abs(numify(v)),
  POWER: ([a, b]) => Math.pow(numify(a), numify(b)),
  SQRT: ([v]) => Math.sqrt(numify(v)),
  PI: () => Math.PI,
  VLOOKUP: ([key, range, col, exact]) => {
    const grid = range as any[][]; if (!Array.isArray(grid)) return '#N/A';
    for (const row of grid) if (String(row[0]) === String(key)) return row[(col ?? 1) - 1];
    return '#N/A';
  },
  HLOOKUP: ([key, range, row]) => {
    const grid = range as any[][]; if (!Array.isArray(grid) || !grid[0]) return '#N/A';
    for (let i = 0; i < grid[0].length; i++) if (String(grid[0][i]) === String(key)) return grid[(row ?? 1) - 1]?.[i];
    return '#N/A';
  },
  XLOOKUP: ([key, lookup, ret]) => {
    const l = flat([lookup]); const r = flat([ret]);
    for (let i = 0; i < l.length; i++) if (String(l[i]) === String(key)) return r[i];
    return '#N/A';
  },
  INDEX: ([range, r, c]) => { const g = range as any[][]; return g?.[(r ?? 1) - 1]?.[(c ?? 1) - 1] ?? '#REF!'; },
  MATCH: ([key, range]) => { const a = flat([range]); const i = a.findIndex(v => String(v) === String(key)); return i >= 0 ? i + 1 : '#N/A'; },
};

function flat(a: any[]): any[] { const out: any[] = []; const walk = (x: any) => Array.isArray(x) ? x.forEach(walk) : out.push(x); a.forEach(walk); return out; }
function numify(v: any): number { if (v == null || v === '') return 0; const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function truthy(v: any): boolean { if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; if (v == null || v === '' || v === false) return false; if (v === 'FALSE' || v === 'false') return false; return true; }
function matchCrit(v: any, crit: any): boolean {
  const c = String(crit);
  const m = c.match(/^(>=|<=|<>|>|<|=)?(.*)$/);
  const op = m?.[1] || '='; const val = m?.[2] ?? '';
  const vn = parseFloat(v); const cn = parseFloat(val);
  if (!isNaN(vn) && !isNaN(cn)) {
    switch (op) { case '>': return vn > cn; case '<': return vn < cn; case '>=': return vn >= cn; case '<=': return vn <= cn; case '<>': return vn !== cn; default: return vn === cn; }
  }
  return op === '<>' ? String(v) !== val : String(v) === val;
}

// Tokenize + parse + evaluate
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }
    if ('()+-*/^,&%:'.includes(ch)) { tokens.push(ch); i++; continue; }
    if (ch === '"') {
      let j = i + 1; let s = '';
      while (j < expr.length && expr[j] !== '"') { s += expr[j]; j++; }
      tokens.push('"' + s + '"'); i = j + 1; continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i; while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j)); i = j; continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i; while (j < expr.length && /[A-Za-z0-9_$]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j)); i = j; continue;
    }
    i++;
  }
  return tokens;
}

class Parser {
  tokens: string[]; pos = 0; resolve: (ref: string) => any; resolveRange: (a: string, b: string) => any[][];
  constructor(tokens: string[], resolve: any, resolveRange: any) { this.tokens = tokens; this.resolve = resolve; this.resolveRange = resolveRange; }
  peek() { return this.tokens[this.pos]; }
  next() { return this.tokens[this.pos++]; }
  parse(): any { const v = this.parseExpr(); return v; }
  parseExpr() { return this.parseCompare(); }
  parseCompare() {
    let left = this.parseAdd();
    while (['=','<','>','<=','>=','<>'].includes(this.peek())) {
      const op = this.next(); const right = this.parseAdd();
      switch (op) { case '=': left = left == right; break; case '<': left = numify(left) < numify(right); break; case '>': left = numify(left) > numify(right); break; case '<=': left = numify(left) <= numify(right); break; case '>=': left = numify(left) >= numify(right); break; case '<>': left = left != right; break; }
    }
    return left;
  }
  parseAdd() {
    let left = this.parseMul();
    while (['+','-','&'].includes(this.peek())) {
      const op = this.next(); const right = this.parseMul();
      if (op === '+') left = numify(left) + numify(right);
      else if (op === '-') left = numify(left) - numify(right);
      else left = String(left ?? '') + String(right ?? '');
    }
    return left;
  }
  parseMul() {
    let left = this.parsePow();
    while (['*','/'].includes(this.peek())) {
      const op = this.next(); const right = this.parsePow();
      if (op === '*') left = numify(left) * numify(right);
      else { const r = numify(right); left = r === 0 ? '#DIV/0!' : numify(left) / r; }
    }
    return left;
  }
  parsePow() {
    let left = this.parseUnary();
    while (this.peek() === '^') { this.next(); const right = this.parseUnary(); left = Math.pow(numify(left), numify(right)); }
    return left;
  }
  parseUnary(): any {
    if (this.peek() === '-') { this.next(); return -numify(this.parseUnary()); }
    if (this.peek() === '+') { this.next(); return this.parseUnary(); }
    return this.parsePostfix();
  }
  parsePostfix() {
    let v = this.parsePrimary();
    if (this.peek() === '%') { this.next(); v = numify(v) / 100; }
    return v;
  }
  parsePrimary(): any {
    const t = this.next();
    if (t === '(') { const v = this.parseExpr(); if (this.peek() === ')') this.next(); return v; }
    if (t?.startsWith('"')) return t.slice(1, -1);
    if (!isNaN(parseFloat(t))) return parseFloat(t);
    if (t === 'TRUE') return true; if (t === 'FALSE') return false;
    if (this.peek() === '(') {
      this.next();
      const args: any[] = [];
      if (this.peek() !== ')') {
        args.push(this.parseExpr());
        while (this.peek() === ',') { this.next(); args.push(this.parseExpr()); }
      }
      if (this.peek() === ')') this.next();
      const fn = FUNCS[t.toUpperCase()];
      return fn ? fn(args) : `#NAME?`;
    }
    // cell ref or range
    if (this.peek() === ':') {
      this.next(); const end = this.next();
      return this.resolveRange(t, end);
    }
    return this.resolve(t);
  }
}

function evalFormula(expr: string, getCell: (ref: string) => any, depth = new Set<string>()): any {
  try {
    const resolve = (ref: string) => {
      const r = ref.replace(/\$/g, '').toUpperCase();
      if (parseRef(r)) {
        if (depth.has(r)) return '#CIRC!';
        return getCell(r);
      }
      return ref;
    };
    const resolveRange = (a: string, b: string) => {
      const A = parseRef(a.replace(/\$/g, '')); const B = parseRef(b.replace(/\$/g, ''));
      if (!A || !B) return [];
      const r1 = Math.min(A.r, B.r), r2 = Math.max(A.r, B.r);
      const c1 = Math.min(A.c, B.c), c2 = Math.max(A.c, B.c);
      const grid: any[][] = [];
      for (let r = r1; r <= r2; r++) { const row: any[] = []; for (let c = c1; c <= c2; c++) row.push(getCell(cellId(r, c))); grid.push(row); }
      return grid;
    };
    const tokens = tokenize(expr);
    return new Parser(tokens, resolve, resolveRange).parse();
  } catch (e) { return '#ERROR!'; }
}

// ============ Templates ============
const templates: Record<string, { name: string; data: Array<Array<string>> }> = {
  blank: { name: 'Untitled Workbook', data: [] },
  budget: { name: 'Monthly Budget', data: [
    ['Category', 'Budgeted', 'Actual', 'Difference'],
    ['Income', '5000', '5200', '=C2-B2'],
    ['Rent', '1500', '1500', '=C3-B3'],
    ['Groceries', '600', '720', '=C4-B4'],
    ['Utilities', '200', '180', '=C5-B5'],
    ['Transport', '300', '350', '=C6-B6'],
    ['Entertainment', '200', '275', '=C7-B7'],
    ['Savings', '800', '600', '=C8-B8'],
    ['', '', '', ''],
    ['Total Expenses', '=SUM(B3:B8)', '=SUM(C3:C8)', '=C10-B10'],
    ['Net', '=B2-B10', '=C2-C10', ''],
  ]},
  invoice: { name: 'Invoice', data: [
    ['INVOICE', '', '', ''],
    ['Bill To:', 'Client Name', 'Date:', new Date().toLocaleDateString()],
    ['', '', 'Invoice #:', 'INV-001'],
    ['', '', '', ''],
    ['Description', 'Qty', 'Rate', 'Amount'],
    ['Service A', '10', '120', '=B6*C6'],
    ['Service B', '5', '200', '=B7*C7'],
    ['Service C', '2', '450', '=B8*C8'],
    ['', '', '', ''],
    ['', '', 'Subtotal', '=SUM(D6:D8)'],
    ['', '', 'Tax (10%)', '=D10*0.1'],
    ['', '', 'Total', '=D10+D11'],
  ]},
  'expense-report': { name: 'Expense Report', data: [
    ['Date', 'Category', 'Description', 'Amount'],
    ['2025-05-01', 'Travel', 'Flight to NYC', '450'],
    ['2025-05-02', 'Meals', 'Client dinner', '120'],
    ['2025-05-03', 'Lodging', 'Hotel 2 nights', '380'],
    ['2025-05-04', 'Transport', 'Taxi', '65'],
    ['', '', 'Total', '=SUM(D2:D5)'],
  ]},
  'project-tracker': { name: 'Project Tracker', data: [
    ['Task', 'Owner', 'Status', 'Due Date', 'Progress'],
    ['Design wireframes', 'Alice', 'Done', '2025-05-10', '100'],
    ['Build prototype', 'Bob', 'In Progress', '2025-05-20', '60'],
    ['User testing', 'Carol', 'Not Started', '2025-05-30', '0'],
    ['Launch', 'Team', 'Not Started', '2025-06-15', '0'],
    ['', '', '', 'Avg', '=AVERAGE(E2:E5)'],
  ]},
  gradebook: { name: 'Grade Book', data: [
    ['Student', 'Test 1', 'Test 2', 'Test 3', 'Average'],
    ['Alice', '88', '92', '85', '=AVERAGE(B2:D2)'],
    ['Bob', '75', '80', '78', '=AVERAGE(B3:D3)'],
    ['Carol', '95', '98', '92', '=AVERAGE(B4:D4)'],
    ['David', '70', '72', '68', '=AVERAGE(B5:D5)'],
    ['Class Avg', '=AVERAGE(B2:B5)', '=AVERAGE(C2:C5)', '=AVERAGE(D2:D5)', '=AVERAGE(E2:E5)'],
  ]},
  attendance: { name: 'Attendance', data: [
    ['Student', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'],
    ['Alice', '1', '1', '1', '0', '1', '=SUM(B2:F2)'],
    ['Bob', '1', '0', '1', '1', '1', '=SUM(B3:F3)'],
    ['Carol', '1', '1', '1', '1', '1', '=SUM(B4:F4)'],
  ]},
  'sales-dashboard': { name: 'Sales Dashboard', data: [
    ['Product', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
    ['Widget A', '12000', '15000', '18000', '22000', '=SUM(B2:E2)'],
    ['Widget B', '8000', '9500', '11000', '13500', '=SUM(B3:E3)'],
    ['Widget C', '5000', '6200', '7800', '9500', '=SUM(B4:E4)'],
    ['Total', '=SUM(B2:B4)', '=SUM(C2:C4)', '=SUM(D2:D4)', '=SUM(E2:E4)', '=SUM(F2:F4)'],
  ]},
  calendar: { name: 'Calendar', data: [
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ['', '1', '2', '3', '4', '5', '6'],
    ['7', '8', '9', '10', '11', '12', '13'],
    ['14', '15', '16', '17', '18', '19', '20'],
    ['21', '22', '23', '24', '25', '26', '27'],
    ['28', '29', '30', '31', '', '', ''],
  ]},
  inventory: { name: 'Inventory', data: [
    ['SKU', 'Product', 'Qty', 'Reorder At', 'Status'],
    ['A001', 'Widget A', '120', '50', '=IF(C2<=D2,"Reorder","OK")'],
    ['A002', 'Widget B', '30', '50', '=IF(C3<=D3,"Reorder","OK")'],
    ['A003', 'Widget C', '85', '40', '=IF(C4<=D4,"Reorder","OK")'],
  ]},
  shopping: { name: 'Shopping List', data: [
    ['Item', 'Qty', 'Price', 'Total'],
    ['Milk', '2', '4.50', '=B2*C2'],
    ['Bread', '1', '3.20', '=B3*C3'],
    ['Eggs', '1', '5.00', '=B4*C4'],
    ['', '', 'Total', '=SUM(D2:D4)'],
  ]},
  savings: { name: 'Savings Goal', data: [
    ['Month', 'Saved', 'Goal', 'Progress'],
    ['Jan', '500', '5000', '=B2/C2'],
    ['Feb', '1100', '5000', '=B3/C3'],
    ['Mar', '1750', '5000', '=B4/C4'],
    ['Apr', '2500', '5000', '=B5/C5'],
  ]},
};

function buildSheetFromTemplate(tpl: keyof typeof templates): Sheet {
  const t = templates[tpl] || templates.blank;
  const cells: Record<string, Cell> = {};
  t.data.forEach((row, r) => row.forEach((v, c) => { if (v !== '') cells[cellId(r, c)] = { v }; }));
  // Header bold
  if (t.data[0]) t.data[0].forEach((_, c) => { const id = cellId(0, c); cells[id] = { ...(cells[id] || { v: '' }), f: { ...(cells[id]?.f || {}), bold: true, bg: '#f3f4f6' } }; });
  return { id: 's1', name: 'Sheet1', cells };
}

// ============ Main Component ============
export default function ExcelWorkspace() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const tpl = (searchParams.get('template') || 'blank') as keyof typeof templates;
  const initialPrompt = searchParams.get('prompt') || '';

  const [docName, setDocName] = useState(templates[tpl]?.name || 'Untitled Workbook');
  const [editingName, setEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<ExcelTab>('home');
  const [fileMenu, setFileMenu] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(initialPrompt);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  const [sheets, setSheets] = useState<Sheet[]>(() => [buildSheetFromTemplate(tpl)]);
  const [activeSheetId, setActiveSheetId] = useState('s1');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);

  const [sel, setSel] = useState<{ s: { r: number; c: number }; e: { r: number; c: number } }>({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } });
  const [editing, setEditing] = useState<{ r: number; c: number; v: string } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);

  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ active: boolean }>({ active: false });
  const fileMenuRef = useRef<HTMLDivElement>(null);

  const activeSheet = sheets.find(s => s.id === activeSheetId)!;
  const cells = activeSheet.cells;
  const setCells = (updater: (prev: Record<string, Cell>) => Record<string, Cell>) => {
    setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: updater(s.cells) } : s));
    markUnsaved();
  };

  const markUnsaved = useCallback(() => {
    setSaveStatus('unsaved');
  }, []);

  useEffect(() => {
    if (saveStatus !== 'unsaved') return;
    const t = setTimeout(() => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 600); }, 1500);
    return () => clearTimeout(t);
  }, [saveStatus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) setFileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Resolve cell value (with formula evaluation, basic memo per render)
  const resolveCell = useCallback((ref: string): any => {
    const p = parseRef(ref); if (!p) return '';
    const c = cells[ref]; if (!c) return '';
    if (typeof c.v === 'string' && c.v.startsWith('=')) {
      return evalFormula(c.v.slice(1), resolveCell);
    }
    const n = parseFloat(c.v);
    return isNaN(n) || c.v === '' ? c.v : n;
  }, [cells]);

  const displayValue = (r: number, c: number): string => {
    const id = cellId(r, c); const cell = cells[id];
    if (!cell || cell.v === '') return '';
    let val: any = cell.v;
    if (typeof val === 'string' && val.startsWith('=')) {
      val = evalFormula(val.slice(1), resolveCell);
    }
    const fmt = cell.f?.numberFormat;
    if (fmt && typeof val !== 'string') {
      const n = numify(val);
      if (fmt === 'currency') return '$' + n.toFixed(2);
      if (fmt === 'percent') return (n * 100).toFixed(1) + '%';
      if (fmt === 'number') return n.toLocaleString();
    } else if (fmt === 'currency') {
      const n = numify(val); if (!isNaN(n) && val !== '') return '$' + n.toFixed(2);
    } else if (fmt === 'percent') {
      const n = numify(val); if (!isNaN(n) && val !== '') return (n * 100).toFixed(1) + '%';
    }
    return String(val);
  };

  // Selection helpers
  const selBox = useMemo(() => ({
    r1: Math.min(sel.s.r, sel.e.r), r2: Math.max(sel.s.r, sel.e.r),
    c1: Math.min(sel.s.c, sel.e.c), c2: Math.max(sel.s.c, sel.e.c),
  }), [sel]);

  const inSel = (r: number, c: number) => r >= selBox.r1 && r <= selBox.r2 && c >= selBox.c1 && c <= selBox.c2;
  const isAnchor = (r: number, c: number) => r === sel.s.r && c === sel.s.c;

  const anchorFmt = cells[cellId(sel.s.r, sel.s.c)]?.f || {};

  // Stats
  const stats = useMemo(() => {
    let sum = 0, count = 0, num = 0;
    for (let r = selBox.r1; r <= selBox.r2; r++) for (let c = selBox.c1; c <= selBox.c2; c++) {
      const v = displayValue(r, c);
      if (v !== '') { count++; const n = parseFloat(v); if (!isNaN(n)) { sum += n; num++; } }
    }
    return { sum, count, avg: num ? sum / num : 0, num };
  }, [selBox, cells]);

  // Cell input
  const beginEdit = (r: number, c: number, initial?: string) => {
    const id = cellId(r, c);
    setEditing({ r, c, v: initial !== undefined ? initial : (cells[id]?.v || '') });
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const commitEdit = (move?: 'down' | 'right' | 'up' | 'left') => {
    if (!editing) return;
    const { r, c, v } = editing;
    const id = cellId(r, c);
    setCells(prev => { const next = { ...prev }; if (v === '') { delete next[id]; } else { next[id] = { ...(prev[id] || { v: '' }), v }; } return next; });
    setEditing(null);
    if (move === 'down') setSel({ s: { r: Math.min(r + 1, NUM_ROWS - 1), c }, e: { r: Math.min(r + 1, NUM_ROWS - 1), c } });
    if (move === 'right') setSel({ s: { r, c: Math.min(c + 1, NUM_COLS - 1) }, e: { r, c: Math.min(c + 1, NUM_COLS - 1) } });
  };

  const cancelEdit = () => setEditing(null);

  // Apply format to selection
  const applyFmt = (patch: Partial<CellFormat>) => {
    setCells(prev => {
      const next = { ...prev };
      for (let r = selBox.r1; r <= selBox.r2; r++) for (let c = selBox.c1; c <= selBox.c2; c++) {
        const id = cellId(r, c);
        const cur = next[id] || { v: '' };
        next[id] = { ...cur, f: { ...(cur.f || {}), ...patch } };
      }
      return next;
    });
  };

  const handleAction = (action: string, value?: any) => {
    switch (action) {
      case 'toggle': applyFmt({ [value]: !anchorFmt[value as keyof CellFormat] } as any); break;
      case 'align': applyFmt({ align: value }); break;
      case 'valign': applyFmt({ valign: value }); break;
      case 'color': applyFmt({ color: value }); break;
      case 'bg': applyFmt({ bg: value }); break;
      case 'fontFamily': applyFmt({ fontFamily: value }); break;
      case 'fontSize': applyFmt({ fontSize: value }); break;
      case 'numberFormat': applyFmt({ numberFormat: value }); break;
      case 'autosum': {
        const r = sel.s.r, c = sel.s.c;
        // sum column above
        let r1 = r - 1; while (r1 >= 0 && cells[cellId(r1, c)]?.v) r1--; r1++;
        if (r1 < r) {
          const formula = `=SUM(${cellId(r1, c)}:${cellId(r - 1, c)})`;
          setCells(prev => ({ ...prev, [cellId(r, c)]: { ...(prev[cellId(r, c)] || { v: '' }), v: formula } }));
        }
        break;
      }
      case 'insert-row': {
        setCells(prev => {
          const next: Record<string, Cell> = {};
          Object.entries(prev).forEach(([id, cell]) => {
            const p = parseRef(id)!; if (p.r >= sel.s.r) next[cellId(p.r + 1, p.c)] = cell; else next[id] = cell;
          });
          return next;
        });
        break;
      }
      case 'delete-row': {
        setCells(prev => {
          const next: Record<string, Cell> = {};
          Object.entries(prev).forEach(([id, cell]) => {
            const p = parseRef(id)!; if (p.r === sel.s.r) return; if (p.r > sel.s.r) next[cellId(p.r - 1, p.c)] = cell; else next[id] = cell;
          });
          return next;
        });
        break;
      }
      case 'sort': {
        // sort selection by first column
        const rows: Record<string, Cell>[] = [];
        for (let r = selBox.r1; r <= selBox.r2; r++) {
          const row: Record<string, Cell> = {};
          for (let c = selBox.c1; c <= selBox.c2; c++) { const id = cellId(r, c); if (cells[id]) row[`${c}`] = cells[id]; }
          rows.push(row);
        }
        rows.sort((a, b) => { const av = a[`${selBox.c1}`]?.v || ''; const bv = b[`${selBox.c1}`]?.v || ''; const an = parseFloat(av), bn = parseFloat(bv); if (!isNaN(an) && !isNaN(bn)) return value === 'asc' ? an - bn : bn - an; return value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); });
        setCells(prev => {
          const next = { ...prev };
          for (let r = selBox.r1; r <= selBox.r2; r++) for (let c = selBox.c1; c <= selBox.c2; c++) delete next[cellId(r, c)];
          rows.forEach((row, i) => Object.entries(row).forEach(([c, cell]) => { next[cellId(selBox.r1 + i, parseInt(c))] = cell; }));
          return next;
        });
        break;
      }
      case 'insert-fn': {
        const fn = value as string;
        const formula = `=${fn}(${fn === 'TODAY' || fn === 'NOW' ? '' : 'A1:A10'})`;
        beginEdit(sel.s.r, sel.s.c, formula);
        break;
      }
      case 'recalc': setSheets(s => [...s]); break;
      case 'toggle-gridlines': setShowGridlines(g => !g); break;
      case 'toggle-headings': setShowHeadings(h => !h); break;
      case 'zoom-in': setZoom(z => Math.min(200, z + 10)); break;
      case 'zoom-out': setZoom(z => Math.max(50, z - 10)); break;
      case 'paste': navigator.clipboard.readText().then(t => { if (!t) return; beginEdit(sel.s.r, sel.s.c, t); }); break;
      case 'copy': { const v = cells[cellId(sel.s.r, sel.s.c)]?.v || ''; navigator.clipboard.writeText(v); break; }
      case 'cut': { const id = cellId(sel.s.r, sel.s.c); const v = cells[id]?.v || ''; navigator.clipboard.writeText(v); setCells(p => { const n = { ...p }; delete n[id]; return n; }); break; }
    }
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 's') { e.preventDefault(); setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 500); return; }
        if (e.key === 'b') { e.preventDefault(); applyFmt({ bold: !anchorFmt.bold }); return; }
        if (e.key === 'i') { e.preventDefault(); applyFmt({ italic: !anchorFmt.italic }); return; }
        if (e.key === 'u') { e.preventDefault(); applyFmt({ underline: !anchorFmt.underline }); return; }
        if (e.key === 'c') { handleAction('copy'); return; }
        if (e.key === 'x') { handleAction('cut'); return; }
        if (e.key === 'v') { handleAction('paste'); return; }
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => ({ s: { r: Math.min(s.s.r + 1, NUM_ROWS - 1), c: s.s.c }, e: { r: Math.min(s.s.r + 1, NUM_ROWS - 1), c: s.s.c } })); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => ({ s: { r: Math.max(s.s.r - 1, 0), c: s.s.c }, e: { r: Math.max(s.s.r - 1, 0), c: s.s.c } })); }
      else if (e.key === 'ArrowRight' || e.key === 'Tab') { e.preventDefault(); setSel(s => ({ s: { r: s.s.r, c: Math.min(s.s.c + 1, NUM_COLS - 1) }, e: { r: s.s.r, c: Math.min(s.s.c + 1, NUM_COLS - 1) } })); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setSel(s => ({ s: { r: s.s.r, c: Math.max(s.s.c - 1, 0) }, e: { r: s.s.r, c: Math.max(s.s.c - 1, 0) } })); }
      else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); beginEdit(sel.s.r, sel.s.c); }
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setCells(prev => { const n = { ...prev }; for (let r = selBox.r1; r <= selBox.r2; r++) for (let c = selBox.c1; c <= selBox.c2; c++) delete n[cellId(r, c)]; return n; });
      }
      else if (e.key.length === 1 && !e.altKey) { beginEdit(sel.s.r, sel.s.c, e.key); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, selBox, editing, anchorFmt, cells]);

  // Sheet ops
  const addSheet = () => {
    const id = `s${Date.now()}`;
    setSheets(prev => [...prev, { id, name: `Sheet${prev.length + 1}`, cells: {} }]);
    setActiveSheetId(id);
  };
  const deleteSheet = (id: string) => {
    if (sheets.length === 1) return;
    setSheets(prev => prev.filter(s => s.id !== id));
    if (activeSheetId === id) setActiveSheetId(sheets.find(s => s.id !== id)!.id);
  };
  const renameSheet = (id: string, name: string) => setSheets(prev => prev.map(s => s.id === id ? { ...s, name: name || s.name } : s));
  const duplicateSheet = (id: string) => {
    const src = sheets.find(s => s.id === id); if (!src) return;
    const nid = `s${Date.now()}`;
    setSheets(prev => [...prev, { ...src, id: nid, name: src.name + ' Copy', cells: { ...src.cells } }]);
    setActiveSheetId(nid);
  };

  // Export CSV / XLSX-ish
  const exportCSV = () => {
    let maxR = 0, maxC = 0;
    Object.keys(cells).forEach(id => { const p = parseRef(id)!; maxR = Math.max(maxR, p.r); maxC = Math.max(maxC, p.c); });
    const rows: string[] = [];
    for (let r = 0; r <= maxR; r++) {
      const row: string[] = [];
      for (let c = 0; c <= maxC; c++) {
        const v = displayValue(r, c).replace(/"/g, '""');
        row.push(/[",\n]/.test(v) ? `"${v}"` : v);
      }
      rows.push(row.join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };
  const exportXLSX = () => {
    // simple HTML-table .xls fallback (Excel opens it)
    let html = '<html><body><table>';
    let maxR = 0, maxC = 0;
    Object.keys(cells).forEach(id => { const p = parseRef(id)!; maxR = Math.max(maxR, p.r); maxC = Math.max(maxC, p.c); });
    for (let r = 0; r <= maxR; r++) {
      html += '<tr>';
      for (let c = 0; c <= maxC; c++) html += `<td>${displayValue(r, c)}</td>`;
      html += '</tr>';
    }
    html += '</table></body></html>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.xls`; a.click();
    URL.revokeObjectURL(a.href);
  };
  const exportPDF = () => { window.print(); };
  const importFile = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx,.xls,.txt';
    inp.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const next: Record<string, Cell> = {};
      lines.forEach((line, r) => {
        const parts = line.split(',');
        parts.forEach((v, c) => { if (v.trim()) next[cellId(r, c)] = { v: v.trim() }; });
      });
      setSheets(prev => prev.map(s => s.id === activeSheetId ? { ...s, cells: next } : s));
      setDocName(file.name.replace(/\.[^.]+$/, ''));
    };
    inp.click();
  };

  const handleAi = () => {
    if (!aiPrompt.trim() || aiBusy) return;
    setAiBusy(true);
    setAiHistory(h => [...h, { role: 'user', text: aiPrompt }]);
    setTimeout(() => {
      setAiHistory(h => [...h, { role: 'ai', text: 'Generated suggestions based on your sheet. Try =SUM(A1:A10) or apply currency formatting.' }]);
      setAiBusy(false);
      setAiPrompt('');
    }, 900);
  };

  // Mouse selection
  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (editing) commitEdit();
    if (e.shiftKey) setSel(s => ({ s: s.s, e: { r, c } }));
    else setSel({ s: { r, c }, e: { r, c } });
    dragRef.current.active = true;
  };
  const handleCellMouseEnter = (r: number, c: number) => {
    if (dragRef.current.active) setSel(s => ({ s: s.s, e: { r, c } }));
  };
  useEffect(() => {
    const up = () => { dragRef.current.active = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const formulaBarValue = editing ? editing.v : (cells[cellId(sel.s.r, sel.s.c)]?.v || '');

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-2 sm:px-3 border-b border-border bg-emerald-700 text-white flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => navigate('/office/spreadsheets')} className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center" title="Spreadsheets Home">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          {editingName ? (
            <input
              autoFocus
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              onBlur={() => { setEditingName(false); markUnsaved(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setEditingName(false); markUnsaved(); } if (e.key === 'Escape') setEditingName(false); }}
              className="text-sm font-semibold bg-white/15 border border-white/30 outline-none rounded px-2 py-0.5 max-w-[260px]"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="text-sm font-semibold hover:bg-white/15 rounded px-1.5 py-0.5 truncate max-w-[200px] sm:max-w-[300px]">
              {docName}
            </button>
          )}
          <div className="flex items-center gap-1 flex-shrink-0">
            {saveStatus === 'saved' && <Cloud className="w-3.5 h-3.5 text-green-200" />}
            {saveStatus === 'saving' && <Cloud className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />}
            {saveStatus === 'unsaved' && <CloudOff className="w-3.5 h-3.5 text-white/70" />}
            <span className="hidden sm:inline text-[10px] text-white/80">{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => handleAction('toggle')} className="hidden md:flex w-7 h-7 rounded hover:bg-white/15 items-center justify-center" title="Undo"><Undo2 className="w-4 h-4" /></button>
          <button className="hidden md:flex w-7 h-7 rounded hover:bg-white/15 items-center justify-center" title="Redo"><Redo2 className="w-4 h-4" /></button>
          <button className="hidden md:flex items-center gap-1 px-3 py-1 rounded bg-white/15 hover:bg-white/25 text-xs"><Share2 className="w-3.5 h-3.5" /> Share</button>
          <button onClick={() => setAiOpen(o => !o)} className="w-7 h-7 rounded hover:bg-white/15 flex items-center justify-center" title="Toggle AI">
            {aiOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* File menu strip */}
      <div ref={fileMenuRef} className="h-7 flex items-center px-2 border-b border-border bg-surface/40 text-xs flex-shrink-0 relative">
        <button onClick={() => setFileMenu(f => !f)} className={cn("px-2 py-0.5 rounded", fileMenu && "bg-accent/15 text-accent")}>File</button>
        {fileMenu && (
          <div className="absolute top-full left-2 mt-0.5 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-56">
            <button onClick={() => { navigate('/office/spreadsheets'); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><Home className="w-3.5 h-3.5" /> Spreadsheets Home</button>
            <button onClick={() => { navigate('/office'); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FolderOpen className="w-3.5 h-3.5" /> Office Home</button>
            <div className="h-px bg-border my-1" />
            <button onClick={() => { navigate('/office/spreadsheets/new'); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FilePlus className="w-3.5 h-3.5" /> New</button>
            <button onClick={() => { importFile(); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FolderOpen className="w-3.5 h-3.5" /> Import...</button>
            <div className="h-px bg-border my-1" />
            <button onClick={() => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 500); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><Save className="w-3.5 h-3.5" /> Save</button>
            <div className="h-px bg-border my-1" />
            <button onClick={() => { exportXLSX(); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FileDown className="w-3.5 h-3.5" /> Download .xlsx</button>
            <button onClick={() => { exportCSV(); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FileDown className="w-3.5 h-3.5" /> Download .csv</button>
            <button onClick={() => { exportPDF(); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><FileDown className="w-3.5 h-3.5" /> Download as PDF</button>
            <div className="h-px bg-border my-1" />
            <button onClick={() => { window.print(); setFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover"><Printer className="w-3.5 h-3.5" /> Print</button>
          </div>
        )}
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">Edit</button>
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">View</button>
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">Insert</button>
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">Format</button>
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">Data</button>
        <button className="px-2 py-0.5 rounded hover:bg-surface-hover">Help</button>
      </div>

      {/* Ribbon */}
      <ExcelRibbon active={activeTab} onTabChange={setActiveTab} onAction={handleAction} cellFormat={anchorFmt} />

      {/* Formula bar */}
      <div className="h-8 flex items-center gap-2 border-b border-border bg-card px-2 flex-shrink-0">
        <div className="w-20 sm:w-24 text-xs font-mono px-2 py-1 bg-surface border border-border rounded">{cellId(sel.s.r, sel.s.c)}</div>
        <div className="text-muted-foreground text-xs italic">fx</div>
        <input
          value={formulaBarValue}
          onChange={(e) => editing ? setEditing({ ...editing, v: e.target.value }) : beginEdit(sel.s.r, sel.s.c, e.target.value)}
          onBlur={() => editing && commitEdit()}
          onKeyDown={(e) => { if (e.key === 'Enter') { commitEdit('down'); } if (e.key === 'Escape') cancelEdit(); }}
          className="flex-1 h-7 text-xs font-mono px-2 bg-surface border border-border rounded outline-none focus:border-accent"
          placeholder="Enter value or =FORMULA(...)"
        />
      </div>

      {/* Body: grid + AI */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-zinc-900">
          <div ref={gridRef} className="flex-1 overflow-auto" style={{ fontSize: `${zoom}%` }}>
            <div className="relative" style={{ width: HEADER_W + NUM_COLS * COL_WIDTH, minHeight: HEADER_H + NUM_ROWS * ROW_HEIGHT }}>
              {/* corner */}
              {showHeadings && (
                <div className="sticky top-0 left-0 z-30 bg-zinc-100 dark:bg-zinc-800 border-r border-b border-zinc-300 dark:border-zinc-700" style={{ width: HEADER_W, height: HEADER_H, position: 'sticky' }} />
              )}
              {/* col headers */}
              {showHeadings && (
                <div className="sticky top-0 z-20 flex bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700" style={{ marginLeft: HEADER_W, height: HEADER_H, width: NUM_COLS * COL_WIDTH, marginTop: -HEADER_H }}>
                  {Array.from({ length: NUM_COLS }).map((_, c) => (
                    <div key={c} className={cn("text-[10px] flex items-center justify-center border-r border-zinc-300 dark:border-zinc-700 select-none", c >= selBox.c1 && c <= selBox.c2 ? "bg-emerald-200/70 dark:bg-emerald-700/40 text-emerald-900 dark:text-emerald-100 font-semibold" : "text-zinc-600 dark:text-zinc-400")} style={{ width: COL_WIDTH }}>{colName(c)}</div>
                  ))}
                </div>
              )}
              {/* rows */}
              <div className="flex flex-col" style={{ marginLeft: showHeadings ? HEADER_W : 0 }}>
                {Array.from({ length: NUM_ROWS }).map((_, r) => (
                  <div key={r} className="flex" style={{ height: ROW_HEIGHT }}>
                    {showHeadings && (
                      <div className={cn("sticky left-0 z-10 text-[10px] flex items-center justify-center border-r border-b border-zinc-300 dark:border-zinc-700 select-none", r >= selBox.r1 && r <= selBox.r2 ? "bg-emerald-200/70 dark:bg-emerald-700/40 text-emerald-900 dark:text-emerald-100 font-semibold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400")} style={{ width: HEADER_W, marginLeft: -HEADER_W }}>{r + 1}</div>
                    )}
                    {Array.from({ length: NUM_COLS }).map((_, c) => {
                      const id = cellId(r, c);
                      const cell = cells[id];
                      const f = cell?.f || {};
                      const isEdit = editing?.r === r && editing?.c === c;
                      const selected = inSel(r, c);
                      const anchor = isAnchor(r, c);
                      const v = isEdit ? '' : displayValue(r, c);
                      return (
                        <div
                          key={c}
                          onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                          onMouseEnter={() => handleCellMouseEnter(r, c)}
                          onDoubleClick={() => beginEdit(r, c)}
                          className={cn(
                            "relative box-border overflow-hidden text-xs cursor-cell",
                            showGridlines && "border-r border-b border-zinc-200 dark:border-zinc-700",
                            selected && !anchor && "bg-emerald-100/40 dark:bg-emerald-900/20",
                            anchor && "outline outline-2 outline-emerald-600 z-10",
                          )}
                          style={{
                            width: COL_WIDTH,
                            height: ROW_HEIGHT,
                            backgroundColor: f.bg || undefined,
                            color: f.color,
                            fontFamily: f.fontFamily,
                            fontSize: f.fontSize ? `${f.fontSize}px` : undefined,
                            fontWeight: f.bold ? 600 : undefined,
                            fontStyle: f.italic ? 'italic' : undefined,
                            textDecoration: [f.underline && 'underline', f.strike && 'line-through'].filter(Boolean).join(' ') || undefined,
                            textAlign: f.align || (typeof v === 'string' && !isNaN(parseFloat(v)) && v !== '' ? 'right' : 'left'),
                            display: 'flex',
                            alignItems: f.valign === 'top' ? 'flex-start' : f.valign === 'bottom' ? 'flex-end' : 'center',
                            justifyContent: f.align === 'center' ? 'center' : f.align === 'right' ? 'flex-end' : 'flex-start',
                            padding: '0 4px',
                            whiteSpace: f.wrap ? 'normal' : 'nowrap',
                          }}
                        >
                          {isEdit ? (
                            <input
                              ref={editInputRef}
                              value={editing!.v}
                              onChange={(e) => setEditing({ ...editing!, v: e.target.value })}
                              onBlur={() => commitEdit()}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitEdit('down'); } if (e.key === 'Tab') { e.preventDefault(); commitEdit('right'); } if (e.key === 'Escape') cancelEdit(); }}
                              className="w-full h-full bg-white dark:bg-zinc-800 outline-none text-xs px-0"
                              autoFocus
                            />
                          ) : v}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sheet tabs */}
          <div className="h-8 flex items-center border-t border-border bg-surface/30 px-2 gap-1 overflow-x-auto flex-shrink-0">
            <button onClick={addSheet} className="w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center text-muted-foreground" title="Add sheet"><Plus className="w-3.5 h-3.5" /></button>
            {sheets.map(s => (
              <div key={s.id} className={cn("group flex items-center gap-1 h-6 px-2 rounded text-xs cursor-pointer", activeSheetId === s.id ? "bg-card border border-border text-foreground font-medium" : "text-muted-foreground hover:bg-surface-hover")} onClick={() => setActiveSheetId(s.id)} onDoubleClick={() => setEditingSheetId(s.id)}>
                {editingSheetId === s.id ? (
                  <input
                    autoFocus
                    defaultValue={s.name}
                    onBlur={(e) => { renameSheet(s.id, e.target.value); setEditingSheetId(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { renameSheet(s.id, (e.target as HTMLInputElement).value); setEditingSheetId(null); } if (e.key === 'Escape') setEditingSheetId(null); }}
                    className="w-20 bg-transparent outline-none text-xs"
                  />
                ) : <span>{s.name}</span>}
                {sheets.length > 1 && activeSheetId === s.id && (
                  <button onClick={(e) => { e.stopPropagation(); deleteSheet(s.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500"><X className="w-3 h-3" /></button>
                )}
                {activeSheetId === s.id && (
                  <button onClick={(e) => { e.stopPropagation(); duplicateSheet(s.id); }} className="opacity-0 group-hover:opacity-100 hover:text-accent" title="Duplicate"><Plus className="w-3 h-3" /></button>
                )}
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div className="h-6 flex items-center justify-between border-t border-border bg-emerald-700 text-white text-[10px] px-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span>Ready</span>
              <span className="hidden sm:inline">Cell: {cellId(sel.s.r, sel.s.c)}</span>
            </div>
            <div className="flex items-center gap-3">
              {stats.count > 0 && (
                <>
                  <span>Sum: {stats.sum.toFixed(2)}</span>
                  <span>Avg: {stats.avg.toFixed(2)}</span>
                  <span>Count: {stats.count}</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:bg-white/15 px-1 rounded">−</button>
                <span>{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:bg-white/15 px-1 rounded">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Panel - overlay on mobile */}
        {aiOpen && (
          <>
            <button aria-label="Close AI panel" onClick={() => setAiOpen(false)} className="md:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm" />
          <aside className="fixed md:relative inset-y-0 right-0 z-40 w-[85vw] max-w-[20rem] md:w-72 lg:w-80 border-l border-border bg-card flex flex-col flex-shrink-0 shadow-2xl md:shadow-none">
            <div className="h-10 flex items-center justify-between px-3 border-b border-border">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">AI Assistant</span></div>
              <button onClick={() => setAiOpen(false)} className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {aiHistory.length === 0 && (
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-surface/40">
                  Ask AI to build formulas, summarize data, generate charts, or fill cells.
                </div>
              )}
              {aiHistory.map((m, i) => (
                <div key={i} className={cn("p-2 rounded-lg text-xs", m.role === 'user' ? "bg-accent/10 text-foreground ml-4" : "bg-surface/60 text-foreground mr-4")}>{m.text}</div>
              ))}
            </div>
            <div className="p-2 border-t border-border">
              <div className="flex items-end gap-1">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAi(); } }}
                  rows={2}
                  placeholder="Ask AI to build a formula or summarize..."
                  className="flex-1 text-xs bg-surface border border-border rounded-lg p-2 outline-none focus:border-accent resize-none"
                />
                <button onClick={handleAi} disabled={aiBusy || !aiPrompt.trim()} className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center disabled:opacity-30">
                  {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </aside>
          </>
        )}
      </div>
    </div>
  );
}
