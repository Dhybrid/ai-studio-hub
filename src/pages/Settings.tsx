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
  const { theme, themeMode, setThemeMode, user, setUser, model, setModel } = useWorkspace();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);
  const [lang, setLang] = useState('en');

  const groups = [...new Set(tabs.map((t) => t.group))];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0",
        value ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
          value ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );

  const SectionHead = ({ title, desc }: { title: string; desc: string }) => (
    <div className="mb-6">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">{desc}</p>
    </div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {desc && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-light">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center gap-3 h-14 px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 md:p-4 flex-shrink-0 bg-white/50 dark:bg-slate-900/50">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
            {groups.map((group) => (
              <div key={group} className="contents md:block">
                <p className="hidden md:block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mt-4 mb-1 first:mt-0">
                  {group}
                </p>
                {tabs.filter((t) => t.group === group).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-colors font-medium",
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  <SectionHead title="Profile" desc="Your personal account information and guest credentials" />
                  {/* Avatar */}
                  <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-4 shadow-2xs">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-sm">
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-light">{user.email}</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mt-1.5 inline-block">
                        {user.isGuest ? 'Guest User' : 'Verified User'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newName = prompt('Enter new display name:', user.name);
                        if (newName) {
                          setUser({ ...user, name: newName, initials: newName.slice(0, 2).toUpperCase() });
                        }
                      }}
                      className="ml-auto px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 px-5 shadow-2xs">
                    <Row label="Display Name" desc="Shown across the platform">
                      <input
                        className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors w-32 text-right"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                      />
                    </Row>
                    <Row label="Language" desc="Interface language">
                      <select value={lang} onChange={(e) => setLang(e.target.value)} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                      </select>
                    </Row>
                    <Row label="Timezone" desc="Used for timestamps">
                      <span className="text-xs text-slate-500 dark:text-slate-400">UTC+1 (WAT)</span>
                    </Row>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Appearance" desc="Customize how Eruwa looks and feels. Default is Light Mode." />
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 px-5 mb-4 shadow-2xs">
                    <Row label="Theme Mode" desc="Default is Light Mode. Change to Dark Mode or match System preference.">
                      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {[
                          { icon: Sun, label: 'light', name: 'Light (Default)' },
                          { icon: Moon, label: 'dark', name: 'Dark' },
                          { icon: Monitor, label: 'system', name: 'System' }
                        ].map(({ icon: Icon, label, name }) => (
                          <button
                            key={label}
                            onClick={() => setThemeMode(label as 'light' | 'dark' | 'system')}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                              themeMode === label
                                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{name}</span>
                          </button>
                        ))}
                      </div>
                    </Row>
                    <Row label="Default AI Model" desc="Used across all modules">
                      <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none">
                        <option value="gpt-4">GPT-4</option>
                        <option value="grok-4.3">Grok 4.3</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                        <option value="gemini-pro">Gemini Pro</option>
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
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 px-5 shadow-2xs">
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
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 px-5 mb-4 shadow-2xs">
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
                  <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mb-3">Permanently delete all your data and local browser cache.</p>
                    <button
                      onClick={() => {
                        if (confirm('Clear local cache and reset browser tabs?')) {
                          localStorage.clear();
                          window.location.href = '/';
                        }
                      }}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      Reset Local Data
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscriptions' && (
                <motion.div key="subscriptions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Subscriptions" desc="Manage per-module access and plan features" />
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-6 flex items-center justify-between gap-4 shadow-2xs">
                    <div>
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Current Plan</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Eruwa Free / Guest</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-light">Full local access to Documents, Sheet, Slide, PDF & AI Chat</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div key="billing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Billing" desc="Manage payment methods and invoices" />
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-6 shadow-2xs">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No active billing obligations on guest account.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'usage' && (
                <motion.div key="usage" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionHead title="Usage & Limits" desc="Track your consumption across modules" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Requests', value: '342', limit: '10,000', pct: 34 },
                      { label: 'Tabs Created', value: '18', limit: 'Unlimited', pct: 100 },
                      { label: 'Office Docs', value: '6', limit: '500', pct: 12 },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                        <div className="mt-2 h-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${stat.pct}%` }} />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">of {stat.limit}</p>
                      </div>
                    ))}
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
