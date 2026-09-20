import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';
import { sounds } from '../../lib/sound';
import { UserStats } from '../../types';

interface AdminPanelProps {
  onExit: () => void;
  currentUser?: UserStats;
  onUpdateStats?: (newStats: Partial<UserStats>) => void;
}

const ADMIN_USER = 'MANA';
const ADMIN_PASS = 'Mana0@47855';
const SESSION_KEY = 'termy_admin_auth_v1';
const SERVICE_KEY_STORAGE = 'termy_admin_service_key';

export const AdminPanelView: React.FC<AdminPanelProps> = ({
  onExit,
  currentUser,
  onUpdateStats,
}) => {
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
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'subscriptions' | 'candidates' | 'database'
  >('overview');

  // Database states
  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(dbConfig.url);
  const [inputKey, setInputKey] = useState(dbConfig.key);
  const [serviceRoleKey, setServiceRoleKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem(SERVICE_KEY_STORAGE) ||
        localStorage.getItem(SERVICE_KEY_STORAGE) ||
        ''
      );
    }
    return '';
  });
  const [saveServiceKeySuccess, setSaveServiceKeySuccess] = useState(false);

  const [connStatus, setConnStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({
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

  // Subscription handling state
  const [subUsernameInput, setSubUsernameInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [subActionLoading, setSubActionLoading] = useState(false);
  const [subActionMessage, setSubActionMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedSqlUser, setCopiedSqlUser] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'all' | 'pro' | 'standard'>('all');

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

  // Save Service Role Secret Key
  const handleSaveServiceRoleKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = serviceRoleKey.trim();
    if (typeof window !== 'undefined') {
      if (cleanKey) {
        sessionStorage.setItem(SERVICE_KEY_STORAGE, cleanKey);
        localStorage.setItem(SERVICE_KEY_STORAGE, cleanKey);
      } else {
        sessionStorage.removeItem(SERVICE_KEY_STORAGE);
        localStorage.removeItem(SERVICE_KEY_STORAGE);
      }
      setSaveServiceKeySuccess(true);
      sounds.playCorrect();
      setTimeout(() => setSaveServiceKeySuccess(false), 3000);
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
        // If candidate currently selected, refresh their row
        if (selectedCandidate) {
          const fresh = profiles.find((p) => p.id === selectedCandidate.id);
          if (fresh) setSelectedCandidate(fresh);
        }
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

  // Lookup candidate by username
  const handleLookupCandidate = (usernameToFind?: string) => {
    const raw = usernameToFind !== undefined ? usernameToFind : subUsernameInput;
    const clean = raw.trim().toLowerCase().replace(/^@/, '');

    if (!clean) {
      setSelectedCandidate(null);
      setSubActionMessage({
        type: 'error',
        text: 'Please enter a valid candidate username to look up.',
      });
      return;
    }

    const match = candidatesList.find((c) => {
      const u = (c.username || '').toLowerCase().replace(/^@/, '');
      const email = (c.email || '').toLowerCase();
      return u === clean || email === clean;
    });

    if (match) {
      setSelectedCandidate(match);
      setSubActionMessage(null);
      sounds.playClick();
    } else {
      setSelectedCandidate(null);
      setSubActionMessage({
        type: 'error',
        text: `No candidate found with username "${clean}". Check the candidates directory list below.`,
      });
      sounds.playIncorrect();
    }
  };

  // Toggle/Update candidate Pro subscription
  const handleSetCandidatePro = async (candidate: any, enablePro: boolean) => {
    const cleanUsername = (candidate.username || '').replace(/^@/, '');
    const targetHearts = enablePro ? 999 : 5;

    setSubActionLoading(true);
    setSubActionMessage(null);

    let dbUpdated = false;
    let errorDetail = '';

    try {
      const activeServiceKey =
        serviceRoleKey.trim() ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem(SERVICE_KEY_STORAGE) || localStorage.getItem(SERVICE_KEY_STORAGE)
          : '');

      const config = getSupabaseConfig();

      // Method 1: Service Role Key client (Bypasses RLS cleanly)
      if (activeServiceKey && config.url) {
        try {
          const adminClient = createClient(config.url, activeServiceKey, {
            auth: { persistSession: false },
          });

          const { data, error } = await adminClient
            .from('profiles')
            .update({
              is_pro: enablePro,
              hearts: targetHearts,
              updated_at: new Date().toISOString(),
            })
            .eq('id', candidate.id)
            .select();

          if (!error && data && data.length > 0) {
            dbUpdated = true;
          } else if (error) {
            errorDetail = error.message;
          }
        } catch (err: any) {
          errorDetail = err?.message || 'Admin client failure';
        }
      }

      // Method 2: Standard Client via RPC or direct update
      if (!dbUpdated) {
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: rpcData, error: rpcError } = await client.rpc('admin_set_user_pro', {
              target_username: cleanUsername,
              enable_pro: enablePro,
            });
            if (!rpcError && rpcData?.success) {
              dbUpdated = true;
            }
          } catch {}

          if (!dbUpdated) {
            try {
              const { data, error } = await client
                .from('profiles')
                .update({
                  is_pro: enablePro,
                  hearts: targetHearts,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', candidate.id)
                .select();

              if (!error && data && data.length > 0) {
                dbUpdated = true;
              }
            } catch {}
          }
        }
      }

      // Optimistically update local candidate list state
      const updatedList = candidatesList.map((c) =>
        c.id === candidate.id ? { ...c, is_pro: enablePro, hearts: targetHearts } : c
      );
      setCandidatesList(updatedList);

      const freshCandidate = {
        ...candidate,
        is_pro: enablePro,
        hearts: targetHearts,
      };
      setSelectedCandidate(freshCandidate);

      // If this candidate matches current logged-in user, sync stats live
      if (
        currentUser &&
        (currentUser.id === candidate.id ||
          (currentUser.username || '').replace(/^@/, '') === cleanUsername)
      ) {
        if (onUpdateStats) {
          onUpdateStats({ isPro: enablePro, hearts: targetHearts });
        }
      }

      if (dbUpdated) {
        sounds.playFanfare();
        setSubActionMessage({
          type: 'success',
          text: `Successfully ${
            enablePro ? 'ACTIVATED Super Termy Pro for' : 'REVOKED Pro from'
          } @${cleanUsername}! PostgreSQL database synchronized.`,
        });
      } else {
        sounds.playCorrect();
        setSubActionMessage({
          type: 'info',
          text: `Updated @${cleanUsername} to ${
            enablePro ? 'PRO' : 'STANDARD'
          } locally. To sync directly to PostgreSQL, enter your Supabase Service Role Key below, or click 'Copy SQL' and run in Supabase SQL Editor.`,
        });
      }
    } catch (err: any) {
      sounds.playIncorrect();
      setSubActionMessage({
        type: 'error',
        text: `Error updating candidate: ${err?.message || errorDetail || 'Unknown error'}`,
      });
    } finally {
      setSubActionLoading(false);
    }
  };

  // Copy SQL statement helper
  const handleCopySql = (username: string, enablePro: boolean) => {
    const clean = username.replace(/^@/, '');
    const targetHearts = enablePro ? 999 : 5;
    const sql = `UPDATE public.profiles SET is_pro = ${enablePro}, hearts = ${targetHearts}, updated_at = timezone('utc'::text, now()) WHERE username = '${clean}' OR username = '@${clean}';`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      sounds.playClick();
      setCopiedSqlUser(username);
      setTimeout(() => setCopiedSqlUser(null), 2500);
    }
  };

  // Calculated counts
  const totalPro = candidatesList.filter((c) => c.is_pro).length;
  const totalStandard = candidatesList.length - totalPro;
  const proConversionRate =
    candidatesList.length > 0 ? Math.round((totalPro / candidatesList.length) * 100) : 0;

  // Filter candidates for candidates tab
  const filteredCandidates = candidatesList.filter((c) => {
    const q = candidateSearch.toLowerCase();
    return (
      c.display_name?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.school?.toLowerCase().includes(q)
    );
  });

  // Filter candidates for subscriptions tab
  const filteredSubscriptionCandidates = candidatesList.filter((c) => {
    if (subFilter === 'pro' && !c.is_pro) return false;
    if (subFilter === 'standard' && c.is_pro) return false;

    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase();
      return (
        c.display_name?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // If not authenticated, render Admin Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-md mx-auto p-4 select-none">
        <div className="w-full bg-card-dark border-2 border-primary/50 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(116,233,48,0.3)]">
              <span className="material-symbols-outlined text-3xl font-bold">
                admin_panel_settings
              </span>
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
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
                Termy Master Admin
              </h1>
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
          onClick={() => {
            setActiveSubTab('subscriptions');
            setCandidateSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'subscriptions'
              ? 'bg-primary text-on-primary-fixed shadow-sm'
              : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">workspace_premium</span>
          <span>Subscriptions ({totalPro} Pro)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('candidates');
            setCandidateSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'candidates'
              ? 'bg-primary text-on-primary-fixed shadow-sm'
              : 'text-text-muted hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Candidates ({telemetry.totalCandidates})</span>
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
              <span className="text-[10px] text-text-muted">Registered Profiles</span>
            </div>

            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">Pro Subscribers</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-lightning-gold">
                {totalPro}
              </span>
              <span className="text-[10px] text-text-muted">{proConversionRate}% Conversion</span>
            </div>

            <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-xs text-text-muted font-bold uppercase">MCQ Attempts</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-pink-400">
                {telemetry.totalAttempts}
              </span>
              <span className="text-[10px] text-text-muted">Telemetry rows</span>
            </div>
          </div>

          {/* Quick Actions & Telegram Link */}
          <div className="p-6 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface uppercase tracking-wider text-primary">
                Quick Subscription & Console Links
              </h3>
              <button
                onClick={() => setActiveSubTab('subscriptions')}
                className="px-3 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold transition-colors"
              >
                Manage Subscriptions →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://t.me/ManuthMethnidu"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">Telegram Channel</span>
                    <span className="text-xs text-text-muted">@ManuthMethnidu</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>

              <a
                href="https://supabase.com/dashboard/project/lhzghbqjxkaexbcgpvev"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">database</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">Supabase Dashboard</span>
                    <span className="text-xs text-text-muted">lhzghbqjxkaexbcgpvev</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>

              <a
                href="https://supabase.com/dashboard/project/lhzghbqjxkaexbcgpvev/editor"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">table_chart</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-on-surface">Table Editor</span>
                    <span className="text-xs text-text-muted">public.profiles</span>
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

      {/* TAB 2: SUBSCRIPTIONS HANDLING */}
      {activeSubTab === 'subscriptions' && (
        <div className="flex flex-col gap-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Total Candidates
              </span>
              <span className="text-2xl font-extrabold font-mono text-on-surface">
                {candidatesList.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card-dark border-2 border-primary/50 flex flex-col gap-1 shadow-md">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Super Termy Pro
              </span>
              <span className="text-2xl font-extrabold font-mono text-primary flex items-center gap-1.5">
                <span>{totalPro}</span>
                <span className="text-xs font-sans text-text-muted">({proConversionRate}%)</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Standard / Free
              </span>
              <span className="text-2xl font-extrabold font-mono text-text-muted">
                {totalStandard}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-1 shadow-md">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                Payment Channel
              </span>
              <a
                href="https://t.me/ManuthMethnidu"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 mt-1 truncate"
              >
                <span>@ManuthMethnidu</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Section 1: Manage Pro by Username */}
          <section className="p-6 rounded-2xl bg-card-dark border-2 border-primary/40 flex flex-col gap-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">
                  Manage Subscription by Candidate Username
                </h2>
                <p className="text-xs text-text-muted">
                  Look up candidates who sent payment slips on Telegram to grant or revoke their Super Termy Pro pass.
                </p>
              </div>
            </div>

            {/* Username Lookup Input Form */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-text-muted text-lg">
                  alternate_email
                </span>
                <input
                  type="text"
                  placeholder="Enter candidate username (e.g. methnidumanuth_8db7 or @username)"
                  value={subUsernameInput}
                  onChange={(e) => setSubUsernameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLookupCandidate();
                    }
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLookupCandidate()}
                className="px-5 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary flex items-center justify-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-base">search</span>
                <span>Lookup Candidate</span>
              </button>
            </div>

            {/* Quick Candidate Chips (recently registered / quick selection) */}
            {candidatesList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-text-muted font-bold">Quick Select:</span>
                {candidatesList.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSubUsernameInput(c.username);
                      handleLookupCandidate(c.username);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                      selectedCandidate?.id === c.id
                        ? 'bg-primary/20 text-primary border-primary'
                        : 'bg-surface-container text-text-muted hover:text-on-surface border-card-border'
                    }`}
                  >
                    {c.username} {c.is_pro ? '★' : ''}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback Message */}
            {subActionMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 border animate-in fade-in duration-150 ${
                  subActionMessage.type === 'success'
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : subActionMessage.type === 'error'
                    ? 'bg-crimson-heart/10 border-crimson-heart/40 text-crimson-heart'
                    : 'bg-lightning-gold/10 border-lightning-gold/40 text-lightning-gold'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                  {subActionMessage.type === 'success'
                    ? 'check_circle'
                    : subActionMessage.type === 'error'
                    ? 'error'
                    : 'info'}
                </span>
                <div className="flex-1 leading-relaxed">{subActionMessage.text}</div>
              </div>
            )}

            {/* Selected Candidate Card with Action Buttons */}
            {selectedCandidate && (
              <div className="p-5 rounded-2xl bg-surface-container border-2 border-card-border flex flex-col gap-4 shadow-lg animate-in zoom-in-95 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {selectedCandidate.avatar_url ? (
                      <img
                        src={selectedCandidate.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/60"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        {selectedCandidate.display_name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-on-surface">
                          {selectedCandidate.display_name}
                        </span>
                        {selectedCandidate.is_pro ? (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            PRO ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-muted border border-card-border text-[10px] font-bold uppercase tracking-wider">
                            STANDARD (FREE)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-secondary font-mono">
                        {selectedCandidate.username}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        {selectedCandidate.email || 'No email'} • {selectedCandidate.school}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Metrics Snapshot */}
                  <div className="flex items-center gap-3 text-xs font-mono bg-card-dark px-3.5 py-2 rounded-xl border border-card-border self-start sm:self-auto">
                    <span title="Experience Points" className="text-primary font-bold">
                      ⚡ {selectedCandidate.xp || 0} XP
                    </span>
                    <span className="text-text-muted">•</span>
                    <span title="Study Streak" className="text-lightning-gold font-bold">
                      🔥 {selectedCandidate.streak_days || 0}d
                    </span>
                    <span className="text-text-muted">•</span>
                    <span title="Exam Lives" className="text-crimson-heart font-bold">
                      ❤️ {selectedCandidate.is_pro ? '∞' : selectedCandidate.hearts || 5}
                    </span>
                  </div>
                </div>

                {/* Actions Button Strip */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-card-border/60">
                  {selectedCandidate.is_pro ? (
                    <button
                      type="button"
                      onClick={() => handleSetCandidatePro(selectedCandidate, false)}
                      disabled={subActionLoading}
                      className="px-5 py-2.5 bg-crimson-heart/20 hover:bg-crimson-heart/30 text-crimson-heart rounded-xl text-xs uppercase font-extrabold tracking-wider border border-crimson-heart/40 flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      <span>
                        {subActionLoading ? 'Updating...' : 'Revoke Super Termy Pro Access'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCandidatePro(selectedCandidate, true)}
                      disabled={subActionLoading}
                      className="px-6 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary flex items-center gap-2 shadow-lg"
                    >
                      <span className="material-symbols-outlined text-base">workspace_premium</span>
                      <span>{subActionLoading ? 'Activating...' : 'Grant Super Termy Pro'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleCopySql(selectedCandidate.username, !selectedCandidate.is_pro)
                    }
                    className="px-4 py-2.5 bg-card-dark hover:bg-surface-variant text-text-muted hover:text-on-surface rounded-xl text-xs font-bold border border-card-border flex items-center gap-1.5 transition-colors"
                    title="Copy direct SQL command for Supabase SQL Editor"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedSqlUser === selectedCandidate.username ? 'check' : 'content_copy'}
                    </span>
                    <span>
                      {copiedSqlUser === selectedCandidate.username
                        ? 'SQL Copied!'
                        : 'Copy SQL Query'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Direct Database Access Key (Service Role Key) */}
          <section className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">key</span>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-on-surface">
                    Supabase Service Role Secret Key (Optional)
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Needed to bypass Row-Level Security when modifying candidate subscriptions directly from this browser terminal.
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  serviceRoleKey.trim()
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-surface-container text-text-muted border border-card-border'
                }`}
              >
                {serviceRoleKey.trim() ? 'Key Configured' : 'Anon Only'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="password"
                placeholder="Paste Supabase service_role secret key..."
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleSaveServiceRoleKey()}
                className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base">
                  {saveServiceKeySuccess ? 'check' : 'save'}
                </span>
                <span>{saveServiceKeySuccess ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
          </section>

          {/* Section 3: All Candidate Subscriptions Directory */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card-dark border border-card-border self-start">
                <button
                  type="button"
                  onClick={() => setSubFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    subFilter === 'all'
                      ? 'bg-primary text-on-primary-fixed'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                >
                  All ({candidatesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('pro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    subFilter === 'pro'
                      ? 'bg-primary text-on-primary-fixed'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                >
                  ★ Pro Active ({totalPro})
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    subFilter === 'standard'
                      ? 'bg-primary text-on-primary-fixed'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                >
                  Standard ({totalStandard})
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-base">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter table..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-card-dark border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="rounded-2xl bg-card-dark border border-card-border overflow-hidden shadow-md">
              {loadingCandidates ? (
                <div className="p-8 text-center text-text-muted text-xs font-mono">
                  Loading candidate directory from Supabase...
                </div>
              ) : filteredSubscriptionCandidates.length === 0 ? (
                <div className="p-8 text-center text-text-muted">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">
                    search_off
                  </span>
                  <p className="text-sm font-bold text-on-surface">No Candidates Found</p>
                  <p className="text-xs mt-1">No candidate matches the selected subscription filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-card-border bg-surface-container">
                        <th className="p-3 font-bold text-text-muted uppercase">Candidate</th>
                        <th className="p-3 font-bold text-text-muted uppercase">Email / Stream</th>
                        <th className="p-3 font-bold text-text-muted uppercase">Status</th>
                        <th className="p-3 font-bold text-text-muted uppercase">Lives</th>
                        <th className="p-3 font-bold text-text-muted uppercase text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptionCandidates.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-card-border/50 hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {c.avatar_url ? (
                                <img
                                  src={c.avatar_url}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-primary/40"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                  {c.display_name?.charAt(0) || 'C'}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-on-surface">{c.display_name}</span>
                                <span className="text-[11px] text-secondary font-mono">
                                  {c.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-text-muted">
                            <div className="flex flex-col">
                              <span>{c.email || 'N/A'}</span>
                              <span className="text-[10px] truncate max-w-[200px]">
                                {c.school || c.batch}
                              </span>
                            </div>
                          </td>

                          <td className="p-3">
                            {c.is_pro ? (
                              <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary font-bold text-[10px] border border-primary/40 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                PRO ACTIVE
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-surface-container text-text-muted font-bold text-[10px] border border-card-border w-fit inline-block">
                                STANDARD
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-mono font-bold text-crimson-heart">
                            {c.is_pro ? '∞' : `${c.hearts || 5}/5`}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {c.is_pro ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetCandidatePro(c, false)}
                                  disabled={subActionLoading}
                                  className="px-3 py-1.5 bg-crimson-heart/15 hover:bg-crimson-heart/25 text-crimson-heart rounded-lg text-[11px] font-bold border border-crimson-heart/30 transition-colors"
                                >
                                  Revoke Pro
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetCandidatePro(c, true)}
                                  disabled={subActionLoading}
                                  className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-[11px] font-extrabold border border-primary/40 transition-colors"
                                >
                                  Grant Pro
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleCopySql(c.username, !c.is_pro)}
                                title="Copy SQL"
                                className="p-1.5 bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface rounded-lg border border-card-border transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {copiedSqlUser === c.username ? 'check' : 'content_copy'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: CANDIDATES DIRECTORY */}
      {activeSubTab === 'candidates' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-3 text-text-muted text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search candidates by name, username, email, school..."
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
                <span className="material-symbols-outlined text-4xl text-primary mb-2">
                  person_search
                </span>
                <p className="text-sm font-bold text-on-surface">No Candidates Found</p>
                <p className="text-xs mt-1">Candidates who sign up will automatically appear here.</p>
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
                      <th className="p-3 font-bold text-text-muted uppercase text-right">Toggle Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-card-border/50 hover:bg-surface-container/50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {c.avatar_url ? (
                              <img
                                src={c.avatar_url}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                                {c.display_name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">{c.display_name}</span>
                              <span className="text-[10px] text-text-muted font-mono">
                                {c.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-text-muted">
                          <div className="flex flex-col">
                            <span>{c.email || 'N/A'}</span>
                            <span className="text-[10px]">{c.school}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-primary">
                          {c.xp?.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-lightning-gold">
                          🔥 {c.streak_days || 0}
                        </td>
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
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSetCandidatePro(c, !c.is_pro)}
                            disabled={subActionLoading}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                              c.is_pro
                                ? 'bg-crimson-heart/20 hover:bg-crimson-heart/30 text-crimson-heart border border-crimson-heart/30'
                                : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30'
                            }`}
                          >
                            {c.is_pro ? 'Revoke' : 'Activate'}
                          </button>
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

      {/* TAB 4: DATABASE & API SETUP */}
      {activeSubTab === 'database' && (
        <div className="flex flex-col gap-6">
          <section className="p-6 rounded-2xl bg-card-dark border-2 border-primary/40 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">database</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">
                    Supabase Production Credentials
                  </h2>
                  <p className="text-xs text-text-muted">
                    Configure your Project URL and Anon Public Key for client devices.
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
                <label className="text-xs text-text-muted font-bold">
                  Supabase Anon Public Key
                </label>
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
    </div>
  );
};
