import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Sparkles, Wallet, Receipt, Calculator, ListChecks, GraduationCap, Users, BarChart3, Calendar, Building2, ShoppingCart, PiggyBank } from 'lucide-react';
import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  accent: string;
}

const templates: Template[] = [
  { id: 'blank', name: 'Blank workbook', description: 'Start from a clean spreadsheet', icon: FileSpreadsheet, category: 'Basic', accent: 'from-zinc-200 to-zinc-50' },
  { id: 'budget', name: 'Monthly Budget', description: 'Track income & expenses with totals', icon: Wallet, category: 'Finance', accent: 'from-emerald-200 to-emerald-50' },
  { id: 'invoice', name: 'Invoice', description: 'Itemized invoice with auto totals', icon: Receipt, category: 'Business', accent: 'from-blue-200 to-blue-50' },
  { id: 'expense-report', name: 'Expense Report', description: 'Categorized expense tracker', icon: Calculator, category: 'Finance', accent: 'from-amber-200 to-amber-50' },
  { id: 'project-tracker', name: 'Project Tracker', description: 'Tasks, owners, status & dates', icon: ListChecks, category: 'Work', accent: 'from-violet-200 to-violet-50' },
  { id: 'gradebook', name: 'Grade Book', description: 'Student grades & averages', icon: GraduationCap, category: 'Education', accent: 'from-indigo-200 to-indigo-50' },
  { id: 'attendance', name: 'Attendance Sheet', description: 'Daily attendance log', icon: Users, category: 'Education', accent: 'from-cyan-200 to-cyan-50' },
  { id: 'sales-dashboard', name: 'Sales Dashboard', description: 'Quarterly sales with charts', icon: BarChart3, category: 'Business', accent: 'from-orange-200 to-orange-50' },
  { id: 'calendar', name: 'Calendar', description: 'Monthly planning calendar', icon: Calendar, category: 'Personal', accent: 'from-rose-200 to-rose-50' },
  { id: 'inventory', name: 'Inventory', description: 'Stock levels & reorder points', icon: Building2, category: 'Business', accent: 'from-teal-200 to-teal-50' },
  { id: 'shopping', name: 'Shopping List', description: 'Items, quantity & prices', icon: ShoppingCart, category: 'Personal', accent: 'from-pink-200 to-pink-50' },
  { id: 'savings', name: 'Savings Goal', description: 'Track progress to a goal', icon: PiggyBank, category: 'Finance', accent: 'from-fuchsia-200 to-fuchsia-50' },
];

const categories = ['All', 'Basic', 'Finance', 'Business', 'Work', 'Education', 'Personal'];

export default function SpreadsheetTemplatePicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    (active === 'All' || t.category === active) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const open = (id: string) => {
    const projectId = `sheet-${Date.now()}`;
    const prompt = searchParams.get('prompt');
    const params = new URLSearchParams({ template: id });
    if (prompt) params.set('prompt', prompt);
    navigate(`/office/spreadsheets/${projectId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4 sm:px-6 gap-3 bg-background">
        <button onClick={() => navigate('/office/spreadsheets')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileSpreadsheet className="w-5 h-5 text-green-500 flex-shrink-0" />
          <h1 className="text-base font-semibold text-foreground truncate">New Spreadsheet</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent w-32 sm:w-64"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Start a new spreadsheet</h2>
              <p className="text-xs text-muted-foreground mt-1">Pick a styled template or start blank — your Excel workspace opens after this.</p>
            </div>

            <button
              onClick={() => open('blank')}
              className="group w-full sm:max-w-xs flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
            >
              <div className="w-20 h-12 bg-card border border-border rounded-md flex items-center justify-center flex-shrink-0 group-hover:border-accent">
                <FileSpreadsheet className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Blank workbook</div>
                <div className="text-[11px] text-muted-foreground">Start from scratch</div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-border">
              {categories.map(c => (
                <button key={c} onClick={() => setActive(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active === c ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
              {filtered.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => open(t.id)}
                    className="group flex flex-col text-left rounded-xl overflow-hidden border border-border hover:border-accent hover:shadow-lg transition-all bg-card">
                    <div className={`aspect-[16/9] bg-gradient-to-br ${t.accent} relative flex items-center justify-center p-3`}>
                      <div className="absolute inset-3 bg-white rounded-md shadow-md overflow-hidden">
                        <div className="h-3 bg-emerald-600/90 flex items-center px-1.5 gap-1">
                          <div className="h-1 w-6 bg-white/60 rounded-sm" />
                          <div className="h-1 w-4 bg-white/40 rounded-sm" />
                        </div>
                        <div className="grid grid-cols-5 grid-rows-5 gap-px bg-zinc-200 p-px">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className="bg-white aspect-square" />
                          ))}
                        </div>
                      </div>
                      <Icon className="absolute bottom-2 right-2 w-4 h-4 text-emerald-700/40" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-semibold text-foreground truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-12 rounded-xl border border-border bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Generate with AI</div>
                <div className="text-xs text-muted-foreground">Describe your data — get a structured workbook with formulas.</div>
              </div>
              <button onClick={() => open('blank')} className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 flex-shrink-0">
                Try it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
