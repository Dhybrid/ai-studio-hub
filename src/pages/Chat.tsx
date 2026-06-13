import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, Square, Mic, Sparkles, Image, Edit, Search, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/hooks/useWorkspace';
import { routeAgent } from '@/lib/agentApi';
import { estimateTokens, extractCodeSnippets } from '@/lib/markdown';
import RichMarkdown from '@/components/chat/RichMarkdown';
import CodeSidePanel from '@/components/chat/CodeSidePanel';
import OfficeSidePanel from '@/components/chat/OfficeSidePanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

interface ImageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
}

const ChatPage = () => {
  const { chats, addChat, updateChatMessages, chatKey } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const chatId = searchParams.get('id');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>();
  
  // Office View Panel states
  const [officePanelOpen, setOfficePanelOpen] = useState(false);
  const [officePanelType, setOfficePanelType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [officePanelTitle, setOfficePanelTitle] = useState('');
  const [officePanelContent, setOfficePanelContent] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const centerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPromptRun = useRef(false);
  const isMobile = useIsMobile();

  // Load chat from history
  useEffect(() => {
    if (chatId) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setMessages(chat.messages || []);
        setOfficePanelOpen(false);
      }
    } else {
      setMessages([]);
      setOfficePanelOpen(false);
    }
  }, [chatId, chats]);

  // Reset chat when chatKey changes (New Chat clicked)
  useEffect(() => {
    if (chatKey > 0) {
      setSearchParams({});
      setMessages([]);
      setInput('');
      setImageAttachments([]);
      setIsStreaming(false);
      setOfficePanelOpen(false);
    }
  }, [chatKey]);

  const codeSnippets = messages.flatMap((message) =>
    message.role === 'assistant' ? extractCodeSnippets(message.content) : []
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resize textareas
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const el = centerTextareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;
    const attachedImages = imageAttachments;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: attachedImages.length ? `${text}\n\n[${attachedImages.length} image${attachedImages.length === 1 ? '' : 's'} attached]` : text,
      timestamp: new Date(),
      tokens: estimateTokens(text),
    };

    const assistantId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      tokens: 0,
    };

    const nextMessages = [...messages, userMsg, aiMsg];
    setMessages(nextMessages);
    setInput('');
    setImageAttachments([]);
    setIsStreaming(true);

    let activeChatId = chatId;
    if (!activeChatId) {
      // Create new chat session
      const title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      activeChatId = addChat(title, nextMessages);
      setSearchParams({ id: activeChatId });
    }

    try {
      const result = await routeAgent(text, {
        images: attachedImages.map((img) => ({
          url: img.url,
          name: img.name,
          type: img.type,
          detail: 'high',
        })),
      }); // Route naturally
      const route = result.route;
      const content = result.generated_content || {};

      let reply = '';
      if (route === 'office-document') {
        reply = `I have generated the document **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('document');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-spreadsheet') {
        reply = `I have generated the spreadsheet **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('spreadsheet');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-presentation') {
        reply = `I have generated the presentation **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('presentation');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else {
        reply = String(content.reply || content.markdown || content.html || 'I could not generate a response.');
        setOfficePanelOpen(false);
      }

      const updatedMessages = nextMessages.map((message) =>
        message.id === assistantId ? { ...message, content: reply, tokens: estimateTokens(reply) } : message
      );

      setMessages(updatedMessages);
      updateChatMessages(activeChatId, updatedMessages);

      if (route === 'chat') {
        const snippets = extractCodeSnippets(reply);
        if (snippets.length) {
          setSelectedCodeId(snippets[0].id);
          setCodePanelOpen(true);
        }
      }
    } catch {
      const errorText = 'I could not reach the backend agent. Make sure the backend is running on `http://localhost:8000`, then try again.';
      const updatedMessages = nextMessages.map((message) =>
        message.id === assistantId ? { ...message, content: errorText, tokens: estimateTokens(errorText) } : message
      );
      setMessages(updatedMessages);
      updateChatMessages(activeChatId, updatedMessages);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => /image\/(png|jpe?g)/i.test(file.type));
    if (!selected.length) return;

    selected.slice(0, 8 - imageAttachments.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || '');
        if (!url) return;
        setImageAttachments((current) => [
          ...current,
          { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, url },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const openImagePicker = () => fileInputRef.current?.click();

  useEffect(() => {
    const routedPrompt = searchParams.get('prompt') || '';
    if (!routedPrompt.trim() || initialPromptRun.current) return;
    initialPromptRun.current = true;
    handleSend(routedPrompt);
  }, [searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openCode = (snippet: CodeSnippet) => {
    const existing = codeSnippets.find((item) => item.language === snippet.language && item.code === snippet.code);
    setSelectedCodeId(existing?.id || snippet.id);
    setCodePanelOpen(true);
    setOfficePanelOpen(false);
  };

  return (
    <div className="flex h-full bg-[#070708] text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => {
          handleImageFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {/* Center Chat */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {messages.length === 0 ? (
          /* Empty State - Centered Input */
          <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-8">
                What's on the agenda today?
              </h2>

              {/* Centered Input Box */}
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5 focus-within:from-blue-500/50 focus-within:to-indigo-500/20 transition-all duration-500 shadow-xl mb-5">
                <div className="flex items-end gap-2 bg-[#0b0b0d]/90 backdrop-blur-xl rounded-[15px] p-3">
                  <button onClick={openImagePicker} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white" title="Attach image">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    ref={centerTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-2 text-white placeholder:text-muted-foreground/60 max-h-32 font-light"
                    style={{ minHeight: '36px' }}
                  />
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-20 bg-white text-black hover:scale-105 active:scale-95 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {imageAttachments.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {imageAttachments.map((img) => (
                    <div key={img.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      <img src={img.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="max-w-[140px] truncate text-[10px] text-white/80">{img.name}</span>
                      <button onClick={() => setImageAttachments((items) => items.filter((item) => item.id !== img.id))} className="text-muted-foreground hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: Image, label: 'Create an image', text: 'Generate a high quality visual mockup of a login page' },
                  { icon: Edit, label: 'Write or edit', text: 'Write a professional email proposal to my team' },
                  { icon: Search, label: 'Look something up', text: 'Explain React Server Components and their benefits' }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setInput(chip.text);
                      centerTextareaRef.current?.focus();
                    }}
                    className="text-[10px] text-muted-foreground hover:text-white bg-[#0e0e11]/60 hover:bg-[#121216] border border-white/5 hover:border-white/10 rounded-full px-4 py-2 transition-colors flex items-center gap-1.5"
                  >
                    <chip.icon className="w-3.5 h-3.5" />
                    {chip.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Messages Feed */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-5 py-4 max-w-[85%] text-sm leading-relaxed border",
                        msg.role === 'user'
                          ? "bg-white/5 border-white/10 text-white shadow-sm"
                          : "bg-transparent border-transparent text-white"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className={cn(
                            "prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-400 prose-code:font-mono prose-code:text-xs",
                            isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor"
                          )}
                        >
                          <RichMarkdown content={msg.content} onOpenCode={openCode} />
                        </div>
                      ) : (
                        <p className="font-light">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white shadow-md">
                        IK
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isStreaming && (
                <div className="flex items-center gap-2.5 text-muted-foreground text-xs ml-12">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 typing-dot" />
                  </div>
                  <span className="font-light">Compiling response...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* Input Bar (Only shown when messages exist) */}
        {messages.length > 0 && (
          <div className="border-t border-white/5 p-4 bg-[#070708]/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto">
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5 focus-within:from-blue-500/50 focus-within:to-indigo-500/20 transition-all duration-500">
                <div className="flex items-end gap-2 bg-[#0b0b0d]/90 backdrop-blur-xl rounded-[15px] p-2.5">
                  <button onClick={openImagePicker} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white" title="Attach image">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message COXMOX..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-2 text-white placeholder:text-muted-foreground max-h-32 font-light"
                    style={{ minHeight: '36px' }}
                  />
                  {isStreaming ? (
                    <button
                      onClick={() => setIsStreaming(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <Square className="w-3.5 h-3.5 fill-red-500" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-20 bg-white text-black hover:scale-105 active:scale-95"
                      style={{
                        boxShadow: input.trim() ? '0 0 15px rgba(255, 255, 255, 0.2)' : 'none'
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {imageAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageAttachments.map((img) => (
                    <div key={img.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      <img src={img.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="max-w-[140px] truncate text-[10px] text-white/80">{img.name}</span>
                      <button onClick={() => setImageAttachments((items) => items.filter((item) => item.id !== img.id))} className="text-muted-foreground hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2.5 font-light">
                COXMOX Core v2.0 · Local sandbox compilation is fully active.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Code Sidebar Panel */}
      <CodeSidePanel
        open={codePanelOpen}
        snippets={codeSnippets}
        selectedId={selectedCodeId}
        onSelect={setSelectedCodeId}
        onClose={() => setCodePanelOpen(false)}
      />

      {/* Office Workspace Sidebar Preview/Editor Panel */}
      <OfficeSidePanel
        open={officePanelOpen}
        onClose={() => setOfficePanelOpen(false)}
        type={officePanelType}
        title={officePanelTitle}
        content={officePanelContent}
      />
    </div>
  );
};

export default ChatPage;
