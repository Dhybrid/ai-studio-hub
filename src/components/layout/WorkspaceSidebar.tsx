import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight,
  Home, Star, Users, Clock, Share2, Zap,
  BookOpen, FolderOpen, User, X, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SidebarItem {
  id: string;
  name: string;
  subtitle?: string;
  time?: string;
  thumbnail?: string;
}

interface WorkspaceSidebarProps {
  title: string;
  icon: React.ElementType;
  items: SidebarItem[];
  selectedId?: string;
  onSelectItem: (id: string) => void;
  onNewItem: () => void;
  newItemLabel?: string;
  searchPlaceholder?: string;
  itemsLabel?: string;
  extraContent?: React.ReactNode;
  basePath: string;
}

export const WorkspaceSidebar = ({
  title,
  icon: Icon,
  items,
  selectedId,
  onSelectItem,
  onNewItem,
  newItemLabel = 'New Project',
  searchPlaceholder = 'Search...',
  basePath,
}: WorkspaceSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'starred' | 'created' | 'shared' | 'recents'>('all');
  const [sharePopup, setSharePopup] = useState(false);
  const [upgradePopup, setUpgradePopup] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { icon: Home, label: 'Home', onClick: () => navigate(basePath) },
    { icon: Search, label: 'Search', onClick: () => setSearchOpen(true) },
    { icon: BookOpen, label: 'Resources', onClick: () => {} },
  ];

  const projectSections = [
    { key: 'all' as const, icon: FolderOpen, label: 'All projects' },
    { key: 'starred' as const, icon: Star, label: 'Starred' },
    { key: 'created' as const, icon: User, label: 'Created by me' },
    { key: 'shared' as const, icon: Users, label: 'Shared with me' },
    { key: 'recents' as const, icon: Clock, label: 'Recents' },
  ];

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-50 transition-opacity duration-200",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />
        {/* Sidebar drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent
            title={title}
            Icon={Icon}
            navItems={navItems}
            projectSections={projectSections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            search={search}
            setSearch={setSearch}
            filtered={filtered}
            items={items}
            selectedId={selectedId}
            onSelectItem={(id: string) => { onSelectItem(id); setMobileOpen(false); }}
            onNewItem={() => { onNewItem(); setMobileOpen(false); }}
            newItemLabel={newItemLabel}
            collapsed={false}
            sharePopup={sharePopup}
            setSharePopup={setSharePopup}
            upgradePopup={upgradePopup}
            setUpgradePopup={setUpgradePopup}
            onClose={() => setMobileOpen(false)}
          />
        </aside>

        <SearchPopup
          open={searchOpen}
          onClose={() => { setSearchOpen(false); setSearch(''); }}
          search={search}
          setSearch={setSearch}
          items={items}
          onSelect={(id) => { onSelectItem(id); setMobileOpen(false); setSearchOpen(false); setSearch(''); }}
        />
        <SharePopup open={sharePopup} onClose={() => setSharePopup(false)} />
        <UpgradePopup open={upgradePopup} onClose={() => setUpgradePopup(false)} />
      </>
    );
  }

  return (
    <>
      <aside
        className="h-screen flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden relative transition-[width] duration-200 ease-in-out"
        style={{ width: collapsed ? 64 : 260 }}
      >
        <SidebarContent
          title={title}
          Icon={Icon}
          navItems={navItems}
          projectSections={projectSections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          items={items}
          selectedId={selectedId}
          onSelectItem={onSelectItem}
          onNewItem={onNewItem}
          newItemLabel={newItemLabel}
          collapsed={collapsed}
          sharePopup={sharePopup}
          setSharePopup={setSharePopup}
          upgradePopup={upgradePopup}
          setUpgradePopup={setUpgradePopup}
        />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
          style={{ right: -12 }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      <SearchPopup
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setSearch(''); }}
        search={search}
        setSearch={setSearch}
        items={items}
        onSelect={(id) => { onSelectItem(id); setSearchOpen(false); setSearch(''); }}
      />
      <SharePopup open={sharePopup} onClose={() => setSharePopup(false)} />
      <UpgradePopup open={upgradePopup} onClose={() => setUpgradePopup(false)} />
    </>
  );
};

const SidebarContent = ({
  title, Icon, navItems, projectSections, activeSection, setActiveSection,
  collapsed, sharePopup, setSharePopup, upgradePopup, setUpgradePopup,
  selectedId, onSelectItem, onNewItem, newItemLabel, items, filtered, search, setSearch, searchOpen, setSearchOpen,
  onClose,
}: any) => (
  <>
    <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-accent-foreground" />
      </div>
      {!collapsed && (
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="text-sm font-semibold text-foreground tracking-tight">IIkiogha's {title}</p>
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-hover text-muted-foreground ml-auto">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    <div className="flex-1 flex flex-col py-3 px-2 gap-0.5 overflow-y-auto">
      {navItems.map((item: any) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
            "hover:bg-surface-hover text-sidebar-foreground"
          )}
        >
          <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
      ))}

      <button
        onClick={onNewItem}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 bg-accent/10 text-accent hover:bg-accent/15 font-medium"
      >
        <Zap className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && <span className="truncate">{newItemLabel}</span>}
      </button>

      {!collapsed ? (
        <div className="flex items-center gap-2 px-3 mt-4 mb-1">
          <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">Projects</span>
          <div className="flex-1 h-px bg-sidebar-border" />
        </div>
      ) : (
        <div className="my-2 mx-3 h-px bg-sidebar-border" />
      )}

      {projectSections.map((section: any) => (
        <button
          key={section.key}
          onClick={() => setActiveSection(section.key)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
            "hover:bg-surface-hover",
            activeSection === section.key
              ? "bg-surface-active text-foreground font-medium"
              : "text-sidebar-foreground"
          )}
        >
          <section.icon className={cn("w-[18px] h-[18px] flex-shrink-0", activeSection === section.key && "text-accent")} />
          {!collapsed && <span className="truncate">{section.label}</span>}
        </button>
      ))}

      <div className="flex-1" />

      {!collapsed && (
        <button
          onClick={() => setSharePopup(true)}
          className="mx-2 mb-2 p-3 rounded-xl border border-sidebar-border bg-surface-hover/30 text-left hover:border-accent/30 transition-all w-full"
        >
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-semibold text-foreground">Share Eruwa</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">100 credits per paid referral</p>
        </button>
      )}

      {!collapsed && (
        <button
          onClick={() => setUpgradePopup(true)}
          className="mx-2 mb-2 p-3 rounded-xl bg-accent/10 border border-accent/20 text-left hover:bg-accent/15 transition-all w-full"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-semibold text-foreground">Upgrade to Pro</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">Unlock more benefits</p>
        </button>
      )}
    </div>

    <div className="border-t border-sidebar-border p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
        II
      </div>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">IIkiogha</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Pro</span>
        </div>
      )}
    </div>
  </>
);

const SearchPopup = ({ open, onClose, search, setSearch, items, onSelect }: {
  open: boolean; onClose: () => void; search: string; setSearch: (s: string) => void;
  items: SidebarItem[]; onSelect: (id: string) => void;
}) => {
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-[61] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-3 py-2">Recent Projects</p>
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No projects found</p>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="w-12 h-8 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    {item.subtitle && <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SharePopup = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card border border-border rounded-2xl shadow-2xl z-[61] p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Share Eruwa</h3>
              <p className="text-sm text-muted-foreground mt-1">Earn 100 credits for every paid referral</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <p className="text-xs text-muted-foreground mb-2">Your referral link</p>
              <div className="flex items-center gap-2">
                <input readOnly value="https://Eruwa.ai/ref/iikiogha" className="flex-1 text-sm bg-transparent text-foreground outline-none font-mono" />
                <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90">Copy</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Twitter', 'LinkedIn', 'Email'].map((p) => (
                <button key={p} className="py-2.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-surface-hover transition-colors">{p}</button>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-xs text-foreground font-medium">Your stats</p>
              <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
                <span>Referrals: <strong className="text-foreground">3</strong></span>
                <span>Credits earned: <strong className="text-foreground">300</strong></span>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const UpgradePopup = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-[61] p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Upgrade to Pro</h3>
              <p className="text-sm text-muted-foreground mt-1">Unlock the full power of Eruwa</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              { plan: 'Free', price: '$0', features: ['5 daily credits', '3 projects', 'Basic AI'] },
              { plan: 'Pro', price: '$20/mo', features: ['Unlimited credits', 'Unlimited projects', 'Premium AI', 'Priority support', 'Custom domains'], highlight: true },
            ].map((p) => (
              <div key={p.plan} className={cn("p-4 rounded-xl border", p.highlight ? "border-accent bg-accent/5" : "border-border")}>
                <p className="text-sm font-semibold text-foreground">{p.plan}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{p.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.features.map(f => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn("w-full mt-4 py-2 rounded-lg text-xs font-medium transition-all", p.highlight ? "bg-accent text-accent-foreground hover:opacity-90" : "border border-border text-foreground hover:bg-surface-hover")}>
                  {p.highlight ? 'Upgrade Now' : 'Current Plan'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
