import React, { useState, useEffect } from 'react';
import { NavTab, UserStats, McqQuestion } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LearnView } from './components/views/LearnView';
import { QuestionBankView } from './components/views/QuestionBankView';
import { PracticeHubView } from './components/views/PracticeHubView';
import { LeaderboardsView } from './components/views/LeaderboardsView';
import { QuestsView } from './components/views/QuestsView';
import { FriendsView } from './components/views/FriendsView';
import { ShopView } from './components/views/ShopView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { PrivacyPolicyView } from './components/views/PrivacyPolicyView';
import { TermsOfServiceView } from './components/views/TermsOfServiceView';
import { GuidebookModal } from './components/views/GuidebookModal';
import { HelpFaqModal } from './components/views/HelpFaqModal';
import { AuthModal } from './components/views/AuthModal';
import { LiveMcqDrill } from './components/drill/LiveMcqDrill';
import { SYLLABUS_QUESTIONS } from './data/syllabusQuestions';
import { getAllMasterQuestions } from './lib/questionBankLoader';
import { syncUserStatsToSupabase } from './lib/supabase';
import {
  onAuthStateChange,
  fetchUserProfile,
  handleAuthCallback,
  isUserAdmin,
} from './lib/auth';
import { sounds } from './lib/sound';
import { getCurrentWeekId, checkAndApplyWeeklyReset } from './lib/leagueSystem';

const INITIAL_STATS: UserStats = {
  name: 'Candidate',
  username: '@al_candidate',
  batch: '2025 A/L Batch',
  stream: 'Physical Science & ICT Stream',
  school: 'Royal College • Colombo 07',
  streakDays: 1,
  gems: 100,
  hearts: 5,
  maxHearts: 5,
  xp: 50,
  weeklyXp: 50,
  level: 1,
  leagueId: 1,
  league: 'Bronze League',
  leagueRank: 1,
  leagueGroupNumber: 1,
  lastActiveWeek: getCurrentWeekId(),
  tournamentStage: 'none',
  questPoints: 0,
  storedBoosts: 0,
  followingCount: 3,
  followersCount: 3,
  friendsQuestsEnabled: true,
  blockedUserIds: [],
  isPro: false,
  soundEnabled: true,
  hapticsEnabled: true,
  dailyGoalMinutes: 20,
  targetExamYear: 2025,
  completedLessons: [],
  reviewedQuestionIds: [],
};

function getTabFromLocation(): NavTab {
  if (typeof window === 'undefined') return 'learn';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab') || searchParams.get('page');

  if (
    path === '/privacy' ||
    path === '/privacy-policy' ||
    hash === 'privacy' ||
    hash === 'privacy-policy' ||
    tabParam === 'privacy'
  ) {
    return 'privacy';
  }

  if (
    path === '/terms' ||
    path === '/terms-of-service' ||
    hash === 'terms' ||
    hash === 'terms-of-service' ||
    tabParam === 'terms'
  ) {
    return 'terms';
  }

  if (path === '/settings' || hash === 'settings' || tabParam === 'settings' || tabParam === 'more') {
    return 'more';
  }

  if (path === '/admin' || hash === 'admin' || tabParam === 'admin') {
    return 'admin';
  }

  if (path === '/questions' || path === '/q-bank' || hash === 'questions') {
    return 'questions';
  }

  if (path === '/practice' || hash === 'practice') {
    return 'practice';
  }

  if (path === '/leaderboards' || hash === 'leaderboards') {
    return 'leaderboards';
  }

  if (path === '/quests' || hash === 'quests') {
    return 'quests';
  }

  if (path === '/friends' || hash === 'friends' || tabParam === 'friends') {
    return 'friends';
  }

  if (path === '/shop' || hash === 'shop') {
    return 'shop';
  }

  if (path === '/profile' || hash === 'profile') {
    return 'profile';
  }

  return 'learn';
}

