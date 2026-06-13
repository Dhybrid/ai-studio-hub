import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, FileText, FileSpreadsheet, Presentation, Download,
  ExternalLink, Edit2, Eye, Loader2, Save, FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportDocx, exportXlsx, exportPptx, exportPdf } from '@/lib/agentApi';

interface OfficeSidePanelProps {
  open: boolean;
  onClose: () => void;
  type: 'document' | 'spreadsheet' | 'presentation';
  title: string;
  content: any; // { html: string } or { cells: Record<string, any> } or { slides: any[] }
}

export default function OfficeSidePanel({ open, onClose, type, title: initialTitle, content: initialContent }: OfficeSidePanelProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [editingSlideIdx, setEditingSlideIdx] = useState(0);

  // Sync state with props
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  if (!open) return null;

  // Handle local changes
  const handleHtmlChange = (newHtml: string) => {
    setContent((prev: any) => ({ ...prev, html: newHtml }));
  };

  const handleCellChange = (ref: string, val: string) => {
    setContent((prev: any) => {
      const updatedCells = { ...prev.cells };
      if (!updatedCells[ref]) {
        updatedCells[ref] = { v: val };
      } else {
        updatedCells[ref] = { ...updatedCells[ref], v: val };
      }
      return { ...prev, cells: updatedCells };
    });
  };

  const handleSlideChange = (idx: number, patch: { title?: string; body?: string }) => {
    setContent((prev: any) => {
      const updatedSlides = [...prev.slides];
      updatedSlides[idx] = { ...updatedSlides[idx], ...patch };
      return { ...prev, slides: updatedSlides };
    });
  };

  // Downloads
  const handleDownloadOriginal = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      let filename = `${title || 'export'}`;
      if (type === 'document') {
        blob = await exportDocx(title, content.html);
        filename += '.docx';
      } else if (type === 'spreadsheet') {
        const sheetsList = [{ name: 'Sheet1', cells: content.cells }];
        blob = await exportXlsx(title, sheetsList);
        filename += '.xlsx';
      } else {
        blob = await exportPptx(title, content.slides, 'office');
        filename += '.pptx';
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      if (type === 'document') {
        blob = await exportPdf(title, 'document', content.html);
      } else if (type === 'spreadsheet') {
        const sheetsList = [{ name: 'Sheet1', cells: content.cells }];
        blob = await exportPdf(title, 'spreadsheet', sheetsList);
      } else {
        blob = await exportPdf(title, 'presentation', content.slides);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'export'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Open in full Office workspace
  const handleOpenInOffice = () => {
    const projectId = `${type === 'document' ? 'doc' : type === 'spreadsheet' ? 'sheet' : 'pres'}-${Date.now()}`;
    if (type === 'document') {
      localStorage.setItem(`coxmox_doc_${projectId}`, JSON.stringify({ name: title, pages: [content.html] }));
      navigate(`/office/documents/${projectId}`);
    } else if (type === 'spreadsheet') {
      localStorage.setItem(`coxmox_sheet_${projectId}`, JSON.stringify({ name: title, sheets: [{ id: 's1', name: 'Sheet1', cells: content.cells }], activeSheetId: 's1' }));
      navigate(`/office/spreadsheets/${projectId}`);
    } else {
      localStorage.setItem(`coxmox_pres_${projectId}`, JSON.stringify({ name: title, slides: content.slides, currentIdx: 0 }));
      navigate(`/office/presentations/${projectId}`);
    }
  };

  // Grid references for spreadsheet
  const rows = Array.from({ length: 12 }, (_, i) => i + 1);
  const cols = Array.from({ length: 6 }, (_, i) => String.fromCharCode(65 + i)); // A..F

  return (
    <aside className="w-[420px] lg:w-[480px] flex-shrink-0 border-l border-white/5 bg-[#0b0b0d] flex flex-col overflow-hidden text-white relative z-30">
      {/* Header */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between bg-[#08080a]">
        <div className="flex items-center gap-2.5 min-w-0">
          {type === 'document' && <FileText className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />}
          {type === 'spreadsheet' && <FileSpreadsheet className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />}
          {type === 'presentation' && <Presentation className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs font-semibold bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500/30 rounded px-1 text-white truncate"
            placeholder="Document Title"
          />
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-[#0e0e11] flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'preview' ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'edit' ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit Text
          </button>
        </div>

        <button
          onClick={handleOpenInOffice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-500/20 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open in Office
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#070708]">
        {activeTab === 'preview' ? (
          /* Preview Mode */
          <div className="h-full">
            {type === 'document' && (
              <div className="bg-white text-black p-6 rounded-xl shadow-lg min-h-[500px] prose prose-sm max-w-none prose-headings:font-bold prose-p:my-2"
                dangerouslySetInnerHTML={{ __html: content.html || '<p class="text-gray-400">Empty Document</p>' }}
              />
            )}
            {type === 'spreadsheet' && (
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0b0b0d]">
                <table className="min-w-full border-collapse text-left text-xs text-white">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-2 border-r border-white/5 text-center text-muted-foreground bg-[#08080a] font-bold w-10"></th>
                      {cols.map(col => (
                        <th key={col} className="p-2 border-r border-white/5 text-center text-muted-foreground font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-2 border-r border-white/5 text-center text-muted-foreground bg-[#08080a] font-bold">{row}</td>
                        {cols.map(col => {
                          const ref = `${col}${row}`;
                          const cell = content.cells?.[ref] || {};
                          return (
                            <td key={col} className="p-2 border-r border-white/5 font-mono truncate max-w-[80px]">
                              {cell.v || ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {type === 'presentation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Slide {editingSlideIdx + 1} of {content.slides?.length || 0}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={editingSlideIdx === 0}
                      onClick={() => setEditingSlideIdx(prev => prev - 1)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] disabled:opacity-30 hover:bg-white/10"
                    >
                      Prev
                    </button>
                    <button
                      disabled={editingSlideIdx === (content.slides?.length || 1) - 1}
                      onClick={() => setEditingSlideIdx(prev => prev + 1)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] disabled:opacity-30 hover:bg-white/10"
                    >
                      Next
                    </button>
                  </div>
                </div>
                {content.slides && content.slides[editingSlideIdx] && (
                  <div className="aspect-video rounded-xl bg-zinc-900 border border-white/5 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {content.slides[editingSlideIdx].title?.replace(/<[^>]+>/g, '') || 'Slide Title'}
                      </h3>
                      <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: content.slides[editingSlideIdx].body || '' }}
                      />
                    </div>
                    {content.slides[editingSlideIdx].layout && (
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold self-end bg-white/5 px-2 py-0.5 rounded">
                        {content.slides[editingSlideIdx].layout} layout
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <div className="h-full">
            {type === 'document' && (
              <div className="flex flex-col h-full gap-2">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Raw HTML Content</label>
                <textarea
                  value={content.html || ''}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  className="w-full flex-1 min-h-[480px] p-3 rounded-xl bg-[#0b0b0d] border border-white/5 text-xs text-white font-mono outline-none focus:border-blue-500/40 resize-none leading-relaxed"
                />
              </div>
            )}
            {type === 'spreadsheet' && (
              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Edit Cell Values</p>
                <div className="grid grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {rows.slice(0, 10).map(row => (
                    cols.map(col => {
                      const ref = `${col}${row}`;
                      const cell = content.cells?.[ref] || {};
                      return (
                        <div key={ref} className="flex items-center gap-2 bg-[#0b0b0d] p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] font-bold text-muted-foreground font-mono w-6">{ref}</span>
                          <input
                            value={cell.v || ''}
                            onChange={(e) => handleCellChange(ref, e.target.value)}
                            className="bg-transparent border-none outline-none text-xs text-white w-full font-mono"
                            placeholder="empty"
                          />
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            )}
            {type === 'presentation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Editing Slide {editingSlideIdx + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={editingSlideIdx === 0}
                      onClick={() => setEditingSlideIdx(prev => prev - 1)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] disabled:opacity-30 hover:bg-white/10"
                    >
                      Prev
                    </button>
                    <button
                      disabled={editingSlideIdx === (content.slides?.length || 1) - 1}
                      onClick={() => setEditingSlideIdx(prev => prev + 1)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] disabled:opacity-30 hover:bg-white/10"
                    >
                      Next
                    </button>
                  </div>
                </div>
                {content.slides && content.slides[editingSlideIdx] && (
                  <div className="space-y-4 bg-[#0b0b0d] p-4 rounded-xl border border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Slide Title</label>
                      <input
                        value={content.slides[editingSlideIdx].title || ''}
                        onChange={(e) => handleSlideChange(editingSlideIdx, { title: e.target.value })}
                        className="w-full bg-[#0e0e11] border border-white/5 rounded-lg p-2.5 text-xs text-white outline-none focus:border-orange-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Slide Body</label>
                      <textarea
                        value={content.slides[editingSlideIdx].body || ''}
                        onChange={(e) => handleSlideChange(editingSlideIdx, { body: e.target.value })}
                        rows={6}
                        className="w-full bg-[#0e0e11] border border-white/5 rounded-lg p-2.5 text-xs text-white outline-none focus:border-orange-500/40 resize-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer export options */}
      <div className="p-4 bg-[#08080a] border-t border-white/5 flex gap-2 flex-shrink-0">
        <button
          onClick={handleDownloadOriginal}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-bold transition-all disabled:opacity-40"
        >
          {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Download Format
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold transition-all disabled:opacity-40"
        >
          {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download PDF
        </button>
      </div>
    </aside>
  );
}
