import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Briefcase, GraduationCap, FileSignature, Newspaper,
  ClipboardList, BookOpen, Mail, FileCheck2, FileBarChart, Heart, Sparkles, Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  /** Tailwind gradient for the card background */
  cardBg: string;
  /** Preview render function — returns JSX describing the mini-document */
  preview: 'cover' | 'resume' | 'letter' | 'notes' | 'two-col' | 'invoice' | 'academic' | 'ebook' | 'blank';
  /** Accent colour token used inside the preview */
  accentHex: string;
}

const templates: Template[] = [
  {
    id: 'blank', name: 'Blank Document', description: 'Start from a clean page',
    icon: FileText, category: 'Basic',
    cardBg: 'from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900',
    preview: 'blank', accentHex: '#6b7280',
  },
  {
    id: 'business-report', name: 'Business Report', description: 'Executive summary with KPIs & tables',
    icon: FileBarChart, category: 'Business',
    cardBg: 'from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900',
    preview: 'cover', accentHex: '#2563eb',
  },
  {
    id: 'resume', name: 'Modern Résumé', description: 'Clean two-column CV layout',
    icon: Briefcase, category: 'Personal',
    cardBg: 'from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900',
    preview: 'resume', accentHex: '#059669',
  },
  {
    id: 'cover-letter', name: 'Cover Letter', description: 'Professional letter with header',
    icon: FileSignature, category: 'Personal',
    cardBg: 'from-violet-100 to-violet-50 dark:from-violet-950 dark:to-violet-900',
    preview: 'letter', accentHex: '#7c3aed',
  },
  {
    id: 'meeting-notes', name: 'Meeting Notes', description: 'Agenda, attendees & action items',
    icon: ClipboardList, category: 'Work',
    cardBg: 'from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900',
    preview: 'notes', accentHex: '#d97706',
  },
  {
    id: 'newsletter', name: 'Newsletter', description: 'Multi-column editorial layout',
    icon: Newspaper, category: 'Marketing',
    cardBg: 'from-rose-100 to-rose-50 dark:from-rose-950 dark:to-rose-900',
    preview: 'two-col', accentHex: '#e11d48',
  },
  {
    id: 'thesis', name: 'Academic Paper', description: 'APA-style with abstract & TOC',
    icon: GraduationCap, category: 'Academic',
    cardBg: 'from-indigo-100 to-indigo-50 dark:from-indigo-950 dark:to-indigo-900',
    preview: 'academic', accentHex: '#4338ca',
  },
  {
    id: 'ebook', name: 'eBook', description: 'Chapter-based long-form writing',
    icon: BookOpen, category: 'Creative',
    cardBg: 'from-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950 dark:to-fuchsia-900',
    preview: 'ebook', accentHex: '#a21caf',
  },
  {
    id: 'invoice', name: 'Invoice', description: 'Professional billing with line items',
    icon: FileCheck2, category: 'Business',
    cardBg: 'from-teal-100 to-teal-50 dark:from-teal-950 dark:to-teal-900',
    preview: 'invoice', accentHex: '#0d9488',
  },
  {
    id: 'letter', name: 'Personal Letter', description: 'Warm correspondence template',
    icon: Mail, category: 'Personal',
    cardBg: 'from-pink-100 to-pink-50 dark:from-pink-950 dark:to-pink-900',
    preview: 'letter', accentHex: '#db2777',
  },
  {
    id: 'proposal', name: 'Project Proposal', description: 'Pitch with goals, timeline & budget',
    icon: FileBarChart, category: 'Business',
    cardBg: 'from-cyan-100 to-cyan-50 dark:from-cyan-950 dark:to-cyan-900',
    preview: 'cover', accentHex: '#0891b2',
  },
  {
    id: 'wedding', name: 'Event Program', description: 'Elegant schedule & program',
    icon: Heart, category: 'Personal',
    cardBg: 'from-red-100 to-red-50 dark:from-red-950 dark:to-red-900',
    preview: 'ebook', accentHex: '#dc2626',
  },
];

const categories = ['All', 'Basic', 'Business', 'Personal', 'Work', 'Academic', 'Creative', 'Marketing'];

