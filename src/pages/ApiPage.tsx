import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Key, Copy, Eye, EyeOff, Plus, Trash2,
  CheckCircle, AlertTriangle, Sparkles, RefreshCw, Shield, Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ApiKeyEntry = {
  id: string;
  name: string;
  provider: string;
  key: string;
  created: string;
  status: 'active' | 'error' | 'unset';
};

const PROVIDERS = [
  { id: 'xai', label: 'xAI Grok', color: 'text-cyan-400', storageKey: 'coxmox_api_key_xai', placeholder: 'xai-...' },
  { id: 'groq', label: 'Groq', color: 'text-pink-400', storageKey: 'coxmox_api_key_groq', placeholder: 'gsk_...' },
  { id: 'gemini', label: 'Google Gemini', color: 'text-blue-400', storageKey: 'coxmox_api_key_gemini', placeholder: 'AIzaSy...' },
  { id: 'openai', label: 'OpenAI', color: 'text-emerald-400', storageKey: 'coxmox_api_key_openai', placeholder: 'sk-proj-...' },
  { id: 'anthropic', label: 'Anthropic Claude', color: 'text-orange-400', storageKey: 'coxmox_api_key_anthropic', placeholder: 'sk-ant-...' },
  { id: 'huggingface', label: 'Hugging Face', color: 'text-yellow-400', storageKey: 'coxmox_api_key_huggingface', placeholder: 'hf_...' },
  { id: 'ollama', label: 'Ollama (Local)', color: 'text-purple-400', storageKey: 'coxmox_api_url_ollama', placeholder: 'http://localhost:11434' },
];

const ApiPage = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    PROVIDERS.forEach((p) => {
      result[p.id] = localStorage.getItem(p.storageKey) || '';
    });
    return result;
  });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<'keys' | 'developer' | 'webhooks'>('keys');

  const [coxmoxKeys] = useState<ApiKeyEntry[]>([
    { id: 'k1', name: 'Production Key', provider: 'COXMOX', key: 'coxmox_live_xxxxxxxx', created: 'Dec 1, 2025', status: 'active' },
    { id: 'k2', name: 'Dev Key', provider: 'COXMOX', key: 'coxmox_test_yyyyyyyy', created: 'Nov 20, 2025', status: 'active' },
  ]);

  const handleSave = (providerId: string, storageKey: string) => {
    localStorage.setItem(storageKey, keys[providerId]);
    localStorage.setItem('coxmox_provider', providerId);
    if (providerId === 'xai') {
      localStorage.setItem('coxmox_model_name', 'grok-4.3');
    }
    if (providerId === 'groq') {
      localStorage.setItem('coxmox_model_name', 'llama-3.3-70b-versatile');
    }
    setSaved((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [providerId]: false })), 2000);
  };

  const sections = [
    { id: 'keys', label: 'AI Provider Keys', icon: Key },
    { id: 'developer', label: 'COXMOX API Keys', icon: Code2 },
    { id: 'webhooks', label: 'Webhooks', icon: RefreshCw },
  ] as const;

  return (
    <div className="min-h-screen bg-[#070708] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070708]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h1 className="text-sm font-semibold text-white">API & Developer</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3 text-emerald-400" />
            Keys stored locally
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-white/5 p-3 md:p-4 flex-shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors font-medium",
                  activeSection === s.id
                    ? "bg-white/8 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              {activeSection === 'keys' && (
                <motion.div key="keys" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-white">AI Provider Keys</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-light">
                      Add your own API keys to use external AI models. Keys are stored locally in your browser.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3 mb-6">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-yellow-200/70 font-light leading-relaxed">
                      Keys are only stored in your browser's localStorage — they are never sent to our servers. Use environment variables or a secure vault in production.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PROVIDERS.map((provider) => {
                      const val = keys[provider.id] || '';
                      const isVisible = visible[provider.id];
                      const isSaved = saved[provider.id];
                      const hasValue = val.length > 0;
                      return (
                        <div key={provider.id} className="p-4 rounded-2xl border border-white/5 bg-[#0b0b0d]">
                          <div className="flex items-center justify-between mb-3">
                            <label className={cn("text-xs font-bold", provider.color)}>{provider.label}</label>
                            {hasValue && (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                                <CheckCircle className="w-3 h-3" /> Configured
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={isVisible ? 'text' : 'password'}
                                value={val}
                                onChange={(e) => setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                                placeholder={provider.placeholder}
                                className="w-full px-3 py-2.5 pr-9 rounded-xl bg-[#0e0e11] border border-white/5 text-xs text-white outline-none focus:border-blue-500/40 transition-colors font-mono placeholder:text-muted-foreground/50"
                              />
                              <button
                                onClick={() => setVisible((prev) => ({ ...prev, [provider.id]: !isVisible }))}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleSave(provider.id, provider.storageKey)}
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0",
                                isSaved
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                  : "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                              )}
                            >
                              {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : 'Save'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeSection === 'developer' && (
                <motion.div key="developer" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">COXMOX API Keys</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-light">
                        Use these keys to access the COXMOX API programmatically.
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors font-medium">
                      <Plus className="w-3 h-3" /> New Key
                    </button>
                  </div>

                  <div className="space-y-3 mb-8">
                    {coxmoxKeys.map((entry) => (
                      <div key={entry.id} className="p-4 rounded-2xl border border-white/5 bg-[#0b0b0d]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <p className="text-xs font-bold text-white">{entry.name}</p>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                              {entry.status}
                            </span>
                          </div>
                          <button className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0e0e11] rounded-lg px-3 py-2 border border-white/5">
                          <span className="text-[11px] font-mono text-muted-foreground flex-1">{entry.key}</span>
                          <button className="text-muted-foreground hover:text-white transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-2">Created {entry.created}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-2xl border border-white/5 bg-[#0b0b0d]">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Quick Start</p>
                    <div className="rounded-xl bg-[#0e0e11] border border-white/5 p-4 font-mono text-[10px] text-emerald-400 leading-relaxed">
                      <span className="text-muted-foreground"># Install</span><br />
                      npm install @coxmox/sdk<br /><br />
                      <span className="text-muted-foreground"># Initialize</span><br />
                      <span className="text-blue-400">import</span> {'{ CoxmoxClient }'} <span className="text-blue-400">from</span> '@coxmox/sdk';<br />
                      <span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-yellow-400">CoxmoxClient</span>({'{'} apiKey: <span className="text-emerald-400">'YOUR_KEY'</span> {'}'});
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'webhooks' && (
                <motion.div key="webhooks" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Webhooks</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-light">
                        Receive real-time HTTP callbacks when events occur in your workspace.
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors font-medium">
                      <Plus className="w-3 h-3" /> Add Endpoint
                    </button>
                  </div>

                  <div className="text-center py-16 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-light">No webhooks configured</p>
                    <p className="text-xs opacity-50 mt-1">Add an endpoint to start receiving events.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;
