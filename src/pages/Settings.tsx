import { useState } from 'react';
import { Key, Palette, CreditCard, BarChart3, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';

const tabs = [
  { id: 'general', label: 'General', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { theme, toggleTheme, model, setModel } = useWorkspace();

  return (
    <div className="flex h-full">
      {/* Tabs */}
      <div className="w-[220px] border-r border-border p-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground mb-4">Settings</h2>
        <div className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-surface-active text-foreground font-medium"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">General</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage your workspace preferences</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground">Choose light or dark mode</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors capitalize"
                  >
                    {theme}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Default Model</p>
                    <p className="text-xs text-muted-foreground">Select default AI model</p>
                  </div>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border text-sm bg-surface text-foreground outline-none"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                    <option value="custom">Custom</option>
                    <option value="ollama">Local (Ollama)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage your API keys for AI models</p>
              </div>
              <div className="space-y-4">
                {['OpenAI', 'Anthropic', 'Custom'].map((provider) => (
                  <div key={provider} className="p-4 rounded-xl border border-border">
                    <label className="text-sm font-medium text-foreground">{provider} API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className="mt-2 w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-accent font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Billing</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payments</p>
              </div>
              <div className="p-6 rounded-xl border border-accent/30 bg-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-accent uppercase tracking-wider">Current Plan</span>
                    <h4 className="text-xl font-bold text-foreground mt-1">Pro</h4>
                    <p className="text-sm text-muted-foreground mt-1">$29/month · Renews Mar 15, 2026</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Usage</h3>
                <p className="text-sm text-muted-foreground mt-1">Token usage and statistics</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tokens Used', value: '1.2M', sub: 'This month' },
                  { label: 'Requests', value: '3,847', sub: 'This month' },
                  { label: 'Images', value: '128', sub: 'Generated' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>
              {/* Simple bar chart mock */}
              <div className="p-4 rounded-xl border border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">Daily Token Usage</h4>
                <div className="flex items-end gap-1.5 h-32">
                  {Array.from({ length: 14 }, (_, i) => {
                    const height = 20 + Math.random() * 80;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-accent/20 hover:bg-accent/40 rounded-t transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">Feb 1</span>
                  <span className="text-[10px] text-muted-foreground">Feb 14</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Models</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure AI model settings</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'GPT-4', provider: 'OpenAI', status: 'active' },
                  { name: 'GPT-4 Turbo', provider: 'OpenAI', status: 'active' },
                  { name: 'Claude 3', provider: 'Anthropic', status: 'active' },
                  { name: 'Custom Model', provider: 'Custom', status: 'inactive' },
                  { name: 'Ollama', provider: 'Local', status: 'inactive' },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        m.status === 'active' ? "bg-success" : "bg-muted-foreground/30"
                      )} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.provider}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