function getUrlForTab(tab: NavTab): string {
  switch (tab) {
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'more':
    case 'settings':
      return '/settings';
    case 'admin':
      return '/admin';
    case 'questions':
      return '/questions';
    case 'practice':
      return '/practice';
    case 'leaderboards':
      return '/leaderboards';
    case 'quests':
      return '/quests';
    case 'friends':
      return '/friends';
    case 'shop':
      return '/shop';
    case 'profile':
      return '/profile';
    case 'learn':
    default:
      return '/';
  }
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(() => getTabFromLocation());
  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('termy_user_stats');
      if (saved) {
        try {
          return { ...INITIAL_STATS, ...JSON.parse(saved) };
        } catch (e) {
          console.warn('Failed parsing saved user stats', e);
        }
      }
    }
    return INITIAL_STATS;
  });

  const [masterQuestions, setMasterQuestions] = useState<McqQuestion[]>(SYLLABUS_QUESTIONS);
  const [isDrillOpen, setIsDrillOpen] = useState<boolean>(false);
  const [drillQuestions, setDrillQuestions] = useState<McqQuestion[]>(SYLLABUS_QUESTIONS);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    sounds.playClick();
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  // Sync tab with browser URL, back/forward buttons, and clean OAuth tokens or PKCE code
  useEffect(() => {
    handleAuthCallback();

    const onPopState = () => {
      setActiveTab(getTabFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync document title dynamically
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (activeTab === 'privacy') {
      document.title = 'Privacy Policy — Termy A/L ICT';
    } else if (activeTab === 'terms') {
      document.title = 'Terms of Service — Termy A/L ICT';
    } else if (activeTab === 'more' || activeTab === 'settings') {
      document.title = 'Settings & Preferences — Termy A/L ICT';
    } else if (activeTab === 'admin') {
      document.title = 'Root Admin Terminal — Termy';
    } else if (activeTab === 'questions') {
      document.title = 'MCQ Question Bank — Termy A/L ICT';
    } else if (activeTab === 'practice') {
      document.title = 'Practice Hub — Termy A/L ICT';
    } else if (activeTab === 'leaderboards') {
      document.title = 'National Leaderboards — Termy A/L ICT';
    } else if (activeTab === 'quests') {
      document.title = 'Daily Quests — Termy A/L ICT';
    } else if (activeTab === 'friends') {
      document.title = 'Friends & Community — Termy A/L ICT';
    } else if (activeTab === 'shop') {
      document.title = 'Termy Shop — Bits & Lives';
    } else if (activeTab === 'profile') {
      document.title = 'Candidate Profile — Termy A/L ICT';
    } else {
      document.title = 'Termy A/L ICT — Active Recall & Spaced Repetition';
    }
  }, [activeTab]);

  const handleSelectTab = (tab: NavTab, replace = false) => {
    sounds.playClick();
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetUrl = getUrlForTab(tab);
      const currentNormalized = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      if (currentNormalized !== targetUrl) {
        if (replace) {
          window.history.replaceState({ tab }, '', targetUrl);
        } else {
          window.history.pushState({ tab }, '', targetUrl);
        }
      }
    }
  };

  // Load master questions from real question bank on mount
  useEffect(() => {
    let isMounted = true;
    getAllMasterQuestions()
      .then((questions) => {
        if (isMounted && questions && questions.length > 0) {
          setMasterQuestions(questions);
        }
      })
      .catch((err) => {
        console.warn('Error pre-loading master questions:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to Supabase Auth State (Google OAuth / Email login / logout)
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange(async (_session, user) => {
      if (user) {
        const meta = user.user_metadata || {};
        const profile = await fetchUserProfile(user.id);
        const provider = (user.app_metadata?.provider === 'google' || meta.avatar_url ? 'google' : 'email') as 'google' | 'email';

        if (profile) {
          setUserStats((prev) => ({
            ...prev,
            ...profile,
            id: user.id,
            email: user.email,
            authProvider: provider,
          }));
        } else {
          // Fresh candidate sign-in
          const candidateName =
            meta.full_name || meta.name || user.email?.split('@')[0] || 'Candidate';
          const candidateAvatar = meta.avatar_url;
          const newStats: Partial<UserStats> = {
            id: user.id,
            email: user.email,
            name: candidateName,
            username: `@${user.email?.split('@')[0] || 'candidate'}`,
            avatarUrl: candidateAvatar,
            authProvider: provider,
          };

          setUserStats((prev) => {
            const next = { ...prev, ...newStats };
            syncUserStatsToSupabase(next);
            return next;
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check and apply weekly league reset on mount
  useEffect(() => {
    const { updatedStats, resetOccurred, message } = checkAndApplyWeeklyReset(userStats);
    if (resetOccurred) {
      sounds.playFanfare();
      setUserStats(updatedStats);
      syncUserStatsToSupabase(updatedStats);
      if (message) {
        console.info('[Termy League Reset]:', message);
      }
    }
  }, []);

  // Sync stats when updated
  const handleUpdateStats = (partial: Partial<UserStats>) => {
    setUserStats((prev) => {
      const next = { ...prev, ...partial };
      if (partial.xp !== undefined && partial.weeklyXp === undefined) {
        const delta = partial.xp - prev.xp;
        if (delta > 0) {
          next.weeklyXp = (prev.weeklyXp || 0) + delta;
        }
      }
      syncUserStatsToSupabase(next);
      return next;
    });
  };

  const handleStartLesson = () => {
    sounds.playClick();
    // Sample 5 real questions from Unit 3 (Digital Electronics) or master bank
    const unit3Pool = masterQuestions.filter((q) => q.unit === 3);
    const pool = unit3Pool.length > 0 ? unit3Pool : masterQuestions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setDrillQuestions(shuffled);
    setIsDrillOpen(true);
  };

  const handleStartCustomDrill = (customQuestions: McqQuestion[]) => {
    sounds.playClick();
    setDrillQuestions(customQuestions);
    setIsDrillOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#131f24] text-on-surface flex font-sans select-none">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userStats={userStats}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          userStats={userStats}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onStartPractice={handleStartLesson}
          onOpenAuth={handleOpenAuth}
        />

        {/* Viewport Content */}
        <main className="pt-20 px-4 sm:px-8 max-w-7xl w-full mx-auto">
          {activeTab === 'learn' && (
            <LearnView
              userStats={userStats}
              onStartLesson={handleStartLesson}
              onOpenGuidebook={() => setIsGuidebookOpen(true)}
              onSelectTab={handleSelectTab}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionBankView
              onStartDrill={handleStartCustomDrill}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeHubView
              userStats={userStats}
              onStartCustomDrill={handleStartCustomDrill}
            />
          )}

          {activeTab === 'leaderboards' && (
            <LeaderboardsView
              userStats={userStats}
              onStartPractice={handleStartLesson}
              onUpdateStats={handleUpdateStats}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onStartDrill={handleStartLesson}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onOpenAuth={handleOpenAuth}
              onStartDrill={handleStartLesson}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userStats={userStats}
              onOpenAuth={handleOpenAuth}
              onUpdateStats={handleUpdateStats}
              onStartDrill={handleStartLesson}
            />
          )}

          {(activeTab === 'more' || activeTab === 'settings') && (
            <SettingsView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onOpenHelp={() => setIsHelpOpen(true)}
              onOpenAdmin={() => handleSelectTab('admin')}
              onNavigate={handleSelectTab}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPolicyView
              onNavigate={handleSelectTab}
            />
          )}

          {activeTab === 'terms' && (
            <TermsOfServiceView
              onNavigate={handleSelectTab}
            />
          )}

          {activeTab === 'admin' && (
            isUserAdmin(userStats.email) ? (
              <AdminPanelView
                onExit={() => handleSelectTab('learn')}
                currentUser={userStats}
                onUpdateStats={handleUpdateStats}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto p-6 text-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-crimson-heart/10 border-2 border-crimson-heart/30 flex items-center justify-center text-crimson-heart mb-4 shadow-[0_0_15px_rgba(255,75,75,0.2)]">
                  <span className="material-symbols-outlined text-3xl font-bold">gpp_bad</span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface mb-2">Access Denied (403)</h2>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">
                  The Root Administration Console is strictly restricted to system administrators (<span className="text-primary font-mono">methnidumanuth@gmail.com</span>).
                  {userStats.email ? (
                    <span className="block mt-2 font-mono text-[11px] text-text-muted">
                      Currently signed in as: <strong className="text-on-surface">{userStats.email}</strong>
                    </span>
                  ) : (
                    <span className="block mt-2 font-mono text-[11px] text-text-muted">
                      You are currently browsing as Guest.
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectTab('learn')}
                    className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-card-border transition-all"
                  >
                    Return to Dashboard
                  </button>
                  {!userStats.email && (
                    <button
                      onClick={() => handleOpenAuth('signin')}
                      className="px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed font-extrabold text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all"
                    >
                      Admin Sign In
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* Live Interactive MCQ Practice Session Modal */}
      {isDrillOpen && (
        <LiveMcqDrill
          questions={drillQuestions}
          userStats={userStats}
          onUpdateStats={handleUpdateStats}
          onClose={() => setIsDrillOpen(false)}
        />
      )}

      {/* Unit Guidebook Modal */}
      <GuidebookModal
        isOpen={isGuidebookOpen}
        onClose={() => setIsGuidebookOpen(false)}
      />

      {/* Help & FAQs Modal */}
      <HelpFaqModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};
