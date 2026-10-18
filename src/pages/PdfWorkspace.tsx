import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  FileCode2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Download, Printer, Search, Sparkles, MessageSquare,
  Highlighter, StickyNote, PenTool, Check, Upload, Share2,
  FileText, ArrowLeft, Sun, Moon, Loader2, Send, Home, FilePlus, FolderOpen, FileDown, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import OfficeBackstageModal from '@/components/office/OfficeBackstageModal';

interface Annotation {
  id: string;
  page: number;
  text: string;
  color: string;
  author: string;
}

const SAMPLE_PAGES = [
  {
    pageNumber: 1,
    title: 'Eruwa AI Architecture & System Whitepaper',
    subtitle: 'High-Performance Intelligent Multi-Workspace Operating Environment',
    content: [
      {
        heading: '1. Executive Summary',
        paragraphs: [
          'Eruwa AI introduces an integrated intelligent browser environment that unifies conversational intelligence, multi-modal reasoning, and comprehensive office workspace authoring (Documents, Sheet, Slide, and PDF).',
          'By embedding zero-latency client-side WebAssembly computation together with adaptive model routing, users experience immediate feedback loops for complex analytical, drafting, and numerical tasks.',
        ],
      },
      {
        heading: '2. Unified Browser Architecture',
        paragraphs: [
          'Traditional AI assistants operate as single-page siloed chat feeds. In contrast, Eruwa treats every user task as an autonomous browser tab equipped with persistent memory buffers, multi-tab grouping, and omnibox query execution.',
        ],
      },
    ],
  },
  {
    pageNumber: 2,
    title: 'Neural Multi-Model Routing & Latency Benchmarks',
    subtitle: 'Section 3: Optimization Metrics & Execution Pipelines',
    content: [
      {
        heading: '3. Multi-Model Arbitration',
        paragraphs: [
          'Queries submitted through the Eruwa AI Mode search omnibox are dynamically categorized across structural intent classes. Numerical requests route directly to formulaic engines; deep research prompts spawn concurrent retrieval workers.',
          'Under benchmark evaluations across 50,000 synthetic queries, Eruwa achieves an average time-to-first-token (TTFT) of 142ms, representing a 3.4x improvement over conventional cloud streaming pipelines.',
        ],
      },
      {
        heading: '4. Memory Isolation & State Integrity',
        paragraphs: [
          'Each workspace tab operates within its own security enclave. Contextual state from Sheets can be selectively passed into Documents or Slides without data bleeding.',
        ],
      },
    ],
  },
  {
    pageNumber: 3,
    title: 'Sandboxed Office Suite & Document Engine',
    subtitle: 'Section 5: Native Documents, Sheet & Slide Generation',
    content: [
      {
        heading: '5. Office Workspaces Integration',
        paragraphs: [
          'The document generator delivers 100% fidelity to standard OpenXML and PDF standards. Users can transition effortlessly between drafting prose, formulating financial spreadsheets, and delivering pitch presentations.',
          'Full offline persistence ensures that guest sessions and authenticated users alike preserve their working documents in local indexed storage.',
        ],
      },
    ],
  },
];

