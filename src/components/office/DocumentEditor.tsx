import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, List, ListOrdered, Link2, Image, Minus, Type, PaintBucket,
  Wand2, Loader2, Mic, Subscript, Superscript, Indent, Outdent, RemoveFormatting
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fontFamilies = ['Arial', 'Calibri', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Trebuchet MS', 'Garamond'];
const fontSizeLabels = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48', '72'];
const fontSizeMap: Record<string, string> = { '8': '1', '9': '1', '10': '1', '11': '2', '12': '3', '14': '4', '16': '4', '18': '5', '20': '5', '24': '6', '28': '6', '36': '7', '48': '7', '72': '7' };

const DocumentEditor = ({ isMobile, onContentChange }: { isMobile: boolean; onContentChange?: () => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [currentBlock, setCurrentBlock] = useState('p');
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentSize, setCurrentSize] = useState('12');
  const [showVoice, setShowVoice] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateActiveFormats();
    onContentChange?.();
  }, [onContentChange]);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'subscript', 'superscript'];
    cmds.forEach(cmd => { if (document.queryCommandState(cmd)) formats.add(cmd); });
    const block = document.queryCommandValue('formatBlock');
    setCurrentBlock(block || 'p');
    setActiveFormats(formats);
  }, []);

  const updateWordCount = useCallback(() => {
    const text = editorRef.current?.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const handler = () => { updateActiveFormats(); updateWordCount(); };
    editor.addEventListener('keyup', handler);
    editor.addEventListener('mouseup', handler);
    editor.addEventListener('input', () => onContentChange?.());
    document.addEventListener('selectionchange', handler);
    updateWordCount();
    return () => {
      editor.removeEventListener('keyup', handler);
      editor.removeEventListener('mouseup', handler);
      document.removeEventListener('selectionchange', handler);
    };
  }, [updateActiveFormats, updateWordCount, onContentChange]);

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          exec('insertImage', ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertTable = () => {
    const rows = parseInt(prompt('Number of rows:', '3') || '0');
    const cols = parseInt(prompt('Number of columns:', '3') || '0');
    if (rows > 0 && cols > 0) {
      let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0"><tbody>';
      for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
          html += `<td style="border:1px solid hsl(var(--border));padding:6px 8px;min-width:60px">${r === 0 ? `Header ${c + 1}` : ''}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table><p><br></p>';
      document.execCommand('insertHTML', false, html);
      onContentChange?.();
    }
  };

  const ToolBtn = ({ cmd, icon: Icon, label, active }: { cmd: string; icon: any; label: string; active?: boolean }) => (
    <button
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd)}
      className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-colors",
        (active ?? activeFormats.has(cmd)) ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar Row 1 */}
      <div className="border-b border-border flex items-center gap-1 px-2 sm:px-3 py-1 overflow-x-auto flex-shrink-0 bg-surface/50">
        <select value={currentBlock} onChange={(e) => { exec('formatBlock', e.target.value); setCurrentBlock(e.target.value); }}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-24">
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>
        <div className="w-px h-5 bg-border mx-0.5" />
        <select value={currentFont} onChange={(e) => { exec('fontName', e.target.value); setCurrentFont(e.target.value); }}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-28">
          {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={currentSize} onChange={(e) => { exec('fontSize', fontSizeMap[e.target.value] || '3'); setCurrentSize(e.target.value); }}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-14">
          {fontSizeLabels.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Toolbar Row 2 */}
      <div className="border-b border-border flex items-center gap-0.5 px-2 sm:px-3 py-1 overflow-x-auto flex-shrink-0 bg-surface/50">
        <ToolBtn cmd="undo" icon={Undo2} label="Undo (Ctrl+Z)" />
        <ToolBtn cmd="redo" icon={Redo2} label="Redo (Ctrl+Y)" />
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <ToolBtn cmd="bold" icon={Bold} label="Bold (Ctrl+B)" />
        <ToolBtn cmd="italic" icon={Italic} label="Italic (Ctrl+I)" />
        <ToolBtn cmd="underline" icon={Underline} label="Underline (Ctrl+U)" />
        <ToolBtn cmd="strikeThrough" icon={Strikethrough} label="Strikethrough" />
        <ToolBtn cmd="subscript" icon={Subscript} label="Subscript" />
        <ToolBtn cmd="superscript" icon={Superscript} label="Superscript" />
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <ToolBtn cmd="justifyLeft" icon={AlignLeft} label="Align Left" />
        <ToolBtn cmd="justifyCenter" icon={AlignCenter} label="Center" />
        <ToolBtn cmd="justifyRight" icon={AlignRight} label="Align Right" />
        <ToolBtn cmd="justifyFull" icon={AlignJustify} label="Justify" />
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <ToolBtn cmd="insertUnorderedList" icon={List} label="Bullet List" />
        <ToolBtn cmd="insertOrderedList" icon={ListOrdered} label="Numbered List" />
        <ToolBtn cmd="indent" icon={Indent} label="Indent" />
        <ToolBtn cmd="outdent" icon={Outdent} label="Outdent" />
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <button title="Insert Link" onMouseDown={(e) => e.preventDefault()} onClick={() => { const url = prompt('Enter URL:'); if (url) exec('createLink', url); }}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><Link2 className="w-3.5 h-3.5" /></button>
        <button title="Insert Image" onMouseDown={(e) => e.preventDefault()} onClick={handleInsertImage}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><Image className="w-3.5 h-3.5" /></button>
        <button title="Insert Table" onMouseDown={(e) => e.preventDefault()} onClick={handleInsertTable}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1" width="14" height="14" rx="1"/><line x1="1" y1="5.5" x2="15" y2="5.5"/><line x1="1" y1="10.5" x2="15" y2="10.5"/><line x1="5.5" y1="1" x2="5.5" y2="15"/><line x1="10.5" y1="1" x2="10.5" y2="15"/></svg>
        </button>
        <button title="Horizontal Rule" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertHorizontalRule')}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><Minus className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <button title="Text Color" onMouseDown={(e) => e.preventDefault()} onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = '#000000';
          input.onchange = () => exec('foreColor', input.value);
          input.click();
        }} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><Type className="w-3.5 h-3.5" /></button>
        <button title="Highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = '#ffff00';
          input.onchange = () => exec('hiliteColor', input.value);
          input.click();
        }} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><PaintBucket className="w-3.5 h-3.5" /></button>
        <button title="Clear Formatting" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"><RemoveFormatting className="w-3.5 h-3.5" /></button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4 sm:p-8 relative">
        <div className={cn("bg-card border border-border shadow-sm rounded-sm", isMobile ? "w-full min-h-[500px]" : "w-[816px] min-h-[1056px]")}
          style={{ padding: isMobile ? '24px' : '96px 72px' }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none text-foreground text-sm leading-relaxed min-h-[200px] prose prose-sm max-w-none
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
              [&_h4]:text-base [&_h4]:font-medium [&_h4]:mb-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_pre]:bg-muted/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
              [&_li]:mb-1
              [&_a]:text-accent [&_a]:underline
              [&_hr]:border-border [&_hr]:my-4
              [&_table]:border-collapse [&_table]:w-full [&_table]:my-2
              [&_td]:border [&_td]:border-border [&_td]:p-1.5 [&_td]:text-xs
              [&_th]:border [&_th]:border-border [&_th]:p-1.5 [&_th]:text-xs [&_th]:font-semibold [&_th]:bg-muted/30
              [&_img]:max-w-full [&_img]:rounded [&_img]:my-2"
            dangerouslySetInnerHTML={{ __html: `
              <h1>Untitled Document</h1>
              <p>Start typing here. Use the toolbar above to format your text — <b>bold</b>, <i>italic</i>, <u>underline</u>, headings, lists, and more.</p>
              <h2>Getting Started</h2>
              <p>This is a full-featured document editor. You can:</p>
              <ul>
                <li>Format text with <b>bold</b>, <i>italic</i>, <u>underline</u>, and <s>strikethrough</s></li>
                <li>Create headings, lists, and blockquotes</li>
                <li>Insert links, images, tables, and horizontal rules</li>
                <li>Change fonts, sizes, and colors</li>
                <li>Use keyboard shortcuts like <b>Ctrl+B</b>, <b>Ctrl+I</b>, <b>Ctrl+U</b></li>
              </ul>
              <p></p>
            ` }}
          />
        </div>

        {/* Floating voice button */}
        <button
          onClick={() => setShowVoice(!showVoice)}
          className={cn("fixed bottom-20 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 transition-all",
            showVoice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105")}
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>
        {showVoice && (
          <div className="fixed bottom-36 right-6 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 z-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">Listening...</span>
            </div>
            <div className="flex items-center justify-center gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 bg-accent/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">Speak to dictate text</p>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="h-6 border-t border-border flex items-center justify-between px-3 bg-surface/50 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground">{wordCount} words</span>
        <span className="text-[10px] text-muted-foreground">100%</span>
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to write, edit, summarize, or format your document..." onGenerate={() => {}} />
      </div>
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
      <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[120px] overflow-y-auto"
        placeholder={placeholder} rows={1} />
      <div className="flex justify-end px-1">
        <button onClick={() => { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); onGenerate(prompt); }, 2000); }}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium flex items-center gap-2 disabled:opacity-30">
          {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
        </button>
      </div>
    </div>
  );
};

export default DocumentEditor;
