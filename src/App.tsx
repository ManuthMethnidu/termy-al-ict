import React, { useState } from 'react';
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
import { GuidebookModal } from './components/views/GuidebookModal';
import { HelpFaqModal } from './components/views/HelpFaqModal';
import { LiveMcqDrill } from './components/drill/LiveMcqDrill';
import { SYLLABUS_QUESTIONS } from './data/syllabusQuestions';
import { syncUserStatsToSupabase } from './lib/supabase';
import { sounds } from './lib/sound';

const INITIAL_STATS: UserStats = {
  name: 'Manuth Methnidu',
  username: '@EnterAltBreak',
  batch: '2025 A/L Batch',
  stream: 'Physical Science & ICT Stream',
  school: 'Royal College • Colombo 07',
  streakDays: 14,
  gems: 480, // bits
  hearts: 5,
  maxHearts: 5,
  xp: 1720,
  level: 4,
  league: 'Diamond League',
  leagueRank: 2,
  isPro: false,
  soundEnabled: true,
  hapticsEnabled: true,
  dailyGoalMinutes: 20,
  targetExamYear: 2025,
  completedLessons: ['1. Basic Gates', '2. Universal Gates', '3. 2019 MCQ Drill'],
  reviewedQuestionIds: ['ict-2022-mcq-14'],
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('learn');
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

  const [isDrillOpen, setIsDrillOpen] = useState<boolean>(false);
  const [drillQuestions, setDrillQuestions] = useState<McqQuestion[]>(SYLLABUS_QUESTIONS);
  const [isGuidebookOpen, setIsGuidebookOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

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
    setDrillQuestions(SYLLABUS_QUESTIONS);
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
        onSelectTab={(tab) => {
          sounds.playClick();
          setActiveTab(tab);
        }}
        userStats={userStats}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          userStats={userStats}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            sounds.playClick();
            setActiveTab(tab);
          }}
          onStartPractice={handleStartLesson}
        />

        {/* Viewport Content */}
        <main className="pt-20 px-4 sm:px-8 max-w-7xl w-full mx-auto">
          {activeTab === 'learn' && (
            <LearnView
              userStats={userStats}
              onStartLesson={handleStartLesson}
              onOpenGuidebook={() => setIsGuidebookOpen(true)}
              onSelectTab={setActiveTab}
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

          {activeTab === 'more' && (
            <SettingsView
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
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