export const PdfWorkspace = () => {
  const { theme, toggleTheme } = useWorkspace();
  const { openTab } = useBrowserTabs();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'note'>('select');
  const [docTitle, setDocTitle] = useState('Eruwa_AI_Architecture_Whitepaper.pdf');
  const [showFile, setShowFile] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: '1', page: 1, text: 'Verified benchmark: 142ms TTFT', color: '#fef08a', author: 'Eruwa AI' },
  ]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'I have analyzed **Eruwa_AI_Architecture_Whitepaper.pdf** (3 pages). Ask me anything about the system architecture, benchmarks, or office suite integration!',
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAskAI = (promptText?: string) => {
    const query = promptText || aiInput.trim();
    if (!query) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: query }];
    setChatMessages(newMessages);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();
      if (lower.includes('summar') || lower.includes('overview')) {
        reply = '### Summary of Eruwa AI Whitepaper\n- **Unified Browser Concept**: Operates like an intelligent browser with tab groups, omnibox, and app launcher.\n- **Office Suite Integration**: Native Documents, Sheet, Slide, and PDF workspaces with local persistence.\n- **Performance**: 142ms time-to-first-token with dynamic neural routing.\n- **Security**: Complete sandbox isolation per tab.';
      } else if (lower.includes('benchmark') || lower.includes('latency')) {
        reply = '### Benchmark Highlights\n- **TTFT (Time-to-first-token)**: 142ms average.\n- **Throughput**: 3.4x faster than traditional cloud-streaming pipelines.\n- **Sample Size**: Evaluated across 50,000 synthetic queries.';
      } else if (lower.includes('office') || lower.includes('document') || lower.includes('sheet')) {
        reply = '### Office Capabilities\nEruwa integrates Documents, Sheet with live formulas, Slide presentations, and PDF inspection into one reactive environment.';
      } else {
        reply = `Based on page ${currentPage} of the document, Eruwa AI ensures high-fidelity processing and seamless memory buffer sharing across all browser tabs.`;
      }

      setChatMessages([...newMessages, { role: 'assistant', text: reply }]);
      setAiLoading(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocTitle(file.name);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Loaded **${file.name}**. Document parsed successfully!` },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative">
      <OfficeBackstageModal
        isOpen={showFile}
        onClose={() => setShowFile(false)}
        toolType="pdf"
        docName={docTitle}
        onRenameDoc={(name) => {
          setDocTitle(name);
        }}
        onNewDoc={(docId) => {
          if (docId) setDocTitle(docId);
          setCurrentPage(1);
        }}
        onOpenFile={() => {
          fileInputRef.current?.click();
        }}
        onSave={() => {
          toast.success('Annotations & PDF buffer saved');
        }}
        onExportPdf={() => {
          toast.success(`Exporting ${docTitle}`);
        }}
        onExportNative={() => {
          toast.success(`Downloading ${docTitle}`);
        }}
        nativeFormatLabel="Download PDF Document"
        stats={{
          countLabel: 'Total Pages',
          countValue: SAMPLE_PAGES.length,
          secondaryLabel: 'Annotations',
          secondaryValue: annotations.length,
          themeOrFormat: 'Standard PDF / OpenXML',
        }}
        templates={[
          { id: 'Eruwa_AI_Architecture_Whitepaper.pdf', name: 'Eruwa AI Architecture Whitepaper', desc: 'System architecture & multi-workspace runtime', category: 'Technical' },
          { id: 'Neural_Routing_TTFT_Benchmarks.pdf', name: 'Neural Routing TTFT Benchmarks', desc: '142ms latency evaluation across 50,000 queries', category: 'Benchmarks' },
          { id: 'Enterprise_Security_Sandbox.pdf', name: 'Enterprise Security Sandbox', desc: 'Zero-bleed memory isolation per browser tab', category: 'Security' },
        ]}
      />

      {/* PDF Action Ribbon */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowFile(!showFile)}
            className={cn("px-2.5 h-7 rounded text-[11px] font-semibold transition-all", showFile ? "bg-red-600 text-white" : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90")}
          >
            File
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="font-semibold text-xs bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 outline-none max-w-[160px] sm:max-w-[240px] truncate"
            />
          </div>
        </div>

        {/* Center Page Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full text-xs">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Page {currentPage} of {SAMPLE_PAGES.length}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(SAMPLE_PAGES.length, p + 1))}
            disabled={currentPage >= SAMPLE_PAGES.length}
            className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload PDF"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF
          </button>

          <button
            onClick={() => window.print()}
            title="Print PDF"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.success(`Preparing ${docTitle} for download...`)}
            title="Download PDF"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              aiSidebarOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Page Thumbnails */}
        <div className="w-44 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-3 overflow-y-auto hidden md:flex flex-col gap-3 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thumbnails</p>
          {SAMPLE_PAGES.map((p) => (
            <button
              key={p.pageNumber}
              onClick={() => setCurrentPage(p.pageNumber)}
              className={`p-2 rounded-xl text-left border transition-all ${
                currentPage === p.pageNumber
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="aspect-[3/4] bg-slate-50 dark:bg-slate-800 rounded p-1.5 flex flex-col justify-between shadow-xs text-[7px] text-slate-400">
                <span className="font-bold line-clamp-1 text-slate-600 dark:text-slate-300">{p.title}</span>
                <span className="text-right font-mono">P.{p.pageNumber}</span>
              </div>
              <span className="text-[10px] font-semibold mt-1 block text-slate-600 dark:text-slate-400">
                Page {p.pageNumber}
              </span>
            </button>
          ))}
        </div>

        {/* Center PDF Viewer Viewport */}
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-200/50 dark:bg-slate-950/80">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-[720px] min-h-[960px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl rounded-sm p-12 border border-slate-300 dark:border-slate-800 transition-transform duration-150 flex flex-col justify-between"
          >
            {/* Document Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {SAMPLE_PAGES[currentPage - 1].title}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {SAMPLE_PAGES[currentPage - 1].subtitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    ERUWA DOC
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">October 2026</p>
                </div>
              </div>

              {/* Document Body */}
              <div className="space-y-6">
                {SAMPLE_PAGES[currentPage - 1].content.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {sec.heading}
                    </h2>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Eruwa Intelligence Framework · Confidential</span>
              <span className="font-mono">Page {currentPage} of {SAMPLE_PAGES.length}</span>
            </div>
          </div>
        </div>

        {/* Right AI PDF Copilot */}
        {aiSidebarOpen && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">PDF AI Copilot</h3>
              </div>
              <button
                onClick={() => setAiSidebarOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAskAI('Summarize this document')}
                className="text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                ⚡ Summarize
              </button>
              <button
                onClick={() => handleAskAI('Extract key latency benchmarks')}
                className="text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                📊 Benchmarks
              </button>
              <button
                onClick={() => handleAskAI('Explain the office suite integration')}
                className="text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                📝 Office Tools
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white ml-6'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-4'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Reading document...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-blue-500">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Ask a question about this PDF..."
                  className="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleAskAI()}
                  className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfWorkspace;
