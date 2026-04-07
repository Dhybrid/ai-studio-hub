import { useState } from 'react';
import { FileSpreadsheet, Presentation, FileText, Download, Share2, Printer, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import SpreadsheetEditor from '@/components/office/SpreadsheetEditor';
import DocumentEditor from '@/components/office/DocumentEditor';
import PresentationEditor from '@/components/office/PresentationEditor';

type OfficeMode = 'document' | 'spreadsheet' | 'presentation';

const OfficeEditor = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') as OfficeMode | null;
  const mode: OfficeMode = modeParam && ['document', 'spreadsheet', 'presentation'].includes(modeParam) ? modeParam : 'document';
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showFileMenu, setShowFileMenu] = useState(false);

  const modeConfig: Record<OfficeMode, { icon: any; label: string; color: string }> = {
    document: { icon: FileText, label: 'Document', color: 'text-blue-500' },
    spreadsheet: { icon: FileSpreadsheet, label: 'Spreadsheet', color: 'text-green-500' },
    presentation: { icon: Presentation, label: 'Presentation', color: 'text-orange-500' },
  };

  const m = modeConfig[mode];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header bar */}
      <div className="h-11 flex items-center justify-between px-3 sm:px-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/office')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1.5">
            <m.icon className={cn("w-4 h-4", m.color)} />
            <span className="text-sm font-semibold text-foreground">{m.label}</span>
          </div>
          {!isMobile && (
            <>
              <div className="w-px h-5 bg-border ml-2" />
              <div className="flex items-center gap-0.5 ml-1">
                {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Help'].map(menu => (
                  <button key={menu} className="px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors">{menu}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isMobile && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface-hover transition-colors"><Share2 className="w-3.5 h-3.5" /> Share</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Printer className="w-4 h-4" /></button>
            </>
          )}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Download className="w-4 h-4" /></button>
          {isMobile && (
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {mode === 'document' && <DocumentEditor isMobile={isMobile} />}
      {mode === 'spreadsheet' && <SpreadsheetEditor isMobile={isMobile} />}
      {mode === 'presentation' && <PresentationEditor isMobile={isMobile} />}
    </div>
  );
};

export default OfficeEditor;
