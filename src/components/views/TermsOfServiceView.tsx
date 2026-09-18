import React, { useEffect } from 'react';
import { NavTab } from '../../types';

interface TermsOfServiceViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 pb-24 text-on-surface select-text">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-card-border/60">
        <div className="flex items-center gap-2 text-sm text-text-muted select-none">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('learn');
            }}
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Dashboard</span>
          </a>
          <span>/</span>
          <span className="text-on-surface font-semibold">Terms of Service</span>
        </div>

        <div className="flex items-center gap-2 select-none">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('privacy');
            }}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border text-xs font-bold text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Privacy Policy</span>
          </a>
          <a
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('more');
            }}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border text-xs font-bold text-text-muted hover:text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Settings</span>
          </a>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card-dark border-2 border-card-border shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-lightning-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-lightning-gold/10 border-2 border-lightning-gold/30 flex items-center justify-center text-lightning-gold shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-3xl">gavel</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-lightning-gold/20 text-lightning-gold font-mono text-[11px] font-extrabold uppercase tracking-wider border border-lightning-gold/30">
                  User Agreement
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container text-text-muted font-mono text-[11px] border border-card-border">
                  URL: /terms
                </span>
                <span className="text-xs text-text-muted font-mono">
                  Effective: September 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Termy Terms of Service
              </h1>
              <p className="text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                Please read these terms carefully before accessing or practicing on the Termy A/L ICT Revision Platform.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-mono text-text-muted bg-surface-container/60 px-3.5 py-2 rounded-xl border border-card-border/40">
            <span className="text-lightning-gold font-bold">Academic Revision</span>
            <span>Standard G.C.E. A/L</span>
          </div>
        </div>
      </div>

      {/* Table of Contents Bar */}
      <div className="p-4 rounded-2xl bg-surface-container/80 border border-card-border mb-8 shadow-sm">
        <div className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">toc</span>
          <span>Table of Contents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-semibold">
          {[
            { id: 'acceptance', title: '1. Acceptance of Terms' },
            { id: 'disclaimer', title: '2. Educational Disclaimer' },
            { id: 'intellectual-property', title: '3. Intellectual Property' },
            { id: 'accounts', title: '4. User Accounts & Google Auth' },
            { id: 'gamified-economy', title: '5. Virtual Economy & Bits' },
            { id: 'acceptable-use', title: '6. Acceptable Use & Conduct' },
            { id: 'warranty-disclaimer', title: '7. "As-Is" Warranty Disclaimer' },
            { id: 'liability', title: '8. Limitation of Liability' },
            { id: 'governing-law', title: '9. Governing Law & Dispute' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-left px-3 py-1.5 rounded-lg text-text-muted hover:text-lightning-gold hover:bg-surface-variant transition-colors truncate"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Sections */}
      <div className="flex flex-col gap-8 text-sm leading-relaxed">
        {/* 1. Acceptance of Terms */}
        <section id="acceptance" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">fact_check</span>
            <h2>1. Acceptance of Terms</h2>
          </div>
          <p className="text-text-muted mb-3">
            By creating an account, browsing, or utilizing any feature of the <strong className="text-on-surface">Termy</strong> web application (including our question bank, spaced repetition drills, interactive logic gate simulators, and leaderboards), you confirm that you have read, understood, and agreed to be bound by these Terms of Service.
          </p>
          <p className="text-text-muted">
            If you do not agree with any part of these Terms, you must discontinue your use of Termy immediately. If you are under 18 years of age, you confirm that you have reviewed these terms with a parent or legal guardian.
          </p>
        </section>

        {/* 2. Educational Disclaimer & Non-Affiliation */}
        <section id="disclaimer" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">school</span>
            <h2>2. Educational Nature & Non-Affiliation Disclaimer</h2>
          </div>
          <p className="text-text-muted mb-3">
            Termy is an independent revision and self-study platform designed to assist candidates preparing for the <strong className="text-on-surface">General Certificate of Education (Advanced Level) Information and Communication Technology (Subject 20)</strong> examination in Sri Lanka.
          </p>

          <div className="p-4 rounded-xl bg-lightning-gold/10 border border-lightning-gold/30 my-3 text-xs leading-relaxed text-on-surface">
            <strong className="text-lightning-gold font-bold block mb-1">Official Disclaimer of Non-Affiliation:</strong>
            Termy is NOT an official body, affiliate, agent, or representative of the <strong>Department of Examinations Sri Lanka (DoENETS)</strong>, the <strong>National Institute of Education (NIE)</strong>, or the <strong>Ministry of Education Sri Lanka</strong>. All official past examination papers and syllabi remain the prerogative of their respective statutory bodies.
          </div>

          <p className="text-text-muted">
            While our question bank and marking scheme explanations are meticulously researched and cross-referenced with official G.C.E. A/L teacher instructional manuals and marking criteria, Termy makes no official guarantee of examination results.
          </p>
        </section>

        {/* 3. Intellectual Property & Past Exam Content */}
        <section id="intellectual-property" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">copyright</span>
            <h2>3. Intellectual Property & Question Content</h2>
          </div>
          <div className="space-y-3 text-text-muted">
            <div>
              <strong className="text-on-surface block mb-1">A. Past Examination Questions (Fair Educational Use):</strong>
              Past national examination MCQ questions cited on the platform are provided strictly under fair dealing for educational criticism, review, and academic instruction. We attribute historical questions to their respective examination years (2011–2024).
            </div>
            <div>
              <strong className="text-on-surface block mb-1">B. Proprietary Explanations & Software:</strong>
              The original trap insight breakdowns, step-by-step mathematical derivations, interactive Karnaugh map and logic gate renderers, mascot assets (Termy Bear), code simulators, and source code of the Termy application are the exclusive intellectual property of the Termy development team. You may not scrape, republish, or commercialize these materials without prior written consent.
            </div>
          </div>
        </section>

        {/* 4. User Accounts & Google Authentication */}
        <section id="accounts" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">person_pin</span>
            <h2>4. User Accounts & Authentication Security</h2>
          </div>
          <p className="text-text-muted mb-3">
            Candidates may practice anonymously or sign in via Google OAuth. When creating an account:
          </p>
          <ul className="space-y-2 text-text-muted text-xs">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-lightning-gold text-sm mt-0.5">check</span>
              <span>You agree to provide accurate, non-misleading information regarding your candidate batch and school.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-lightning-gold text-sm mt-0.5">check</span>
              <span>You are solely responsible for maintaining the confidentiality of your Google login credentials and all activities occurring under your session.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-lightning-gold text-sm mt-0.5">check</span>
              <span>Multiple automated accounts created to manipulate leaderboard ranks or exploit quest rewards are subject to immediate permanent suspension.</span>
            </li>
          </ul>
        </section>

        {/* 5. Virtual Economy & Bits */}
        <section id="gamified-economy" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">diamond</span>
            <h2>5. Virtual Economy, Bits, & In-App Items</h2>
          </div>
          <p className="text-text-muted mb-3">
            Termy features gamification elements to encourage consistent, daily revision habits:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
            <div className="p-3 rounded-xl bg-surface-container border border-card-border">
              <span className="font-bold text-secondary flex items-center gap-1 mb-1">
                <span>💎</span> Bits / Gems
              </span>
              <span className="text-text-muted">Virtual points earned by completing drills and maintaining streaks. Non-monetary.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container border border-card-border">
              <span className="font-bold text-crimson-heart flex items-center gap-1 mb-1">
                <span>❤️</span> Exam Lives
              </span>
              <span className="text-text-muted">Tokens that encourage careful reading of questions during active sessions.</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container border border-card-border/60 text-xs text-text-muted">
            <strong className="text-on-surface">No Cash Value:</strong> All virtual items (Bits, Hearts, Streak Freezes, Pro Pass features, Badges) are purely educational incentives. They possess zero monetary worth, cannot be transferred between accounts, and cannot be redeemed or refunded for real currency.
          </div>
        </section>

        {/* 6. Acceptable Use & Conduct */}
        <section id="acceptable-use" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">shield</span>
            <h2>6. Acceptable Use & Prohibited Activities</h2>
          </div>
          <p className="text-text-muted mb-3">
            When accessing Termy, you explicitly agree <strong className="text-on-surface">not</strong> to:
          </p>
          <ul className="space-y-2 text-text-muted text-xs">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-crimson-heart text-sm mt-0.5">block</span>
              <span>Use automated bots, scripts, or scrapers to harvest questions, answer keys, or user telemetry from the 2,600+ question bank.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-crimson-heart text-sm mt-0.5">block</span>
              <span>Attempt to bypass Supabase Row-Level Security, inject malicious SQL/XSS payloads, or access unauthorized administrative endpoints.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-crimson-heart text-sm mt-0.5">block</span>
              <span>Launch Denial-of-Service (DoS) attacks or disproportionately overload the hosted database cluster.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-crimson-heart text-sm mt-0.5">block</span>
              <span>Post profane, harassing, defamatory, or abusive candidate display names or school identifiers.</span>
            </li>
          </ul>
        </section>

        {/* 7. As-Is Warranty Disclaimer */}
        <section id="warranty-disclaimer" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">warning</span>
            <h2>7. Disclaimer of Warranties (&ldquo;As-Is&rdquo;)</h2>
          </div>
          <p className="text-text-muted text-xs leading-relaxed">
            THE TERMY PLATFORM, CONTENT, QUESTION REPOSITORIES, AND SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, TERMY DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR ACADEMIC PURPOSE, OR FREEDOM FROM PROGRAM BUGS. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE IMMEDIATELY CORRECTED.
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section id="liability" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">policy</span>
            <h2>8. Limitation of Liability</h2>
          </div>
          <p className="text-text-muted text-xs leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL TERMY, ITS FOUNDERS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, STUDY PROGRESS, OR ACADEMIC OPPORTUNITY ARISING OUT OF OR RELATED TO YOUR ACCESS OR USE OF (OR INABILITY TO ACCESS OR USE) THE PLATFORM.
          </p>
        </section>

        {/* 9. Governing Law & Dispute Resolution */}
        <section id="governing-law" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-lightning-gold font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">gavel</span>
            <h2>9. Governing Law & Dispute Resolution</h2>
          </div>
          <p className="text-text-muted mb-3">
            These Terms of Service and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the <strong className="text-on-surface">Democratic Socialist Republic of Sri Lanka</strong>.
          </p>
          <div className="p-4 rounded-xl bg-surface-container border border-card-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-on-surface">Questions or Terms Inquiries?</span>
              <p className="text-xs text-text-muted mt-0.5">
                Contact the Termy administration team for permissions or clarifications.
              </p>
            </div>
            <button
              onClick={() => onNavigate('privacy')}
              className="px-4 py-2 rounded-xl bg-lightning-gold/20 hover:bg-lightning-gold text-lightning-gold hover:text-on-primary-fixed border border-lightning-gold/40 font-bold text-xs uppercase tracking-wider transition-all shrink-0"
            >
              Read Privacy Policy
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Navigation Switcher */}
      <div className="mt-12 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted select-none">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('learn');
          }}
          className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return to ICT Dashboard</span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('privacy');
            }}
            className="hover:text-primary transition-colors font-bold underline underline-offset-4"
          >
            Review Privacy Policy (/privacy)
          </a>
          <span>•</span>
          <a
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('more');
            }}
            className="hover:text-primary transition-colors font-bold"
          >
            Settings & Preferences
          </a>
        </div>
      </div>
    </div>
  );
};
