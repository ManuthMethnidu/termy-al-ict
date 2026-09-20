import React, { useState, useEffect } from 'react';
import { NavTab, UserStats } from '../../types';
import { isUserAdmin } from '../../lib/auth';

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
  const isMoreFamily =
    activeTab === 'more' ||
    activeTab === 'settings' ||
    activeTab === 'privacy' ||
    activeTab === 'terms';

  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(isMoreFamily);

  // Automatically keep "More" open if an internal tab is active
  useEffect(() => {
    if (isMoreFamily) {
      setIsMoreOpen(true);
    }
  }, [isMoreFamily]);

  const navItems: { id: NavTab; label: string; icon: string; href: string }[] = [
    { id: 'learn', label: 'Learn', icon: 'terminal', href: '/' },
    { id: 'questions', label: 'Q-Bank (2.6K)', icon: 'inventory_2', href: '/questions' },
    { id: 'practice', label: 'Practice', icon: 'code', href: '/practice' },
    { id: 'leaderboards', label: 'Leaderboards', icon: 'military_tech', href: '/leaderboards' },
    { id: 'quests', label: 'Quests', icon: 'assignment', href: '/quests' },
    { id: 'shop', label: 'Shop', icon: 'shopping_bag', href: '/shop' },
    { id: 'profile', label: 'Profile', icon: 'badge', href: '/profile' },
  ];

  const moreSubItems: { id: NavTab; label: string; icon: string; href: string }[] = [
    { id: 'more', label: 'Settings', icon: 'settings', href: '/settings' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'verified_user', href: '/privacy' },
    { id: 'terms', label: 'Terms of Service', icon: 'gavel', href: '/terms' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#131f24] border-r-2 border-card-border z-40 hidden md:flex flex-col justify-between p-4 select-none">
      <div className="flex flex-col gap-5 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-card-border">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('learn');
          }}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group shrink-0"
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
        </a>

        {/* Primary Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-4 px-4 py-3 uppercase tracking-wider text-sm font-extrabold transition-all rounded-xl text-left ${
                  isActive
                    ? 'border-2 border-primary bg-surface-container text-primary shadow-[0_3px_0_#46a302]'
                    : 'text-text-muted hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}

          {/* New "More" Option with Settings, Privacy & Terms inside */}
          <div className="flex flex-col gap-1 mt-1">
            <button
              onClick={() => {
                if (!isMoreOpen) {
                  setIsMoreOpen(true);
                  if (!isMoreFamily) {
                    onSelectTab('more');
                  }
                } else {
                  setIsMoreOpen(!isMoreOpen);
                }
              }}
              className={`flex items-center justify-between px-4 py-3 uppercase tracking-wider text-sm font-extrabold transition-all rounded-xl text-left ${
                isMoreFamily
                  ? 'border-2 border-primary bg-surface-container text-primary shadow-[0_3px_0_#46a302]'
                  : 'text-text-muted hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-2xl">more_horiz</span>
                <span>More</span>
              </div>
              <span
                className={`material-symbols-outlined text-xl transition-transform duration-200 ${
                  isMoreOpen ? 'rotate-180 text-primary' : 'text-text-muted'
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Sub-menu: Settings, Privacy Policy, Terms of Service */}
            {isMoreOpen && (
              <div className="flex flex-col gap-1 pl-3 pr-1 py-1.5 border-l-2 border-card-border ml-5 my-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {moreSubItems.map((sub) => {
                  const isSubActive =
                    activeTab === sub.id ||
                    (sub.id === 'more' && activeTab === 'settings');

                  return (
                    <a
                      key={sub.id}
                      href={sub.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTab(sub.id);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg text-left transition-all ${
                        isSubActive
                          ? 'bg-primary/20 text-primary font-extrabold border border-primary/40 shadow-sm'
                          : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{sub.icon}</span>
                      <span className="truncate">{sub.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Area: Candidate Account info + Quick Legal Links */}
      <div className="flex flex-col gap-2 pt-2 border-t-2 border-card-border shrink-0">
        <div
          onClick={() => onSelectTab('profile')}
          className="flex items-center justify-between cursor-pointer hover:bg-surface-container-low/60 rounded-xl transition-colors p-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            {userStats.avatarUrl ? (
              <img
                src={userStats.avatarUrl}
                alt={userStats.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/50 shadow shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow shrink-0">
                <span className="material-symbols-outlined text-xl">person</span>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-on-surface truncate leading-tight">
                  {userStats.name}
                </span>
                {(userStats.authProvider === 'google' || userStats.authProvider === 'email') && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Verified Account" />
                )}
              </div>
              <span className="text-[11px] text-text-muted truncate">
                {userStats.authProvider === 'google'
                  ? 'Google Account'
                  : userStats.authProvider === 'email'
                  ? 'Verified Account'
                  : userStats.batch}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isUserAdmin(userStats.email) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('admin');
                }}
                title="Root Admin Terminal"
                className="text-text-muted hover:text-primary p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">shield</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab('more');
              }}
              title="Preferences & Settings"
              className="text-text-muted hover:text-on-surface p-1 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
            </button>
          </div>
        </div>

        {/* Public Legal Quick Links */}
        <div className="px-2 pt-1 flex items-center justify-center gap-2 text-[10px] text-text-muted select-none">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('privacy');
            }}
            className={`hover:text-primary transition-colors ${activeTab === 'privacy' ? 'text-primary font-bold' : ''}`}
          >
            Privacy
          </a>
          <span>•</span>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('terms');
            }}
            className={`hover:text-primary transition-colors ${activeTab === 'terms' ? 'text-primary font-bold' : ''}`}
          >
            Terms
          </a>
          <span>•</span>
          <a
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('more');
            }}
            className={`hover:text-primary transition-colors ${activeTab === 'more' ? 'text-primary font-bold' : ''}`}
          >
            Settings
          </a>
        </div>
      </div>
    </aside>
  );
};
