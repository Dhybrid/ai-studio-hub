import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  User, Plus, UserPlus, Settings, Palette, HelpCircle,
  LogOut, ChevronDown, ChevronRight, Sun, Moon, Monitor, Check, X,
  Pencil, Sparkles
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useBrowserTabs, UserProfile } from '@/hooks/useBrowserTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const UserProfileModal = () => {
  const { themeMode, setThemeMode } = useWorkspace();
  const { profiles, activeProfile, switchProfile, addProfile, openTab } = useBrowserTabs();

  const [addProfileModalOpen, setAddProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('Work workspace');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim(), newWorkspaceName.trim());
    setNewProfileName('');
    setAddProfileModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title={`${activeProfile?.name || 'User'} (${activeProfile?.workspace || 'Personal'})`}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
          >
            {/* User Avatar Circle with photo from user profile mockup or initials */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-[#1E293B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {activeProfile?.avatar ? (
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile?.name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-semibold">{activeProfile?.initials || 'IR'}</span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </DropdownMenuTrigger>

        {/* Dropdown Card supporting Light Mode & Dark Mode with soft ambient shadows and rounded pill aesthetic */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-80 p-4 bg-white dark:bg-[#141518] text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-[28px] backdrop-blur-2xl z-50 animate-in fade-in-50 zoom-in-95 text-xs font-sans"
        >
          {/* Header User Card (Pill with Avatar, Edit pencil, Name, Email, Arrow) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.06] hover:bg-slate-100/80 dark:hover:bg-white/[0.09] transition-colors mb-3 border border-slate-100 dark:border-transparent">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 border border-slate-200 dark:border-white/20 flex items-center justify-center font-bold text-sm text-white">
                  {activeProfile?.avatar ? (
                    <img
                      src={activeProfile.avatar}
                      alt={activeProfile?.name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{activeProfile?.initials || 'IR'}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#202124] border border-slate-200 dark:border-white/30 flex items-center justify-center text-[9px] text-slate-600 dark:text-white shadow-xs">
                  <Pencil className="w-2.5 h-2.5" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                  {activeProfile?.name || 'Ikiogha Riches'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-white/60 truncate font-normal">
                  {activeProfile?.email || 'ikioghariches09@gmail.com'}
                </p>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/60 flex-shrink-0" />
          </div>

          {/* Action List items styled like modern Google AI / Chrome profile popup */}
          <div className="space-y-1">
            {/* 1. Add another account */}
            <button
              onClick={() => setAddProfileModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors text-xs font-normal"
            >
              <Plus className="w-4 h-4 text-slate-500 dark:text-white/70" />
              <span>Add another account</span>
            </button>

            {/* 2. Sign out */}
            <button
              onClick={() => {
                if (confirm('Sign out of active workspace?')) {
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors text-xs font-normal"
            >
              <LogOut className="w-4 h-4 text-slate-500 dark:text-white/70" />
              <span>Sign out</span>
            </button>

            {/* 3. Manage your Google / Eruwa Account */}
            <button
              onClick={() => openTab({ type: 'settings', title: 'Settings' })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors text-xs font-normal"
            >
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                E
              </span>
              <span>Manage your Eruwa Account</span>
            </button>

            {/* 4. Get an AI plan / Upgrade */}
            <button
              onClick={() => toast.success('Eruwa Pro Plan active with unlimited models and fast processing.')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors text-xs font-normal"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span>Get an Eruwa AI plan</span>
            </button>
          </div>

          {/* Theme switcher pill */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-500 dark:text-white/60">Appearance</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl">
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  themeMode === 'light' ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Light mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  themeMode === 'dark' ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Dark mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  themeMode === 'system' ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="System mode"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer terms */}
          <div className="mt-3 pt-2 text-center text-[10px] text-slate-400 dark:text-white/40 flex items-center justify-center gap-3 font-normal">
            <span className="hover:text-slate-600 dark:hover:text-white/70 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-white/70 cursor-pointer">Terms of Service</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Profile Modal */}
      <Dialog open={addProfileModalOpen} onOpenChange={setAddProfileModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Add Another Account / Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a distinct profile with isolated workspace history and preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProfile} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Ikiogha Riches"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Workspace / Organization
              </label>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Personal, Research Lab"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
