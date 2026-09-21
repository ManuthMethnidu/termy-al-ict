import React, { useState, useEffect, useCallback } from 'react';
import { McqQuestion, UserStats } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';
import { QuestionDiagram } from './QuestionDiagram';
import { TermyBear, TermyMood } from '../mascot/TermyBear';
import { sounds } from '../../lib/sound';
import { recordAnswer } from '../../lib/spacedRepetition';
import { logMcqAttempt } from '../../lib/supabase';
import { getRemainingBoostTime } from '../../lib/questsSystem';
import confetti from 'canvas-confetti';

interface LiveMcqDrillProps {
  questions: McqQuestion[];
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onClose: () => void;
  isPracticeMode?: boolean;
  onOpenLivesModal?: () => void;
}

export const LiveMcqDrill: React.FC<LiveMcqDrillProps> = ({
  questions: initialQuestions,
  userStats,
  onUpdateStats,
  onClose,
  isPracticeMode = false,
  onOpenLivesModal,
}) => {
  const isEnergyMode = userStats.livesMode === 'energy';
  // Active question queue (allows missed questions to be cycled back to end of queue!)
  const [queue, setQueue] = useState<McqQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [comboCount, setComboCount] = useState<number>(3);
  const [hearts, setHearts] = useState<number>(userStats.hearts);
  const [energyUnits, setEnergyUnits] = useState<number>(userStats.energyUnits ?? 25);
  const [outOfLives, setOutOfLives] = useState<boolean>(false);
  const [sessionXpEarned, setSessionXpEarned] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [termyMood, setTermyMood] = useState<TermyMood>('idle');
  const [termyComment, setTermyComment] = useState<string>(
    isPracticeMode
      ? 'Free Practice Session: Master past paper MCQs to replenish your lives!'
      : 'Focus on the minterm expansions! Use keyboard keys 1-4 to select.'
  );

  const currentQuestion = queue[currentIndex];
  const progressPercent = queue.length > 0 ? Math.min(100, Math.round(((currentIndex) / queue.length) * 100)) : 0;

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  // Check Answer Handler
  const handleCheckAnswer = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;

    if (isAnswerChecked) {
      // Continue to next question
      if (currentIndex + 1 < queue.length) {
        // Check if out of lives before advancing
        if (!userStats.isPro && !isPracticeMode) {
          if (isEnergyMode && energyUnits <= 0) {
            setOutOfLives(true);
            return;
          }
          if (!isEnergyMode && hearts <= 0) {
            setOutOfLives(true);
            return;
          }
        }

        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setIsCorrect(false);
        setTermyMood('idle');
        setTermyComment('Next concept incoming! Keep your momentum up.');
      } else {
        // Completed session!
        sounds.playFanfare();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (isPracticeMode) {
          // Practice drill awards +1 Heart (or +5 Energy) and 3 Gems!
          if (isEnergyMode) {
            const nextEnergy = Math.min(userStats.maxEnergyUnits || 25, (userStats.energyUnits ?? 25) + 5);
            onUpdateStats({
              energyUnits: nextEnergy,
              gems: userStats.gems + 3,
            });
            alert('🎉 Practice Session Complete! +5 Energy Battery recharged and +3 Gems earned! ⚡💎');
          } else {
            const nextHearts = Math.min(userStats.maxHearts || 5, userStats.hearts + 1);
            onUpdateStats({
              hearts: nextHearts,
              gems: userStats.gems + 3,
            });
            alert('🎉 Practice Session Complete! +1 Exam Heart restored and +3 Gems earned! ❤️💎');
          }
        } else {
          // Standard learning drill: awards 2–5 gems (3 base + 2 bonus for combo)
          const bonusGems = comboCount >= 3 ? 5 : 3;
          onUpdateStats({
            gems: userStats.gems + bonusGems,
          });
        }
        onClose();
      }
      return;
    }

    // Checking answer now
    const correct = selectedOption === currentQuestion.correctOption;
    setIsAnswerChecked(true);
    setIsCorrect(correct);

    const timeSpent = (Date.now() - startTime) / 1000;
    const { nextReviewIn } = recordAnswer(currentQuestion.id, correct);

    // Supabase logging in background
    logMcqAttempt({
      questionId: currentQuestion.id,
      unit: currentQuestion.unit,
      selectedOption,
      isCorrect: correct,
      timeSpentSeconds: timeSpent,
    });

    // Handle Energy Mode: Every question costs 1 unit (whether right or wrong)
    if (isEnergyMode && !userStats.isPro && !isPracticeMode) {
      const nextEnergy = Math.max(0, energyUnits - 1);
      setEnergyUnits(nextEnergy);
      onUpdateStats({ energyUnits: nextEnergy });
    }

    if (correct) {
      sounds.playCorrect();
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      const isBoosted = !!(userStats.boostActiveUntil && userStats.boostActiveUntil > Date.now());
      const baseEarned = 15 + Math.min(newCombo * 2, 10);
      const earned = isBoosted ? baseEarned * 2 : baseEarned;
      setSessionXpEarned((prev) => prev + earned);
      onUpdateStats({
        xp: userStats.xp + earned,
        weeklyXp: (userStats.weeklyXp || 0) + earned,
        gems: userStats.gems + (isBoosted ? 4 : 2),
      });

      if (newCombo % 3 === 0) {
        sounds.playCombo();
        setTermyMood('celebrating');
        setTermyComment(
          isBoosted
            ? `⚡ 2x Turbo Active! ${newCombo} combo! Earned +${earned} XP! Next review ${nextReviewIn}.`
            : `Brilliant! ${newCombo} in a row! Spaced interval moved to ${nextReviewIn}.`
        );
      } else {
        setTermyMood('celebrating');
        setTermyComment(
          isBoosted
            ? `⚡ 2x XP Turbo! +${earned} XP! Next review ${nextReviewIn}.`
            : `Correct! Verified against official marking scheme. Next review ${nextReviewIn}.`
        );
      }
    } else {
      sounds.playIncorrect();
      setComboCount(0);

      // Handle Hearts Mode: Mistakes deduct 1 heart
      if (!isEnergyMode && !userStats.isPro && !isPracticeMode && hearts > 0) {
        const nextHearts = Math.max(0, hearts - 1);
        setHearts(nextHearts);
        onUpdateStats({ hearts: nextHearts });
      }

      // Automatically cycle missed question to end of current queue!
      setQueue((prevQueue) => [...prevQueue, currentQuestion]);
      setTermyMood('encouraging');
      setTermyComment(
        isPracticeMode
          ? `Missed! In practice mode, you don't lose lives. I've cycled it back so you master it before finishing.`
          : `Missed this one! I've cycled it back into your active queue so you master it before finishing. Review in ${nextReviewIn}.`
      );
    }
  }, [
    selectedOption,
    currentQuestion,
    isAnswerChecked,
    currentIndex,
    queue,
    comboCount,
    startTime,
    userStats,
    hearts,
    energyUnits,
    isEnergyMode,
    isPracticeMode,
    onClose,
    onUpdateStats,
  ]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const opt = parseInt(e.key, 10);
        if (!isAnswerChecked && opt <= currentQuestion.options.length) {
          sounds.playClick();
          setSelectedOption(opt);
        }
      }
      if (e.key === 'Enter') {
        if (selectedOption !== null || isAnswerChecked) {
          handleCheckAnswer();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, isAnswerChecked, handleCheckAnswer, onClose]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#131f24] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-card-dark rounded-2xl border border-card-border">
          <h2 className="text-2xl font-bold text-on-surface mb-4">Practice Drill Complete!</h2>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl btn-pressable-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#131f24] overflow-y-auto font-sans antialiased text-on-surface">
      <main className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
        <div className="flex flex-col w-full max-w-3xl mx-auto min-h-0 select-none pb-8">
          {/* Top Drill Header */}
          <header className="w-full flex items-center justify-between gap-4 py-3 sm:py-4 px-2 mb-4">
            <button
              onClick={onClose}
              aria-label="Exit Practice"
              className="w-11 h-11 rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all active:translate-y-0.5 shadow-sm border border-card-border/40"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-4 bg-gray-inactive rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${Math.max(8, progressPercent)}%` }}
              />
            </div>

            {/* Practice Mode Indicator or Lives Counter */}
            {isPracticeMode ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary shadow-sm font-extrabold text-xs">
                <span>💚</span>
                <span className="hidden sm:inline">PRACTICE REFILL</span>
                <span className="sm:hidden">PRACTICE</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenLivesModal) onOpenLivesModal();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-card-border/40 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors ${
                  isEnergyMode ? 'text-lightning-gold' : 'text-crimson-heart'
                }`}
                title="Click to view lives and refill options"
              >
                <span className="text-base leading-none">
                  {isEnergyMode ? '⚡' : '❤️'}
                </span>
                <span className="font-bold">
                  {userStats.isPro ? '∞' : isEnergyMode ? energyUnits : hearts}
                </span>
              </button>
            )}
          </header>

          {/* Out of Lives Modal Overlay */}
          {outOfLives && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-md bg-[#182228] border-2 border-crimson-heart/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-crimson-heart/20 border border-crimson-heart/40 flex items-center justify-center text-3xl shadow-lg">
                  {isEnergyMode ? '⚡' : '💔'}
                </div>

                <div>
                  <h3 className="text-xl font-black text-on-surface">
                    {isEnergyMode ? 'Energy Battery Depleted!' : 'Out of Exam Lives!'}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {isEnergyMode
                      ? 'You have reached 0/25 Energy Units. Refill to keep solving new past paper MCQs, or practice for free!'
                      : 'You reached 0/5 Hearts from tricky MCQ traps. Refill to continue or switch to practice mode!'}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-2.5 pt-2">
                  {/* Option 1: Gem Refill (50 Gems) */}
                  <button
                    onClick={() => {
                      if (userStats.gems < 50) {
                        alert('Not enough Gems! Watch an ad or practice to earn lives.');
                        return;
                      }
                      sounds.playCorrect();
                      if (isEnergyMode) {
                        setEnergyUnits(25);
                        onUpdateStats({ energyUnits: 25, gems: userStats.gems - 50 });
                      } else {
                        setHearts(5);
                        onUpdateStats({ hearts: 5, gems: userStats.gems - 50 });
                      }
                      setOutOfLives(false);
                      alert('Refilled! Continuing drill...');
                    }}
                    className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary-hover text-on-secondary font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Refill Full Capacity (50 💎)</span>
                  </button>

                  {/* Option 2: Practice Mode */}
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setOutOfLives(false);
                      if (isEnergyMode) {
                        setEnergyUnits(5);
                        onUpdateStats({ energyUnits: 5 });
                      } else {
                        setHearts(1);
                        onUpdateStats({ hearts: 1 });
                      }
                      alert('Granted emergency life! Continuing in practice review mode.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-extrabold text-xs uppercase tracking-wider transition-all"
                  >
                    Emergency +1 Life (Free Practice Mode)
                  </button>

                  {/* Option 3: Quit to Dashboard */}
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface font-bold text-xs uppercase tracking-wider transition-colors border border-card-border"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active 2x XP Turbo Banner */}
          {userStats.boostActiveUntil && userStats.boostActiveUntil > Date.now() && (
            <div className="flex items-center justify-between px-4 py-2 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/50 shadow-sm animate-pulse">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">bolt</span>
                <span>2x XP Turbo Multiplier Active</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300">
                {getRemainingBoostTime(userStats.boostActiveUntil).formatted}
              </span>
            </div>
          )}

          {/* Combo / Streak Strip */}
          <div className="flex items-center justify-between px-3.5 py-2 mb-5 rounded-xl bg-surface-container border border-card-border/40 shadow-sm">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-lightning-gold text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                bolt
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-lightning-gold">
                Combo Boost
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs sm:text-sm font-bold text-on-surface">
                {comboCount > 0 ? `${comboCount} in a row!` : 'Streak ready'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-lg font-extrabold font-mono flex items-center gap-1 ${
                  userStats.boostActiveUntil && userStats.boostActiveUntil > Date.now()
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-surface-variant text-primary-fixed-dim'
                }`}
              >
                {userStats.boostActiveUntil && userStats.boostActiveUntil > Date.now() && (
                  <span className="material-symbols-outlined text-xs">bolt</span>
                )}
                +
                {userStats.boostActiveUntil && userStats.boostActiveUntil > Date.now()
                  ? (15 + Math.min(comboCount * 2, 10)) * 2
                  : 15 + Math.min(comboCount * 2, 10)}{' '}
                XP
              </span>
              {sessionXpEarned > 0 && (
                <span className="text-xs text-text-muted hidden sm:inline">
                  (Total: +{sessionXpEarned})
                </span>
              )}
            </div>
          </div>

          {/* Question Metadata */}
          <section className="flex flex-col mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                {currentQuestion.pastPaperYear
                  ? `A/L ICT Past Paper (${currentQuestion.pastPaperYear})`
                  : currentQuestion.unitTitle}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-card-border" />
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {currentQuestion.pastPaperNumber
                  ? `MCQ #${currentQuestion.pastPaperNumber}`
                  : `Question ${currentIndex + 1} of ${queue.length}`}
              </span>
            </div>

            {/* Question Text */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface leading-snug tracking-tight">
              <LatexRenderer content={currentQuestion.question} />
            </h1>
          </section>

          {/* Interactive Logic Diagram / Truth Table / Code Snippet */}
          <QuestionDiagram question={currentQuestion} />

          {/* MCQ Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6" id="mcq-container">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isTargetCorrect = isAnswerChecked && option.id === currentQuestion.correctOption;
              const isTargetIncorrect =
                isAnswerChecked && isSelected && selectedOption !== currentQuestion.correctOption;

              let cardStyle =
                'bg-card-dark border border-card-border/60 shadow-sm hover:bg-surface-variant text-on-surface';
              let badgeStyle =
                'bg-surface-container text-text-muted group-hover:text-on-surface';
              let radioStyle = 'bg-surface-container text-transparent';

              if (isTargetCorrect) {
                cardStyle = 'bg-primary-container text-on-primary-container border-2 border-primary shadow-md';
                badgeStyle = 'bg-surface-container-lowest text-primary font-bold';
                radioStyle = 'bg-surface-container-lowest text-primary';
              } else if (isTargetIncorrect) {
                cardStyle = 'bg-crimson-heart text-white border-2 border-crimson-heart-dark shadow-md';
                badgeStyle = 'bg-surface-container-lowest text-crimson-heart font-bold';
                radioStyle = 'bg-surface-container-lowest text-crimson-heart';
              } else if (isSelected) {
                cardStyle = 'bg-surface-variant border-2 border-secondary text-secondary shadow-md translate-y-0.5';
                badgeStyle = 'bg-secondary-container text-on-secondary-container font-bold';
                radioStyle = 'bg-secondary-container text-on-secondary-container';
              }

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    if (!isAnswerChecked) {
                      sounds.playClick();
                      setSelectedOption(option.id);
                    }
                  }}
                  className={`cursor-pointer group flex items-center justify-between p-4 rounded-2xl transition-all active:translate-y-0.5 ${cardStyle}`}
                  data-option={option.id}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${badgeStyle}`}
                    >
                      {option.id}
                    </span>
                    <span className="text-base sm:text-lg font-mono tracking-wide font-semibold">
                      <LatexRenderer content={option.text} />
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${radioStyle}`}
                  >
                    <span className="material-symbols-outlined text-base font-bold">check</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation Box (Post-Answer) */}
          {isAnswerChecked && (
            <div
              className={`p-4 sm:p-5 rounded-2xl mb-6 border animate-in fade-in slide-in-from-bottom-3 duration-300 ${
                isCorrect
                  ? 'bg-surface-container border-primary/40'
                  : 'bg-surface-container border-crimson-heart/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    isCorrect ? 'text-primary' : 'text-crimson-heart'
                  }`}
                >
                  {isCorrect ? 'check_circle' : 'cancel'}
                </span>
                <h3
                  className={`font-bold text-lg ${
                    isCorrect ? 'text-primary' : 'text-crimson-heart'
                  }`}
                >
                  {isCorrect ? 'Correct Analysis!' : 'Examiner Breakdown:'}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-on-surface leading-relaxed mb-3">
                <LatexRenderer content={currentQuestion.explanation} />
              </p>

              {currentQuestion.trapInsight && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-card-border/50 text-xs sm:text-sm text-text-muted flex items-start gap-2">
                  <span className="material-symbols-outlined text-lightning-gold text-base shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <div>
                    <span className="text-lightning-gold font-bold mr-1">Exam Trap:</span>
                    <LatexRenderer content={currentQuestion.trapInsight} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Termy Mascot Study Companion Card */}
          <div className="w-full flex items-center justify-center mb-6">
            <TermyBear
              mood={termyMood}
              size="md"
              speechText={termyComment}
              showSpeechBubble={true}
            />
          </div>

          {/* Action Button Strip */}
          <div className="w-full mt-auto pt-4 px-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-card-border/40">
            <div className="flex items-center gap-6 text-text-muted w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => alert(`Reported MCQ #${currentQuestion.pastPaperNumber || currentQuestion.id} for syllabus review.`)}
                className="flex items-center gap-2 hover:text-on-surface transition-colors py-2 text-xs uppercase tracking-wider font-bold"
              >
                <span className="material-symbols-outlined text-lg">flag</span>
                <span>Report Trap</span>
              </button>
              <span className="text-xs text-text-muted font-mono hidden sm:inline">
                Shortcuts: [1-5] to select, [Enter] to submit
              </span>
            </div>

            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null && !isAnswerChecked}
              className={`w-full sm:w-60 h-14 rounded-2xl font-bold uppercase tracking-wider shadow-lg flex items-center justify-center transition-all ${
                selectedOption === null && !isAnswerChecked
                  ? 'bg-gray-inactive text-text-muted cursor-not-allowed'
                  : isAnswerChecked
                  ? isCorrect
                    ? 'bg-lightning-gold text-on-tertiary-container btn-pressable-gold'
                    : 'bg-surface-variant text-on-surface border border-card-border hover:bg-card-dark'
                  : 'bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container btn-pressable-primary'
              }`}
              id="check-answer-btn"
            >
              {isAnswerChecked
                ? isCorrect
                  ? 'Continue →'
                  : currentIndex + 1 < queue.length
                  ? 'Retry Concept Next →'
                  : 'Finish Drill'
                : 'Check Answer'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
