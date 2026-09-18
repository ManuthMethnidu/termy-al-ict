import React, { useEffect } from 'react';
import { NavTab } from '../../types';

interface PrivacyPolicyViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
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
          <button
            onClick={() => onNavigate('learn')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Dashboard</span>
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">Privacy Policy</span>
        </div>

        <div className="flex items-center gap-2 select-none">
          <button
            onClick={() => onNavigate('terms')}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border text-xs font-bold text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">gavel</span>
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => onNavigate('more')}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border text-xs font-bold text-text-muted hover:text-on-surface transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card-dark border-2 border-card-border shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[11px] font-extrabold uppercase tracking-wider border border-primary/30">
                  Public Legal Document
                </span>
                <span className="text-xs text-text-muted font-mono">
                  Effective: September 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Termy Privacy Policy
              </h1>
              <p className="text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                Student-first privacy standards for Sri Lankan G.C.E. Advanced Level ICT candidates, educators, and visitors.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-mono text-text-muted bg-surface-container/60 px-3.5 py-2 rounded-xl border border-card-border/40">
            <span className="text-primary font-bold">100% Student-First</span>
            <span>Zero Ad Tracking</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Anchor Bar */}
      <div className="p-4 rounded-2xl bg-surface-container/80 border border-card-border mb-8 shadow-sm">
        <div className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">toc</span>
          <span>Table of Contents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-semibold">
          {[
            { id: 'overview', title: '1. Overview & Commitment' },
            { id: 'data-collected', title: '2. Information We Collect' },
            { id: 'data-usage', title: '3. How We Use Data' },
            { id: 'third-party', title: '4. Third-Party Infrastructure' },
            { id: 'security-rls', title: '5. Security & Row-Level Security' },
            { id: 'cookies-storage', title: '6. Local Storage & Cookies' },
            { id: 'student-privacy', title: '7. Student & Minor Privacy' },
            { id: 'user-rights', title: '8. Data Rights & Deletion' },
            { id: 'contact-updates', title: '9. Changes & Contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-left px-3 py-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-variant transition-colors truncate"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="flex flex-col gap-8 text-sm leading-relaxed">
        {/* 1. Overview */}
        <section id="overview" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">info</span>
            <h2>1. Overview & Commitment to Privacy</h2>
          </div>
          <p className="text-text-muted mb-3">
            Welcome to <strong className="text-on-surface">Termy</strong> (“Termy”, “we”, “us”, or “our”). Termy is an interactive, gamified active recall and revision platform tailored for students preparing for the <strong className="text-on-surface">Sri Lankan G.C.E. Advanced Level Examination in Information and Communication Technology (ICT)</strong>.
          </p>
          <p className="text-text-muted">
            We believe that educational tools must respect candidate privacy. We do not sell, license, or monetize candidate data. This Privacy Policy details the exact types of data we collect, why we collect it, how it is secured via cryptographic measures and database Row-Level Security (RLS), and how you can exercise full control over your personal learning records.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section id="data-collected" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">database</span>
            <h2>2. Information We Collect</h2>
          </div>
          <p className="text-text-muted mb-4">
            Depending on how you use Termy—whether anonymously as a guest or with a synchronized Google Account—we collect the following categories of information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60">
              <div className="flex items-center gap-2 font-bold text-on-surface mb-1.5">
                <span className="material-symbols-outlined text-lightning-gold text-lg">account_circle</span>
                <span>A. Google Identity / Account Profile</span>
              </div>
              <p className="text-xs text-text-muted leading-normal">
                When you sign in using Google Single Sign-On via Supabase Auth, we receive your verified Google display name, email address, public profile avatar URL, and an immutable Supabase user UUID. We do <strong className="text-on-surface">never</strong> receive, see, or store your Google password.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60">
              <div className="flex items-center gap-2 font-bold text-on-surface mb-1.5">
                <span className="material-symbols-outlined text-secondary text-lg">insights</span>
                <span>B. Academic & Practice Telemetry</span>
              </div>
              <p className="text-xs text-text-muted leading-normal">
                To power active recall, we record your MCQ practice answers, submission timestamps, response latency, accuracy per syllabus unit (Units 1 through 12), SuperMemo SM-2 spaced repetition intervals, ease factors, consecutive streak counts, and earned Bits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60">
              <div className="flex items-center gap-2 font-bold text-on-surface mb-1.5">
                <span className="material-symbols-outlined text-primary text-lg">tune</span>
                <span>C. Candidate Preferences & Customization</span>
              </div>
              <p className="text-xs text-text-muted leading-normal">
                Candidate study profile configurations such as target A/L examination batch year, academic stream, school/institute name, sound effect volumes, vibration toggles, and daily study time goals (10, 20, or 30 minutes).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60">
              <div className="flex items-center gap-2 font-bold text-on-surface mb-1.5">
                <span className="material-symbols-outlined text-crimson-heart text-lg">devices</span>
                <span>D. Technical & Diagnostic Logs</span>
              </div>
              <p className="text-xs text-text-muted leading-normal">
                Basic browser user-agent, operating system, and connection status necessary to diagnose client-side rendering issues, deliver offline caching via service workers, and prevent automated denial-of-service attempts.
              </p>
            </div>
          </div>
        </section>

        {/* 3. How We Use Data */}
        <section id="data-usage" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">psychology</span>
            <h2>3. How We Use Your Data</h2>
          </div>
          <p className="text-text-muted mb-4">
            Candidate telemetry is strictly processed to optimize your G.C.E. Advanced Level ICT exam readiness:
          </p>

          <ul className="space-y-3 text-text-muted">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
              <div>
                <strong className="text-on-surface">Adaptive Spaced Repetition (SM-2):</strong> Calculating optimal review intervals so questions you struggle with are re-tested before forgetting occurs, while mastering concepts expands the review interval up to weeks.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
              <div>
                <strong className="text-on-surface">National & School Leaderboards:</strong> Aggregating weekly experience points (XP), streak days, and unit mastery rates to display rank tiers (Bronze through Diamond League) on the public candidate leaderboard.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
              <div>
                <strong className="text-on-surface">Syllabus Gap Identification:</strong> Providing candidate-level breakdowns revealing weaknesses in specific domains (e.g. Unit 3 Boolean Algebra, Unit 8 Python loops, or Unit 9 SQL joins).
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
              <div>
                <strong className="text-on-surface">Service Continuity & Cross-Device Sync:</strong> Allowing you to seamlessly switch between smartphone, tablet, and desktop without losing your solved questions or streak count.
              </div>
            </li>
          </ul>
        </section>

        {/* 4. Third-Party Infrastructure */}
        <section id="third-party" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">cloud_sync</span>
            <h2>4. Third-Party Infrastructure & Subprocessors</h2>
          </div>
          <p className="text-text-muted mb-4">
            We partner exclusively with trusted, enterprise-grade cloud platforms to host our data services:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-on-surface">Supabase Inc. (Database & Auth Provider)</span>
                <p className="text-xs text-text-muted mt-1">
                  Provides our hosted PostgreSQL database, authentication microservices, and storage. Data resides in secure ISO 27001 / SOC 2 Type II compliant data centers.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-container-high text-primary border border-card-border shrink-0">
                Encrypted at Rest
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-card-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-on-surface">Google Identity Services</span>
                <p className="text-xs text-text-muted mt-1">
                  Provides OAuth 2.0 authentication verification to guarantee that your email address and profile identity are genuine.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-container-high text-secondary border border-card-border shrink-0">
                OAuth 2.0 / OpenID
              </span>
            </div>
          </div>
        </section>

        {/* 5. Security & Row-Level Security */}
        <section id="security-rls" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">security</span>
            <h2>5. Data Security & Row-Level Security (RLS)</h2>
          </div>
          <p className="text-text-muted mb-3">
            Termy implements a defense-in-depth security model:
          </p>

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4 text-xs leading-relaxed text-on-surface">
            <strong className="text-primary font-bold block mb-1">PostgreSQL Row-Level Security (RLS) Enforced:</strong>
            Our Supabase database strictly isolates candidate records at the SQL engine level. Even if a malicious actor accesses the public API, RLS policies prevent them from reading, modifying, or deleting other students’ quiz attempts, study queues, or inventory records.
          </div>

          <ul className="space-y-2 text-text-muted text-xs">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>All communications between candidate browsers and our backend are secured via TLS 1.3 encryption in transit.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>Administrative actions and root modifications require multi-factor console authentication.</span>
            </li>
          </ul>
        </section>

        {/* 6. Cookies & Local Storage */}
        <section id="cookies-storage" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">cookie</span>
            <h2>6. Client Storage & Cookie Policy</h2>
          </div>
          <p className="text-text-muted mb-3">
            Termy does <strong className="text-on-surface">not</strong> use third-party advertising cookies or cross-site tracking beacons. We utilize modern browser storage technologies (<code className="text-primary font-mono text-xs">localStorage</code> and secure session cookies) strictly for essential app functionality:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-container border border-card-border">
              <span className="font-bold text-on-surface block mb-1">Auth Session</span>
              <span className="text-text-muted">Keeps your Google login active between page refreshes.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container border border-card-border">
              <span className="font-bold text-on-surface block mb-1">Candidate Preferences</span>
              <span className="text-text-muted">Stores audio, vibration, and theme selections locally.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container border border-card-border">
              <span className="font-bold text-on-surface block mb-1">Offline Drill Cache</span>
              <span className="text-text-muted">Caches recent question items for low-latency practice.</span>
            </div>
          </div>
        </section>

        {/* 7. Student & Minor Privacy */}
        <section id="student-privacy" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">school</span>
            <h2>7. Student & Minor Privacy Protection</h2>
          </div>
          <p className="text-text-muted mb-3">
            Termy is expressly built for secondary school students preparing for the Sri Lankan G.C.E. Advanced Level examinations (typically ages 15 to 19).
          </p>
          <p className="text-text-muted">
            We adhere to the highest ethical principles for student data: we do not profile students for behavioral advertising, we do not require excessive personal details (such as National Identity Card / NIC numbers or home addresses), and student records are never commercialized.
          </p>
        </section>

        {/* 8. User Rights & Data Deletion */}
        <section id="user-rights" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
            <h2>8. Your Rights & Data Deletion</h2>
          </div>
          <p className="text-text-muted mb-3">
            You retain absolute ownership of your educational data. You have the right to:
          </p>

          <div className="space-y-2 text-text-muted text-xs">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
              <span><strong className="text-on-surface">Inspect & Export:</strong> View all your practice records, streaks, and analytics directly from your Profile and Settings views.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
              <span><strong className="text-on-surface">Reset Local Telemetry:</strong> Purge local browser storage at any time using the Reset buttons in Settings.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-crimson-heart text-sm mt-0.5">delete_forever</span>
              <span><strong className="text-on-surface">Permanent Cloud Deletion:</strong> Request the total eradication of your Supabase user profile and associated quiz attempt logs by contacting the administrator or unlinking your Google account.</span>
            </div>
          </div>
        </section>

        {/* 9. Contact & Updates */}
        <section id="contact-updates" className="p-6 sm:p-7 rounded-2xl bg-card-dark border border-card-border shadow-sm">
          <div className="flex items-center gap-2.5 mb-3 text-primary font-bold text-base uppercase tracking-wider">
            <span className="material-symbols-outlined text-xl">contact_support</span>
            <h2>9. Policy Modifications & Inquiries</h2>
          </div>
          <p className="text-text-muted mb-4">
            We may periodically revise this Privacy Policy to reflect syllabus updates or cloud architectural enhancements. Significant changes will be prominently highlighted in the platform notice board.
          </p>
          <div className="p-4 rounded-xl bg-surface-container border border-card-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-on-surface">Platform Administration & Inquiries</span>
              <p className="text-xs text-text-muted mt-0.5">
                For privacy requests, data deletion inquiries, or feedback on question explanations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('more')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary-fixed font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shrink-0"
            >
              Open Settings
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Navigation Switcher */}
      <div className="mt-12 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted select-none">
        <button
          onClick={() => onNavigate('learn')}
          className="hover:text-primary transition-colors flex items-center gap-1.5 font-bold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return to ICT Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-primary transition-colors font-bold underline underline-offset-4"
          >
            Review Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigate('more')}
            className="hover:text-primary transition-colors font-bold"
          >
            Settings & Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
