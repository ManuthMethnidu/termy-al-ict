import React from 'react';
import { NavTab, UserStats } from '../../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userStats: UserStats;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userStats,
}) => {
  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: 'learn', label: 'Learn', icon: 'terminal' },
    { id: 'questions', label: 'Q-Bank (2.6K)', icon: 'inventory_2' },
    { id: 'practice', label: 'Practice', icon: 'code' },
    { id: 'leaderboards', label: 'Leaderboards', icon: 'military_tech' },
    { id: 'quests', label: 'Quests', icon: 'assignment' },
    { id: 'shop', label: 'Shop', icon: 'shopping_bag' },
    { id: 'profile', label: 'Profile', icon: 'badge' },
    { id: 'more', label: 'Settings', icon: 'more_horiz' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#131f24] border-r-2 border-card-border z-40 hidden md:flex flex-col justify-between p-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('learn')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-card-dark border-2 border-card-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-md">
            <span className="material-symbols-outlined text-2xl font-bold">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-wider text-primary leading-none">
              TERMY
            </span>
            <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
              A/L ICT ENGINE
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-4 px-4 py-3 uppercase tracking-wider text-sm font-extrabold transition-all rounded-xl text-left ${
                  isActive
                    ? 'border-2 border-primary bg-surface-container text-primary shadow-[0_3px_0_#46a302]'
                    : 'text-text-muted hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Candidate Account info */}
      <div
        onClick={() => onSelectTab('profile')}
        className="border-t-2 border-card-border pt-4 px-2 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/60 rounded-xl transition-colors p-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-on-surface truncate leading-tight">
              {userStats.name}
            </span>
            <span className="text-[11px] text-text-muted truncate">
              {userStats.batch}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectTab('more');
          }}
          className="text-text-muted hover:text-on-surface p-1"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </div>
    </aside>
  );
};
