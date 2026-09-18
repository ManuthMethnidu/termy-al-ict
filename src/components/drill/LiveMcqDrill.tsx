import React, { useState, useEffect, useCallback } from 'react';
import { McqQuestion, UserStats } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';
import { QuestionDiagram } from './QuestionDiagram';
import { TermyBear, TermyMood } from '../mascot/TermyBear';
import { sounds } from '../../lib/sound';
import { recordAnswer } from '../../lib/spacedRepetition';
import { logMcqAttempt } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface LiveMcqDrillProps {
  questions: McqQuestion[];
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onClose: () => void;
}

export const LiveMcqDrill: React.FC<LiveMcqDrillProps> = ({
  questions: initialQuestions,
  userStats,
  onUpdateStats,
  onClose,
}) => {
  // Active question queue (allows missed questions to be cycled back to end of queue!)
  const [queue, setQueue] = useState<McqQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [comboCount, setComboCount] = useState<number>(3);
  const [hearts, setHearts] = useState<number>(userStats.hearts);
  const [sessionXpEarned, setSessionXpEarned] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [termyMood, setTermyMood] = useState<TermyMood>('idle');
  const [termyComment, setTermyComment] = useState<string>(
    'Focus on the minterm expansions! Use keyboard keys 1-4 to select.'
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onClose();
      }
      return;
    }

    // Checking now
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

    if (correct) {
      sounds.playCorrect();
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      const earned = 15 + Math.min(newCombo * 2, 10);
      setSessionXpEarned((prev) => prev + earned);
      onUpdateStats({
        xp: userStats.xp + earned,
        gems: userStats.gems + 2,
      });

      if (newCombo % 3 === 0) {
        sounds.playCombo();
        setTermyMood('celebrating');
        setTermyComment(`Brilliant! ${newCombo} in a row! Spaced interval moved to ${nextReviewIn}.`);
      } else {
        setTermyMood('celebrating');
        setTermyComment(`Correct! Verified against official marking scheme. Next review ${nextReviewIn}.`);
      }
    } else {
      sounds.playIncorrect();
      setComboCount(0);
      if (!userStats.isPro && hearts > 0) {
        const nextHearts = Math.max(0, hearts - 1);
        setHearts(nextHearts);
        onUpdateStats({ hearts: nextHearts });
      }

      // Automatically cycle missed question to end of current queue!
      setQueue((prevQueue) => [...prevQueue, currentQuestion]);
      setTermyMood('encouraging');
      setTermyComment(
        `Missed this one! I've cycled it back into your active queue so you master it before finishing. Review in ${nextReviewIn}.`
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

            {/* Hearts Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-card-border/40 shadow-sm">
              <span
                className="material-symbols-outlined text-crimson-heart text-xl animate-pulse"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                favorite
              </span>
              <span className="font-bold text-crimson-heart">
                {userStats.isPro ? '∞' : hearts}
              </span>
            </div>
          </header>

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
              <span className="text-xs px-2 py-0.5 rounded-lg bg-surface-variant text-primary-fixed-dim font-extrabold font-mono">
                +{15 + Math.min(comboCount * 2, 10)} XP
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
