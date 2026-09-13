import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Palette, Bell, Shield, CreditCard, BarChart3,
  BookOpen, FileSpreadsheet, MessageSquare, ChevronRight, Check,
  Globe, Moon, Sun, Monitor, Sparkles, Zap, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';

type TabId = 'profile' | 'appearance' | 'notifications' | 'privacy' | 'subscriptions' | 'billing' | 'usage';

const tabs: { id: TabId; label: string; icon: React.ElementType; group: string }[] = [
  { id: 'profile', label: 'Profile', icon: User, group: 'Account' },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'Account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Account' },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, group: 'Account' },
  { id: 'subscriptions', label: 'Subscriptions', icon: Sparkles, group: 'Plan' },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'Plan' },
  { id: 'usage', label: 'Usage & Limits', icon: BarChart3, group: 'Plan' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams<{ tab?: TabId }>();
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'profile');
  const { theme, toggleTheme, model, setModel } = useWorkspace();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);
  const [lang, setLang] = useState('en');

  const groups = [...new Set(tabs.map((t) => t.group))];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0",
        value ? "bg-blue-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow",
          value ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );

  const SectionHead = ({ title, desc }: { title: string; desc: string }) => (
    <div className="mb-6">
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 font-light">{desc}</p>
    </div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-[11px] text-muted-foreground mt-0.5 font-light">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

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
          <h1 className="text-sm font-semibold text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-white/5 p-3 md:p-4 flex-shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
            {groups.map((group) => (
              <div key={group} className="contents md:block">
                <p className="hidden md:block text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 mt-4 mb-1 first:mt-0">
                  {group}
                </p>
                {tabs.filter((t) => t.group === group).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors font-medium",
                      activeTab === tab.id
                        ? "bg-white/8 text-white"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Profile" desc="Your personal account information" />
                  {/* Avatar */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-[#0b0b0d] mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-lg font-bold text-white">
                      IK
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Iikogha</p>
                      <p className="text-xs text-muted-foreground font-light">iikogha@example.com</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-1.5 inline-block">
                        Student Pro
                      </span>
                    </div>
                    <button className="ml-auto px-3 py-1.5 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-[#0b0b0d] divide-y divide-white/5 px-5">
                    <Row label="Display Name" desc="Shown across the platform">
                      <input className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-blue-500/50 transition-colors w-32 text-right" defaultValue="Iikogha" />
                    </Row>
                    <Row label="Language" desc="Interface language">
                      <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </Row>
                    <Row label="Timezone" desc="Used for timestamps">
                      <span className="text-xs text-muted-foreground">UTC+1 (WAT)</span>
                    </Row>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Appearance" desc="Customize how Eruwa looks and feels" />
                  <div className="rounded-2xl border border-white/5 bg-[#0b0b0d] divide-y divide-white/5 px-5 mb-4">
                    <Row label="Theme" desc="Light, Dark, or System preference">
                      <div className="flex gap-1">
                        {[{ icon: Sun, label: 'light' }, { icon: Moon, label: 'dark' }, { icon: Monitor, label: 'system' }].map(({ icon: Icon, label }) => (
                          <button
                            key={label}
                            onClick={() => label !== 'system' && toggleTheme()}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors border",
                              theme === label
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : "border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </Row>
                    <Row label="Default AI Model" desc="Used across all modules">
                      <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none">
                        <option value="gpt-4">GPT-4</option>
                        <option value="grok-4.3">Grok 4.3</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="ollama">Local (Ollama)</option>
                      </select>
                    </Row>
                    <Row label="Compact Mode" desc="Denser UI for power users">
                      <Toggle value={false} onChange={() => {}} />
                    </Row>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Notifications" desc="Control when and how you receive alerts" />
                  <div className="rounded-2xl border border-white/5 bg-[#0b0b0d] divide-y divide-white/5 px-5">
                    <Row label="Email notifications" desc="Receive summaries and alerts by email">
                      <Toggle value={notifEmail} onChange={() => setNotifEmail(!notifEmail)} />
                    </Row>
                    <Row label="Product updates" desc="New features and changelog announcements">
                      <Toggle value={notifUpdates} onChange={() => setNotifUpdates(!notifUpdates)} />
                    </Row>
                    <Row label="Cereva session reminders" desc="Daily study nudges from your AI teacher">
                      <Toggle value={false} onChange={() => {}} />
                    </Row>
                    <Row label="Office collaboration" desc="Notify when a file is shared with you">
                      <Toggle value={true} onChange={() => {}} />
                    </Row>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div key="privacy" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Privacy & Security" desc="Manage how your data is used and protected" />
                  <div className="rounded-2xl border border-white/5 bg-[#0b0b0d] divide-y divide-white/5 px-5 mb-4">
                    <Row label="Data training opt-out" desc="Your conversations won't be used to train models">
                      <Toggle value={true} onChange={() => {}} />
                    </Row>
                    <Row label="Session history" desc="Allow Eruwa to store your chat history">
                      <Toggle value={true} onChange={() => {}} />
                    </Row>
                    <Row label="Analytics" desc="Help improve the product with anonymous usage data">
                      <Toggle value={false} onChange={() => {}} />
                    </Row>
                  </div>
                  <div className="p-4 rounded-2xl border border-red-500/10 bg-red-500/5">
                    <p className="text-xs font-bold text-red-400 mb-1">Danger Zone</p>
                    <p className="text-[11px] text-muted-foreground font-light mb-3">Permanently delete all your data and account.</p>
                    <button className="px-4 py-2 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscriptions' && (
                <motion.div key="subscriptions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Subscriptions" desc="Manage per-module access and plan features" />

                  {/* Current plan */}
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-6 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Current Plan</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <h4 className="text-base font-bold text-white">Student Pro</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-light">$29/month · Renews Jan 15, 2026</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-white hover:border-white/20 transition-colors flex-shrink-0">
                      Upgrade
                    </button>
                  </div>

                  {/* Per-module toggles */}
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Module Access</p>
                  <div className="space-y-3">
                    {[
                      { icon: MessageSquare, label: 'AI Chat', desc: 'Core assistant · Included in all plans', color: 'text-blue-400', active: true, locked: false },
                      { icon: BookOpen, label: 'Cereva', desc: 'AI Teaching module · Pro plan required', color: 'text-emerald-400', active: true, locked: false },
                      { icon: FileSpreadsheet, label: 'Office Studio', desc: 'Documents, Sheets & Slides · Pro plan required', color: 'text-yellow-400', active: true, locked: false },
                      { icon: Globe, label: 'Web Builder', desc: 'Coming soon · Business plan', color: 'text-blue-300', active: false, locked: true },
                      { icon: Zap, label: 'Image Studio', desc: 'Coming soon · Business plan', color: 'text-pink-400', active: false, locked: true },
                    ].map((mod) => (
                      <div
                        key={mod.label}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border",
                          mod.active ? "border-white/5 bg-[#0b0b0d]" : "border-white/5 bg-[#0b0b0d] opacity-50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0")}>
                          <mod.icon className={cn("w-4 h-4", mod.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{mod.label}</p>
                          <p className="text-[10px] text-muted-foreground font-light">{mod.desc}</p>
                        </div>
                        {mod.locked
                          ? <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider border border-white/10 rounded-full px-2 py-0.5">Locked</span>
                          : <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        }
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div key="billing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Billing" desc="Manage your subscription, invoices and payment methods" />
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Active Subscription</p>
                        <p className="text-lg font-bold text-white mt-1">Student Pro · $29<span className="text-sm font-light text-muted-foreground">/mo</span></p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Next billing: January 15, 2026</p>
                      </div>
                      <button className="px-4 py-2 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Payment Method</p>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0b0b0d] mb-6">
                    <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white tracking-wider">VISA</span>
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">•••• •••• •••• 4242</p>
                      <p className="text-[10px] text-muted-foreground">Expires 12/27</p>
                    </div>
                    <button className="ml-auto text-[10px] text-muted-foreground hover:text-white transition-colors">Update</button>
                  </div>

                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Recent Invoices</p>
                  <div className="rounded-xl border border-white/5 bg-[#0b0b0d] divide-y divide-white/5">
                    {[
                      { date: 'Dec 15, 2025', amount: '$29.00', status: 'Paid' },
                      { date: 'Nov 15, 2025', amount: '$29.00', status: 'Paid' },
                      { date: 'Oct 15, 2025', amount: '$29.00', status: 'Paid' },
                    ].map((inv) => (
                      <div key={inv.date} className="flex items-center justify-between px-4 py-3">
                        <p className="text-xs text-muted-foreground">{inv.date}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">{inv.status}</span>
                          <p className="text-xs font-mono text-white font-medium">{inv.amount}</p>
                          <button className="text-[10px] text-muted-foreground hover:text-white transition-colors">PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'usage' && (
                <motion.div key="usage" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Usage & Limits" desc="Track your consumption across all modules this month" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Requests', value: '3,847', limit: '10,000', pct: 38 },
                      { label: 'Chat Sessions', value: '142', limit: '500', pct: 28 },
                      { label: 'Cereva Sessions', value: '31', limit: '100', pct: 31 },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 rounded-xl border border-white/5 bg-[#0b0b0d]">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                        <div className="mt-2 h-1 rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${stat.pct}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">of {stat.limit}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-3">Daily Activity</p>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0b0b0d]">
                    <div className="flex items-end gap-1.5 h-24">
                      {Array.from({ length: 30 }, (_, i) => {
                        const h = 15 + Math.sin(i * 0.7) * 40 + Math.random() * 30;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-blue-500/20 hover:bg-blue-500/40 transition-colors cursor-pointer"
                            style={{ height: `${Math.max(8, h)}%` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] text-muted-foreground">Dec 1</span>
                      <span className="text-[9px] text-muted-foreground">Dec 30</span>
                    </div>
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

export default SettingsPage;
