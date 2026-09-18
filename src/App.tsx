import React, { useState, useEffect } from 'react';
import { NavTab, UserStats, McqQuestion } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LearnView } from './components/views/LearnView';
import { QuestionBankView } from './components/views/QuestionBankView';
import { PracticeHubView } from './components/views/PracticeHubView';
import { LeaderboardsView } from './components/views/LeaderboardsView';
import { QuestsView } from './components/views/QuestsView';
import { ShopView } from './components/views/ShopView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { AdminPanelView } from './components/views/AdminPanelView';
import { PrivacyPolicyView } from './components/views/PrivacyPolicyView';
import { TermsOfServiceView } from './components/views/TermsOfServiceView';
import { GuidebookModal } from './components/views/GuidebookModal';
import { HelpFaqModal } from './components/views/HelpFaqModal';
import { LiveMcqDrill } from './components/drill/LiveMcqDrill';
import { SYLLABUS_QUESTIONS } from './data/syllabusQuestions';
import { getAllMasterQuestions } from './lib/questionBankLoader';
import { syncUserStatsToSupabase } from './lib/supabase';
import { onAuthStateChange, fetchUserProfile } from './lib/auth';
import { sounds } from './lib/sound';

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
  level: 1,
  league: 'Diamond League',
  leagueRank: 1,
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

  // Sync tab with browser URL and back/forward buttons
  useEffect(() => {
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

  // Subscribe to Supabase Auth State (Google OAuth login / logout)
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange(async (_session, user) => {
      if (user) {
        const meta = user.user_metadata || {};
        const profile = await fetchUserProfile(user.id);

        if (profile) {
          setUserStats((prev) => ({
            ...prev,
            ...profile,
            id: user.id,
            email: user.email,
            authProvider: 'google',
          }));
        } else {
          // Fresh Google sign-in
          const googleName =
            meta.full_name || meta.name || user.email?.split('@')[0] || 'Candidate';
          const googleAvatar = meta.avatar_url;
          const newStats: Partial<UserStats> = {
            id: user.id,
            email: user.email,
            name: googleName,
            username: `@${user.email?.split('@')[0] || 'candidate'}`,
            avatarUrl: googleAvatar,
            authProvider: 'google',
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

  // Sync stats when updated
  const handleUpdateStats = (partial: Partial<UserStats>) => {
    setUserStats((prev) => {
      const next = { ...prev, ...partial };
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
            <LeaderboardsView userStats={userStats} />
          )}

          {activeTab === 'quests' && (
            <QuestsView userStats={userStats} />
          )}

          {activeTab === 'shop' && (
            <ShopView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView userStats={userStats} />
          )}

          {(activeTab === 'more' || activeTab === 'settings') && (
            <SettingsView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onOpenHelp={() => setIsHelpOpen(true)}
              onOpenAdmin={() => handleSelectTab('admin')}
              onNavigate={handleSelectTab}
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
            <AdminPanelView onExit={() => handleSelectTab('learn')} />
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
    </div>
  );
};
