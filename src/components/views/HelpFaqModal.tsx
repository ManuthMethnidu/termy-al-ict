import React, { useState } from 'react';
import { TermyBear } from '../mascot/TermyBear';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Who is Termy?',
      a: 'Termy is an analytical, ice-bear study companion equipped with an orange beanie and high-tech focus goggles. Termy tracks your active recall habits, breaks down complex Sri Lankan G.C.E. A/L ICT marking schemes, and ensures you never forget a tricky concept by smartly scheduling reviews.',
    },
    {
      q: 'How does the Spaced Repetition Engine work?',
      a: "Termy utilizes an adapted SuperMemo SM-2 spaced repetition algorithm. When you answer a question correctly, its review interval expands (10 min → 1 day → 3 days → 7+ days). If you get an answer incorrect, the question is immediately cycled back to the end of your active queue and its interval resets to 2 minutes. You cannot finish a drill until every missed concept is mastered!",
    },
    {
      q: 'Which keyboard shortcuts are available?',
      a: 'Termy is built for high-speed, distraction-free study: Press [1], [2], [3], or [4] to select MCQ options. Press [Enter] to submit your choice and [Enter] again to advance to the next question. Press [Esc] to exit any drill.',
    },
    {
      q: 'Are the questions aligned with the official NIE syllabus?',
      a: 'Yes! All questions and explanations are strictly aligned with the National Institute of Education (NIE) Sri Lanka G.C.E. Advanced Level ICT curriculum (Units 1 through 14) and verified against official Department of Examinations marking schemes.',
    },
    {
      q: 'How do Exam Lives (Hearts) and the Diamond League work?',
      a: 'Every student has 5 exam lives that regenerate over time. Mistakes during MCQ drills consume 1 life, incentivizing careful reading of questions. Weekly XP earned from drills determines your rank in the Diamond League. Top 10 students advance each week!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-container rounded-2xl border-2 border-card-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-extrabold">
                Termy Support & Guidelines
              </span>
              <h2 className="text-xl font-extrabold text-on-surface">
                Help Center & Knowledge Base
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Mascot Banner */}
        <div className="p-4 rounded-xl bg-card-dark border border-card-border flex items-center gap-4 mb-6">
          <TermyBear size="sm" mood="thinking" showSpeechBubble={false} />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">Meet Termy</span>
            <p className="text-xs text-text-muted">
              Your ice-bear study buddy is ready to accelerate your A/L ICT revision. Have questions? Browse the FAQs below!
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-card-border bg-card-dark overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-variant/50 transition-colors"
                >
                  <span className="font-bold text-sm text-on-surface">{faq.q}</span>
                  <span className="material-symbols-outlined text-text-muted text-xl transition-transform duration-200">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-card-border/30 bg-surface-container/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Keyboard Cheatsheet Box */}
        <div className="mt-6 p-4 rounded-xl bg-surface-container-lowest border border-card-border">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-2">
            Speed Keybindings Reference
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 p-2 rounded bg-surface-container">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-card-border text-primary font-bold">
                1-4
              </kbd>
              <span className="text-text-muted">Select Option</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-surface-container">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-card-border text-lightning-gold font-bold">
                Enter
              </kbd>
              <span className="text-text-muted">Submit / Next</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-surface-container">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-card-border text-secondary font-bold">
                Esc
              </kbd>
              <span className="text-text-muted">Exit Drill</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-card-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs uppercase rounded-xl transition-all"
          >
            Close FAQ
          </button>
        </div>
      </div>
    </div>
  );
};