/* ─── Mini document preview renderers ─────────────────────────────────── */
function DocPreview({ type, accent }: { type: Template['preview']; accent: string }) {
  const bar = { background: accent };
  const bar2 = { background: accent, opacity: 0.35 };

  if (type === 'blank') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col p-3 gap-2">
      <div className="w-3/4 h-2 rounded-full bg-zinc-200" />
      <div className="flex-1 border border-dashed border-zinc-200 rounded" />
    </div>
  );

  if (type === 'cover') return (
    <div className="absolute inset-2 bg-white rounded shadow-md overflow-hidden flex flex-col">
      {/* top accent band */}
      <div className="h-7" style={bar} />
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 pb-3">
        <div className="w-2/3 h-2.5 rounded-full" style={bar} />
        <div className="w-1/2 h-1.5 rounded-full bg-zinc-300" />
        <div className="mt-2 w-full space-y-1">
          <div className="h-1 bg-zinc-200 rounded-full" />
          <div className="h-1 bg-zinc-200 rounded-full w-5/6" />
          <div className="h-1 bg-zinc-200 rounded-full w-4/5" />
        </div>
        <div className="mt-1.5 w-full space-y-1">
          <div className="w-1/3 h-1.5 rounded-full" style={bar2} />
          <div className="h-1 bg-zinc-100 rounded-full" />
          <div className="h-1 bg-zinc-100 rounded-full w-5/6" />
        </div>
      </div>
      {/* footer accent */}
      <div className="h-1.5" style={bar} />
    </div>
  );

  if (type === 'resume') return (
    <div className="absolute inset-2 bg-white rounded shadow-md overflow-hidden flex">
      {/* sidebar */}
      <div className="w-9 flex flex-col items-center pt-3 gap-2" style={{ background: accent }}>
        <div className="w-5 h-5 rounded-full bg-white/40" />
        <div className="w-5 h-1 bg-white/40 rounded-full" />
        <div className="w-5 h-1 bg-white/40 rounded-full" />
        <div className="mt-2 w-5 h-1 bg-white/25 rounded-full" />
        <div className="w-5 h-1 bg-white/25 rounded-full" />
      </div>
      {/* content */}
      <div className="flex-1 px-2 pt-3 space-y-1.5">
        <div className="h-2 rounded-full bg-zinc-300 w-3/4" />
        <div className="h-1 rounded-full bg-zinc-200 w-1/2" />
        <div className="mt-1.5 h-1 rounded-full w-1/3" style={bar2} />
        <div className="h-1 rounded-full bg-zinc-100 w-full" />
        <div className="h-1 rounded-full bg-zinc-100 w-5/6" />
        <div className="mt-1 h-1 rounded-full w-1/3" style={bar2} />
        <div className="h-1 rounded-full bg-zinc-100 w-full" />
        <div className="h-1 rounded-full bg-zinc-100 w-4/5" />
      </div>
    </div>
  );

  if (type === 'letter') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col p-3 gap-1.5">
      {/* letterhead accent */}
      <div className="h-3 rounded-sm" style={bar} />
      <div className="h-1 bg-zinc-200 rounded-full w-2/3 mt-1" />
      <div className="h-1 bg-zinc-200 rounded-full w-1/2" />
      <div className="mt-1.5 h-1 rounded-full" style={bar2} />
      <div className="space-y-1 mt-0.5">
        <div className="h-1 bg-zinc-100 rounded-full" />
        <div className="h-1 bg-zinc-100 rounded-full w-5/6" />
        <div className="h-1 bg-zinc-100 rounded-full w-4/5" />
        <div className="h-1 bg-zinc-100 rounded-full w-full" />
      </div>
      <div className="mt-1 h-1 bg-zinc-200 rounded-full w-1/3" />
    </div>
  );

  if (type === 'notes') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col p-2.5 gap-1.5">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={bar} />
        <div className="h-1.5 rounded-full bg-zinc-300 flex-1" />
      </div>
      <div className="h-px bg-zinc-200" />
      {[1,2,3].map(i => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="w-2.5 h-2.5 mt-0.5 rounded-sm border flex-shrink-0" style={{ borderColor: accent }} />
          <div className="flex-1 space-y-0.5">
            <div className="h-1 bg-zinc-200 rounded-full w-full" />
            <div className="h-1 bg-zinc-100 rounded-full w-3/4" />
          </div>
        </div>
      ))}
      <div className="mt-1 h-1 rounded-full w-1/3" style={bar2} />
      <div className="h-1 bg-zinc-100 rounded-full w-2/3" />
    </div>
  );

  if (type === 'two-col') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col overflow-hidden">
      <div className="h-4 flex items-center px-2" style={bar}>
        <div className="h-1 rounded-full bg-white/50 w-1/2" />
      </div>
      <div className="flex-1 flex gap-1.5 p-2">
        <div className="flex-1 space-y-1">
          <div className="h-1.5 rounded-full bg-zinc-300 w-3/4" />
          <div className="h-1 rounded-full bg-zinc-100 w-full" />
          <div className="h-1 rounded-full bg-zinc-100 w-5/6" />
          <div className="h-1 rounded-full bg-zinc-100 w-4/5" />
          <div className="mt-1 h-1.5 rounded-full bg-zinc-300 w-2/3" />
          <div className="h-1 rounded-full bg-zinc-100 w-full" />
        </div>
        <div className="w-px bg-zinc-200" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 rounded-full bg-zinc-300 w-3/4" />
          <div className="h-1 rounded-full bg-zinc-100 w-5/6" />
          <div className="h-1 rounded-full bg-zinc-100 w-full" />
          <div className="mt-1 h-1 rounded-full" style={bar2} />
          <div className="h-1 rounded-full bg-zinc-100 w-4/5" />
        </div>
      </div>
    </div>
  );

  if (type === 'invoice') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col overflow-hidden">
      <div className="flex items-start justify-between p-2.5 pb-1.5">
        <div>
          <div className="h-2.5 w-10 rounded-sm" style={bar} />
          <div className="h-1 w-12 bg-zinc-200 rounded-full mt-1" />
        </div>
        <div className="space-y-0.5 text-right">
          <div className="h-1 bg-zinc-200 rounded-full w-10" />
          <div className="h-1 bg-zinc-100 rounded-full w-8" />
        </div>
      </div>
      <div className="h-px bg-zinc-200 mx-2" />
      {/* table header */}
      <div className="flex gap-1 px-2 py-1" style={{ background: accent + '18' }}>
        <div className="h-1 rounded-full flex-1" style={bar2} />
        <div className="h-1 w-4 rounded-full" style={bar2} />
        <div className="h-1 w-5 rounded-full" style={bar2} />
      </div>
      {[1,2].map(i => (
        <div key={i} className="flex gap-1 px-2 py-1">
          <div className="h-1 bg-zinc-100 rounded-full flex-1" />
          <div className="h-1 w-4 bg-zinc-100 rounded-full" />
          <div className="h-1 w-5 bg-zinc-100 rounded-full" />
        </div>
      ))}
      <div className="mt-auto flex justify-end px-2.5 pb-2.5">
        <div className="h-1.5 w-14 rounded-full" style={bar} />
      </div>
    </div>
  );

  if (type === 'academic') return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col p-2.5 gap-1">
      <div className="h-2 bg-zinc-300 rounded-full w-2/3 self-center" />
      <div className="h-1 bg-zinc-200 rounded-full w-1/2 self-center" />
      <div className="mt-1 px-1.5 py-1 rounded" style={{ background: accent + '12' }}>
        <div className="h-1 rounded-full" style={bar2} />
        <div className="mt-0.5 h-1 bg-zinc-200 rounded-full w-full" />
        <div className="h-1 bg-zinc-100 rounded-full w-5/6" />
      </div>
      <div className="h-1.5 rounded-full w-1/4" style={bar2} />
      <div className="space-y-0.5">
        <div className="h-1 bg-zinc-100 rounded-full w-full" />
        <div className="h-1 bg-zinc-100 rounded-full w-5/6" />
        <div className="h-1 bg-zinc-100 rounded-full w-4/5" />
      </div>
    </div>
  );

  // ebook
  return (
    <div className="absolute inset-2 bg-white rounded shadow-md flex flex-col overflow-hidden">
      <div className="h-10 flex items-end px-3 pb-2" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}>
        <div className="h-2 w-1/2 bg-white/70 rounded-full" />
      </div>
      <div className="flex-1 p-2.5 space-y-1">
        <div className="h-1.5 rounded-full bg-zinc-300 w-1/3" />
        <div className="h-1 bg-zinc-100 rounded-full w-full" />
        <div className="h-1 bg-zinc-100 rounded-full w-5/6" />
        <div className="h-1 bg-zinc-100 rounded-full w-4/5" />
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-300 w-1/3" />
        <div className="h-1 bg-zinc-100 rounded-full w-full" />
        <div className="h-1 bg-zinc-100 rounded-full w-3/4" />
      </div>
    </div>
  );
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function DocumentTemplatePicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = templates.filter(t =>
    (active === 'All' || t.category === active) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const open = (id: string) => {
    const projectId = `doc-${Date.now()}`;
    const prompt = searchParams.get('prompt');
    const params = new URLSearchParams({ template: id });
    if (prompt) params.set('prompt', prompt);
    navigate(`/office/documents/${projectId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border flex items-center px-4 sm:px-6 gap-3 bg-background sticky top-0 z-10 backdrop-blur">
        <button
          onClick={() => navigate('/office/documents')}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <h1 className="text-base font-semibold text-foreground truncate">New Document</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            id="template-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="bg-surface border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-500 w-44 sm:w-60 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-12 pt-8 pb-16 max-w-7xl mx-auto">

          {/* ── Hero row ── */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Choose a template</h2>
            <p className="text-sm text-muted-foreground mt-1.5">Pick a styled template or start blank — your Word workspace opens instantly.</p>
          </div>

          {/* ── Blank card (hero) ── */}
          <button
            id="template-blank-hero"
            onClick={() => open('blank')}
            onMouseEnter={() => setHovered('blank-hero')}
            onMouseLeave={() => setHovered(null)}
            className="group mb-8 flex items-center gap-5 p-4 rounded-2xl border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-left w-full sm:max-w-sm"
          >
            <div className="w-16 h-20 bg-card border border-border rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-blue-400 transition-colors shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Blank document</div>
              <div className="text-xs text-muted-foreground mt-0.5">Start from scratch with a clean page</div>
            </div>
          </button>

          {/* ── Category tabs ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-none">
            {categories.map(c => (
              <button
                key={c}
                id={`category-${c.toLowerCase()}`}
                onClick={() => setActive(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  active === c
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground border border-border'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* ── Template grid ── */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No templates match your search.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.filter(t => t.id !== 'blank').map(t => {
                const isHov = hovered === t.id;
                return (
                  <button
                    key={t.id}
                    id={`template-${t.id}`}
                    onClick={() => open(t.id)}
                    onMouseEnter={() => setHovered(t.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex flex-col text-left rounded-2xl overflow-hidden border border-border hover:border-transparent hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-card"
                  >
                    {/* Preview thumbnail */}
                    <div className={`aspect-[3/4] bg-gradient-to-br ${t.cardBg} relative`}>
                      <DocPreview type={t.preview} accent={t.accentHex} />
                      {/* hover overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-2xl`}>
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-semibold bg-white text-foreground shadow-lg translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200`}>
                          Use template
                        </div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="px-3 py-2.5">
                      <div className="text-[11px] font-semibold text-foreground truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{t.description}</div>
                      <div className={`mt-1.5 inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium`}
                        style={{ background: t.accentHex + '20', color: t.accentHex }}>
                        {t.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── AI Generate banner ── */}
          <div className="mt-10 rounded-2xl border border-border bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">Generate with AI</div>
              <div className="text-xs text-muted-foreground mt-0.5">Describe your document and get a fully formatted draft in seconds.</div>
            </div>
            <button
              id="ai-generate-doc"
              onClick={() => open('blank')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0 shadow-md shadow-violet-500/25"
            >
              Try it →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
