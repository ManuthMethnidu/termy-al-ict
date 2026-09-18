import React, { useState, useEffect } from 'react';
import {
  getSupabaseClient,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';
import { sounds } from '../../lib/sound';

interface AdminPanelProps {
  onExit: () => void;
}

const ADMIN_USER = 'MANA';
const ADMIN_PASS = 'Mana0@47855';
const SESSION_KEY = 'termy_admin_auth_v1';

export const AdminPanelView: React.FC<AdminPanelProps> = ({ onExit }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
    }
    return false;
  });

  const [inputUser, setInputUser] = useState<string>('');
  const [inputPass, setInputPass] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'candidates' | 'database' | 'questions'>('overview');

  // Database states
  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(dbConfig.url);
  const [inputKey, setInputKey] = useState(dbConfig.key);
  const [connStatus, setConnStatus] = useState<{ loading: boolean; success: boolean; message: string }>({
    loading: false,
    success: false,
    message: '',
  });

  // Telemetry data
  const [telemetry, setTelemetry] = useState({
    totalQuestions: 2636,
    totalCandidates: 0,
    totalAttempts: 0,
    activeQuests: 4,
  });

  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUser.trim() === ADMIN_USER && inputPass === ADMIN_PASS) {
      sounds.playFanfare();
      sessionStorage.setItem(SESSION_KEY, 'authenticated');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      sounds.playIncorrect();
      setAuthError('Access Denied: Invalid root administrator credentials.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setInputPass('');
    sounds.playClick();
  };

  // Test and update DB connection
  const handleTestAndSaveDb = async () => {
    if (!inputUrl.trim() || !inputKey.trim()) {
      alert('Please enter both Supabase URL and Anon Key.');
      return;
    }
    setConnStatus({ loading: true, success: false, message: 'Verifying credentials...' });
    const result = await testSupabaseConnection(inputUrl.trim(), inputKey.trim());
    if (result.success) {
      sounds.playCorrect();
      saveSupabaseConfig(inputUrl.trim(), inputKey.trim());
      setDbConfig(getSupabaseConfig());
      setConnStatus({ loading: false, success: true, message: result.message });
      fetchAdminData();
    } else {
      sounds.playIncorrect();
      setConnStatus({ loading: false, success: false, message: result.message });
    }
  };

  // Fetch admin database telemetry
  const fetchAdminData = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    setLoadingCandidates(true);
    try {
      // Questions count
      const { count: qCount } = await client
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Candidates count & data
      const { data: profiles, count: pCount } = await client
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('xp', { ascending: false });

      // Attempts count
      const { count: aCount } = await client
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true });

      setTelemetry((prev) => ({
        ...prev,
        totalQuestions: qCount || 2636,
        totalCandidates: pCount || 0,
        totalAttempts: aCount || 0,
      }));

      if (profiles) {
        setCandidatesList(profiles);
      }
    } catch (err) {
      console.warn('Admin telemetry fetch error:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  // If not authenticated, render Admin Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-md mx-auto p-4 select-none">
        <div className="w-full bg-card-dark border-2 border-primary/50 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(116,233,48,0.3)]">
              <span className="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface mt-2 tracking-wide">
              Root Admin Terminal
            </h1>
            <p className="text-xs text-text-muted">
              Restricted control center for Termy A/L ICT. Unauthorized access is monitored.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-muted font-bold tracking-wider uppercase">
                Admin Username
              </label>
              <input
                type="text"
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
                placeholder="Enter admin ID"
                autoFocus
                className="px-4 py-3 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-muted font-bold tracking-wider uppercase">
                Root Password
              </label>
              <input
                type="password"
                value={inputPass}
                onChange={(e) => setInputPass(e.target.value)}
                placeholder="••••••••••••"
                className="px-4 py-3 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-crimson-heart/10 border border-crimson-heart/30 text-crimson-heart text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              <span>Authenticate Root Access</span>
            </button>
          </form>

          <button
            onClick={onExit}
            className="text-xs text-text-muted hover:text-on-surface text-center transition-colors uppercase tracking-wider font-semibold"
          >
            ← Return to Candidate Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter candidates
  const filteredCandidates = candidatesList.filter((c) => {
    const q = candidateSearch.toLowerCase();
    return (
      c.display_name?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.school?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-8 pb-24 md:pb-12 select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card-dark border-2 border-primary/50 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl font-bold">shield</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">Termy Master Admin</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-mono font-bold uppercase border border-primary/40">
                Logged in as MANA
              </span>
            </div>
            <span className="text-xs text-text-muted font-mono">
              Database: lhzghbqjxkaexbcgpvev • PostgreSQL Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-surface-container hover:bg-crimson-heart/20 text-crimson-heart rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Lock Panel</span>
          </button>

          <button
            onClick={onExit}
            className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border transition-colors"
          >
            Candidate View →
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-card-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-primary text-on-primary-fixed shadow-sm'
              : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'database'
              ? 'bg-primary text-on-primary-fixed shadow-sm'
              : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">database</span>
          <span>Database & API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('candidates')}
          className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'candidates'
              ? 'bg-primary text-on-primary-fixed shadow-sm'
              : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Candidates ({telemetry.totalCandidates})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">Total MCQs</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">
                {telemetry.totalQuestions.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-muted">12 A/L Syllabus Modules</span>
            </div>

            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">Candidates</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-secondary">
                {telemetry.totalCandidates}
              </span>
              <span className="text-[10px] text-text-muted">Google Authenticated</span>
            </div>

            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">MCQ Attempts Logged</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-lightning-gold">
                {telemetry.totalAttempts}
              </span>
              <span className="text-[10px] text-text-muted">Telemetry rows</span>
            </div>

            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">Daily Quests</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-pink-400">
                {telemetry.activeQuests}
              </span>
              <span className="text-[10px] text-text-muted">Daily reset cycle</span>
            </div>
          </div>

          {/* Quick Actions & Console Links */}
          <div className="p-6 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-4 shadow-md">
            <h3 className="text-base font-bold text-on-surface uppercase tracking-wider text-primary">
              Management Direct Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://supabase.com/dashboard/project/lhzghbqjxkaexbcgpvev"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">open_in_new</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">Supabase Dashboard</span>
                    <span className="text-xs text-text-muted">Direct database console</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>

              <a
                href="https://supabase.com/dashboard/project/lhzghbqjxkaexbcgpvev/auth/users"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">manage_accounts</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">Auth & Providers</span>
                    <span className="text-xs text-text-muted">Google OAuth settings</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>

              <a
                href="https://github.com/ManuthMethnidu/termy-al-ict"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lightning-gold text-2xl">code</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">GitHub Repository</span>
                    <span className="text-xs text-text-muted">termy-al-ict (main)</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE & API SETUP */}
      {activeSubTab === 'database' && (
        <div className="flex flex-col gap-6">
          <section className="p-6 rounded-2xl bg-card-dark border-2 border-primary/40 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">database</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">Supabase Production Credentials</h2>
                  <p className="text-xs text-text-muted">
                    Set up your Project URL and Anon key to connect candidate devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-bold">Supabase URL</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-bold">Supabase Anon Public Key</label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="px-4 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestAndSaveDb}
                  disabled={connStatus.loading}
                  className="px-5 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    {connStatus.loading ? 'sync' : 'save'}
                  </span>
                  <span>{connStatus.loading ? 'Verifying...' : 'Save & Test Connection'}</span>
                </button>
              </div>

              {connStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    connStatus.success
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-crimson-heart/10 border-crimson-heart/30 text-crimson-heart'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {connStatus.success ? 'check_circle' : 'error'}
                  </span>
                  <span>{connStatus.message}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: CANDIDATES */}
      {activeSubTab === 'candidates' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-3 text-text-muted text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search candidates by name, email, school..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card-dark border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border flex items-center gap-1.5 self-start"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Refresh Candidates</span>
            </button>
          </div>

          <div className="rounded-2xl bg-card-dark border border-card-border overflow-hidden shadow-md">
            {loadingCandidates ? (
              <div className="p-8 text-center text-text-muted text-xs font-mono">
                Loading candidate profiles from Supabase...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">person_search</span>
                <p className="text-sm font-bold text-on-surface">No Candidates Found</p>
                <p className="text-xs mt-1">Candidates who sign in with Google will automatically appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-card-border bg-surface-container">
                      <th className="p-3 font-bold text-text-muted uppercase">Candidate</th>
                      <th className="p-3 font-bold text-text-muted uppercase">Email / Stream</th>
                      <th className="p-3 font-bold text-text-muted uppercase">XP</th>
                      <th className="p-3 font-bold text-text-muted uppercase">Streak</th>
                      <th className="p-3 font-bold text-text-muted uppercase">Bits</th>
                      <th className="p-3 font-bold text-text-muted uppercase">Pro Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c) => (
                      <tr key={c.id} className="border-b border-card-border/50 hover:bg-surface-container/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                {c.display_name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">{c.display_name}</span>
                              <span className="text-[10px] text-text-muted font-mono">{c.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-text-muted">
                          <div className="flex flex-col">
                            <span>{c.email || 'N/A'}</span>
                            <span className="text-[10px]">{c.school}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-primary">{c.xp?.toLocaleString()}</td>
                        <td className="p-3 font-mono text-lightning-gold">🔥 {c.streak_days || 0}</td>
                        <td className="p-3 font-mono text-secondary">💎 {c.gems || 0}</td>
                        <td className="p-3">
                          {c.is_pro ? (
                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold text-[10px]">
                              PRO ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-surface-container text-text-muted text-[10px]">
                              STANDARD
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
