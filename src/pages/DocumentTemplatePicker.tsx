import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Briefcase, GraduationCap, FileSignature, Newspaper, ClipboardList, BookOpen, Mail, FileCheck2, FileBarChart, Heart, Sparkles } from 'lucide-react';
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
  { id: 'blank', name: 'Blank document', description: 'Start from a clean page', icon: FileText, category: 'Basic', accent: 'from-zinc-200 to-zinc-50' },
  { id: 'business-report', name: 'Business Report', description: 'Quarterly review with charts and tables', icon: FileBarChart, category: 'Business', accent: 'from-blue-200 to-blue-50' },
  { id: 'resume', name: 'Modern Résumé', description: 'Clean professional CV layout', icon: Briefcase, category: 'Personal', accent: 'from-emerald-200 to-emerald-50' },
  { id: 'cover-letter', name: 'Cover Letter', description: 'Formal letter with header & signature', icon: FileSignature, category: 'Personal', accent: 'from-violet-200 to-violet-50' },
  { id: 'meeting-notes', name: 'Meeting Notes', description: 'Agenda, attendees and action items', icon: ClipboardList, category: 'Work', accent: 'from-amber-200 to-amber-50' },
  { id: 'newsletter', name: 'Newsletter', description: 'Two-column email-style layout', icon: Newspaper, category: 'Marketing', accent: 'from-rose-200 to-rose-50' },
  { id: 'thesis', name: 'Academic Paper', description: 'APA-style with citations & TOC', icon: GraduationCap, category: 'Academic', accent: 'from-indigo-200 to-indigo-50' },
  { id: 'ebook', name: 'eBook', description: 'Chapter-based long-form', icon: BookOpen, category: 'Creative', accent: 'from-fuchsia-200 to-fuchsia-50' },
  { id: 'invoice', name: 'Invoice', description: 'Professional billing template', icon: FileCheck2, category: 'Business', accent: 'from-teal-200 to-teal-50' },
  { id: 'letter', name: 'Personal Letter', description: 'Friendly correspondence', icon: Mail, category: 'Personal', accent: 'from-pink-200 to-pink-50' },
  { id: 'proposal', name: 'Project Proposal', description: 'Pitch with budget & timeline', icon: FileBarChart, category: 'Business', accent: 'from-cyan-200 to-cyan-50' },
  { id: 'wedding', name: 'Event Program', description: 'Elegant program template', icon: Heart, category: 'Personal', accent: 'from-red-200 to-red-50' },
];

const categories = ['All', 'Basic', 'Business', 'Personal', 'Work', 'Academic', 'Creative', 'Marketing'];

export default function DocumentTemplatePicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t =>
    (active === 'All' || t.category === active) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
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
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-4 sm:px-6 gap-3 bg-background">
        <button onClick={() => navigate('/office/documents')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <h1 className="text-base font-semibold text-foreground truncate">New Document</h1>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent w-48 sm:w-64"
        />
      </div>

      <div className="flex-1 overflow-auto">
        {/* Hero blank card */}
        <div className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Start a new document</h2>
                <p className="text-xs text-muted-foreground mt-1">Pick a styled template or start blank — your Word workspace opens after this.</p>
              </div>
            </div>

            <button
              onClick={() => open('blank')}
              className="group w-full sm:max-w-xs flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all text-left"
            >
              <div className="w-14 h-16 bg-card border border-border rounded-md flex items-center justify-center flex-shrink-0 group-hover:border-accent">
                <FileText className="w-6 h-6 text-muted-foreground group-hover:text-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Blank document</div>
                <div className="text-[11px] text-muted-foreground">Start from scratch</div>
              </div>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 sm:px-6 lg:px-12 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-border">
              {categories.map(c => (
                <button key={c} onClick={() => setActive(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active === c
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Templates grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
              {filtered.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => open(t.id)}
                    className="group flex flex-col text-left rounded-xl overflow-hidden border border-border hover:border-accent hover:shadow-lg transition-all bg-card">
                    <div className={`aspect-[4/5] bg-gradient-to-br ${t.accent} relative flex items-center justify-center`}>
                      {/* Mini doc preview */}
                      <div className="absolute inset-3 bg-white rounded-sm shadow-md p-3 flex flex-col gap-1.5">
                        <div className="h-2 w-3/4 bg-zinc-300 rounded-sm" />
                        <div className="h-1 w-full bg-zinc-200 rounded-sm" />
                        <div className="h-1 w-5/6 bg-zinc-200 rounded-sm" />
                        <div className="h-1 w-2/3 bg-zinc-200 rounded-sm" />
                        <div className="mt-2 h-1.5 w-1/2 bg-zinc-300 rounded-sm" />
                        <div className="h-1 w-full bg-zinc-200 rounded-sm" />
                        <div className="h-1 w-4/5 bg-zinc-200 rounded-sm" />
                      </div>
                      <Icon className="absolute bottom-2 right-2 w-4 h-4 text-zinc-500/50" />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-semibold text-foreground truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI generate banner */}
            <div className="mb-12 rounded-xl border border-border bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">Generate with AI</div>
                <div className="text-xs text-muted-foreground">Describe what you want — get a fully formatted document.</div>
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
