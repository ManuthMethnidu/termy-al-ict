import React, { useState, useEffect } from 'react';
import { UserStats, FriendUser, FriendStreak, SocialActivity } from '../../types';
import {
  getAllFriendsList,
  searchUsers,
  toggleFollowUser,
  fetchFriendStreaks,
  startFriendStreak,
  fetchSocialFeed,
  reactToActivity,
  generateInviteLink,
} from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';
import { UserProfileModal } from '../social/UserProfileModal';

interface FriendsViewProps {
  userStats: UserStats;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onStartDrill?: () => void;
}

type FriendsTab = 'streaks' | 'feed' | 'mutual' | 'following' | 'followers';

export const FriendsView: React.FC<FriendsViewProps> = ({
  userStats,
  onUpdateStats,
  onOpenAuth,
  onStartDrill,
}) => {
  const [activeTab, setActiveTab] = useState<FriendsTab>('streaks');
  const [following, setFollowing] = useState<FriendUser[]>([]);
  const [followers, setFollowers] = useState<FriendUser[]>([]);
  const [mutual, setMutual] = useState<FriendUser[]>([]);
  const [friendStreaks, setFriendStreaks] = useState<FriendStreak[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [inspectUser, setInspectUser] = useState<FriendUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all social data
  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, streaksData, feedData] = await Promise.all([
        getAllFriendsList(userStats.id),
        fetchFriendStreaks(userStats),
        fetchSocialFeed(),
      ]);

      setFollowing(friendsData.following);
      setFollowers(friendsData.followers);
      setMutual(friendsData.mutual);
      setFriendStreaks(streaksData);
      setSocialFeed(feedData);

      // Update following count in stats if changed
      if (onUpdateStats && friendsData.following.length !== userStats.followingCount) {
        onUpdateStats({
          followingCount: friendsData.following.length,
          followersCount: friendsData.followers.length,
        });
      }
    } catch (e) {
      console.warn('Error loading friends data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userStats.id]);

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchUsers(searchQuery, userStats.id);
      setSearchResults(results);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, userStats.id]);

  const handleToggleFollow = async (targetUser: FriendUser) => {
    sounds.playClick();
    if (!userStats.email && onOpenAuth) {
      showToast('Sign in to follow study partners and sync your friend network!');
      onOpenAuth('signin');
      return;
    }
    const res = await toggleFollowUser(userStats, targetUser);

    if (res.isFollowing) {
      sounds.playCorrect();
      showToast(`Followed ${targetUser.name}!`);
    } else {
      showToast(`Unfollowed ${targetUser.name}.`);
    }

    if (onUpdateStats) {
      onUpdateStats({ followingCount: res.followingCount });
    }

    // Refresh relations
    await loadData();
  };

  const handleStartStreak = async (friend: FriendUser) => {
    sounds.playFanfare();
    const res = await startFriendStreak(userStats, friend);
    showToast(res.message);
    if (res.success) {
      setFriendStreaks(res.streaks);
      await loadData();
    }
  };

  const handleReact = (activityId: string, reaction: 'highFive' | 'congrats' | 'celebrate' | 'letsGo') => {
    sounds.playClick();
    const { feed } = reactToActivity(activityId, reaction);
    setSocialFeed([...feed]);
  };

  const inviteUrl = generateInviteLink(userStats.username || 'candidate');

  const handleCopyInvite = () => {
    sounds.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast('Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `Join me on Termy for Sri Lankan A/L ICT! Active recall, MCQs, and weekly national leagues: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-24 md:pb-12 px-2 sm:px-4 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-surface-container-highest border-2 border-primary text-on-surface text-xs sm:text-sm font-black shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-primary text-base font-bold">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER HERO BANNER */}
      <div className="relative w-full rounded-3xl p-6 sm:p-7 border-2 border-card-border bg-gradient-to-br from-surface-container to-surface-container-high shadow-2xl mb-6 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary shadow-xl shrink-0">
              <span className="material-symbols-outlined text-4xl sm:text-5xl font-bold">group</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-wide">
                  Friends & Community
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-black uppercase tracking-wider">
                  Social Network
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-lg">
                Follow fellow A/L ICT students, ignite shared Friend Streaks, and team up for weekly Friends Quests.
              </p>
            </div>
          </div>

          {/* Quick Stats Counter Grid */}
          <div className="grid grid-cols-3 gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container/90 border border-card-border">
              <span className="text-lg font-black text-on-surface font-mono">{following.length}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Following</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container/90 border border-card-border">
              <span className="text-lg font-black text-on-surface font-mono">{followers.length}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-container/90 border border-card-border">
              <span className="text-lg font-black text-primary font-mono">{mutual.length}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Mutual</span>
            </div>
          </div>
        </div>

        {/* Invite Link & WhatsApp Sharing Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-muted w-full sm:w-auto">
            <span className="material-symbols-outlined text-primary text-base shrink-0">link</span>
            <span className="truncate max-w-xs font-mono text-[11px] text-on-surface bg-surface-container-lowest px-2 py-1 rounded-lg border border-card-border">
              {inviteUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyInvite}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-extrabold border border-card-border transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">{copiedLink ? 'check' : 'content_copy'}</span>
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-extrabold border border-[#25D366]/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DISCOVERY & SEARCH BAR */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <span className="absolute left-4 material-symbols-outlined text-text-muted text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by username, full name, or school (e.g. Royal, Ananda)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-surface-container border-2 border-card-border text-on-surface placeholder:text-text-muted/60 text-xs sm:text-sm focus:outline-none focus:border-primary transition-all shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-text-muted hover:text-on-surface p-1 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchQuery.trim() !== '' && (
          <div className="mt-2 p-3 rounded-2xl bg-surface-container-high border-2 border-card-border shadow-2xl flex flex-col gap-2 animate-in fade-in duration-150 max-h-80 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-text-muted">
              <span>Search Results ({searchResults.length})</span>
              {searching && <span>Searching...</span>}
            </div>

            {searchResults.length === 0 && !searching ? (
              <div className="text-center py-6 text-text-muted text-xs">
                No active students matched "{searchQuery}". Share your invite link to bring your classmates on board!
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-variant transition-colors border border-card-border"
                >
                  <div
                    onClick={() => {
                      sounds.playClick();
                      setInspectUser(user);
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-card-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-on-surface truncate">{user.name}</span>
                        <span className="text-[10px] text-text-muted font-mono">{user.username}</span>
                      </div>
                      <span className="text-[10px] text-text-muted truncate block">{user.school}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                      user.isFollowing
                        ? 'bg-surface-container-highest text-text-muted hover:text-crimson-heart border border-card-border'
                        : 'bg-primary text-on-primary-fixed hover:brightness-110 shadow-sm'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container border border-card-border mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('streaks');
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'streaks'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">local_fire_department</span>
          <span>Friend Streaks ({friendStreaks.length}/5)</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('feed');
          }}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'feed'
              ? 'bg-primary text-on-primary-fixed shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">notifications</span>
          <span>Friend Feed</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('mutual');
          }}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mutual'
              ? 'bg-secondary text-on-secondary shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">handshake</span>
          <span>Mutual ({mutual.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('following');
          }}
          className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'following'
              ? 'bg-surface-container-high text-on-surface border border-card-border shadow-sm'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">person</span>
          <span>Following ({following.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('followers');
          }}
          className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'followers'
              ? 'bg-surface-container-high text-on-surface border border-card-border shadow-sm'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">diversity_1</span>
          <span>Followers ({followers.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <span className="text-xs font-mono">Syncing social network from Supabase...</span>
        </div>
      ) : activeTab === 'streaks' ? (
        /* TAB 1: FRIEND STREAKS (MAX 5 MUTUAL PARTNERS) */
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-text-muted">
            <span className="material-symbols-outlined text-amber-500 text-2xl shrink-0 mt-0.5">
              local_fire_department
            </span>
            <div>
              <h4 className="font-extrabold text-on-surface text-sm mb-0.5">
                How Friend Streaks Work (Up to 5 Partners)
              </h4>
              <p className="leading-relaxed">
                Start a shared streak with mutual friends. Both of you must complete at least 1 lesson each day to keep the joint flame alive!
              </p>
            </div>
          </div>

          {friendStreaks.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-surface-container border border-card-border flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-3xl">
                🔥
              </div>
              <h3 className="text-base font-extrabold text-on-surface">No Active Friend Streaks Yet</h3>
              <p className="text-xs text-text-muted max-w-sm">
                Follow other active candidates back to create a mutual friendship, then initiate a Friend Streak to study together daily!
              </p>
              {mutual.length > 0 ? (
                <button
                  onClick={() => setActiveTab('mutual')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
                >
                  View {mutual.length} Mutual Friends
                </button>
              ) : (
                <button
                  onClick={handleCopyInvite}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
                >
                  Share Invite Link
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {friendStreaks.map((streak) => (
                <div
                  key={streak.id}
                  className="p-4 rounded-2xl bg-surface-container border-2 border-amber-500/30 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {streak.friendAvatarUrl ? (
                        <img
                          src={streak.friendAvatarUrl}
                          alt={streak.friendName}
                          className="w-12 h-12 rounded-xl object-cover border border-card-border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 font-black flex items-center justify-center shrink-0 text-base">
                          {streak.friendName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-on-surface">{streak.friendName}</h4>
                        <span className="text-[11px] text-text-muted font-mono">{streak.friendUsername}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-sm">
                      <span>🔥</span>
                      <span>{streak.streakDays}d</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div
                      className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                        streak.userCompletedToday
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-surface-container-high border-card-border text-text-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        {streak.userCompletedToday ? 'check_circle' : 'pending'}
                      </span>
                      <span>{streak.userCompletedToday ? 'You: Done ✓' : 'You: Need 1 lesson'}</span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                        streak.friendCompletedToday
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-surface-container-high border-card-border text-text-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        {streak.friendCompletedToday ? 'check_circle' : 'hourglass_top'}
                      </span>
                      <span>{streak.friendCompletedToday ? 'Partner: Done ✓' : 'Partner: Pending'}</span>
                    </div>
                  </div>

                  {!streak.userCompletedToday && onStartDrill && (
                    <button
                      onClick={onStartDrill}
                      className="w-full py-2 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow"
                    >
                      Complete Lesson to Protect Streak 🔥
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'feed' ? (
        /* TAB 2: LIVE SOCIAL ACTIVITY FEED */
        <div className="flex flex-col gap-3 animate-in fade-in duration-150">
          {socialFeed.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-surface-container border border-card-border text-text-muted text-xs">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">rss_feed</span>
              <h3 className="text-base font-extrabold text-on-surface">Activity Feed Empty</h3>
              <p className="mt-1">
                When candidates in your network master units, maintain streaks, or climb leagues, their celebrations will appear here!
              </p>
            </div>
          ) : (
            socialFeed.map((activity) => (
              <div
                key={activity.id}
                className="p-4 rounded-2xl bg-surface-container border border-card-border shadow-md flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {activity.userAvatarUrl ? (
                      <img
                        src={activity.userAvatarUrl}
                        alt={activity.userName}
                        className="w-10 h-10 rounded-xl object-cover border border-card-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        {activity.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-on-surface">{activity.userName}</span>
                        <span className="text-[10px] text-text-muted font-mono">{activity.userUsername}</span>
                      </div>
                      <span className="text-[10px] text-text-muted">{activity.timeAgo}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high border border-card-border text-primary">
                    {activity.activityType.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-on-surface">{activity.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{activity.description}</p>
                </div>

                {/* Celebration Reactions Strip */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleReact(activity.id, 'highFive')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      activity.userReaction === 'highFive'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-surface-container-high/60 border-card-border/60 text-text-muted hover:text-on-surface'
                    }`}
                  >
                    <span>👋</span>
                    <span className="font-mono text-[11px]">{activity.reactions.highFive || 0}</span>
                  </button>

                  <button
                    onClick={() => handleReact(activity.id, 'congrats')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      activity.userReaction === 'congrats'
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-surface-container-high/60 border-card-border/60 text-text-muted hover:text-on-surface'
                    }`}
                  >
                    <span>🎉</span>
                    <span className="font-mono text-[11px]">{activity.reactions.congrats || 0}</span>
                  </button>

                  <button
                    onClick={() => handleReact(activity.id, 'celebrate')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      activity.userReaction === 'celebrate'
                        ? 'bg-secondary/20 border-secondary/50 text-secondary'
                        : 'bg-surface-container-high/60 border-card-border/60 text-text-muted hover:text-on-surface'
                    }`}
                  >
                    <span>🚀</span>
                    <span className="font-mono text-[11px]">{activity.reactions.celebrate || 0}</span>
                  </button>

                  <button
                    onClick={() => handleReact(activity.id, 'letsGo')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                      activity.userReaction === 'letsGo'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-surface-container-high/60 border-card-border/60 text-text-muted hover:text-on-surface'
                    }`}
                  >
                    <span>🔥</span>
                    <span className="font-mono text-[11px]">{activity.reactions.letsGo || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'mutual' ? (
        /* TAB 3: MUTUAL FRIENDS (BOTH FOLLOW EACH OTHER) */
        <div className="flex flex-col gap-3 animate-in fade-in duration-150">
          <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center gap-2.5 text-xs text-text-muted">
            <span className="material-symbols-outlined text-secondary text-xl">handshake</span>
            <span>
              Mutual friends follow you and you follow them. They are eligible for shared Friend Streaks and weekly Friends Quests!
            </span>
          </div>

          {mutual.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-surface-container border border-card-border text-text-muted text-xs">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">person_add</span>
              <h3 className="text-base font-extrabold text-on-surface">No Mutual Friends Yet</h3>
              <p className="mt-1">
                Follow other candidates and have them follow your profile to unlock mutual collaborations!
              </p>
            </div>
          ) : (
            mutual.map((user) => {
              const hasStreak = friendStreaks.some((s) => s.friendId === user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-surface-container border border-card-border hover:bg-surface-container-high transition-colors"
                >
                  <div
                    onClick={() => {
                      sounds.playClick();
                      setInspectUser(user);
                    }}
                    className="flex items-center gap-3.5 cursor-pointer min-w-0"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover border border-card-border shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-on-surface truncate">{user.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-secondary/20 text-secondary border border-secondary/40">
                          Mutual
                        </span>
                      </div>
                      <span className="text-xs text-text-muted truncate block">{user.school}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!hasStreak && friendStreaks.length < 5 && (
                      <button
                        onClick={() => handleStartStreak(user)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1"
                      >
                        <span>🔥</span>
                        <span className="hidden sm:inline">Start Streak</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFollow(user)}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-text-muted hover:text-crimson-heart text-xs font-bold border border-card-border transition-all"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'following' ? (
        /* TAB 4: FOLLOWING */
        <div className="flex flex-col gap-3 animate-in fade-in duration-150">
          {following.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-surface-container border border-card-border text-text-muted text-xs">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">person_search</span>
              <h3 className="text-base font-extrabold text-on-surface">You are not following anyone yet</h3>
              <p className="mt-1">
                Use the search bar above or tap any candidate on the national leaderboard to follow them.
              </p>
            </div>
          ) : (
            following.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-surface-container border border-card-border hover:bg-surface-container-high transition-colors"
              >
                <div
                  onClick={() => {
                    sounds.playClick();
                    setInspectUser(user);
                  }}
                  className="flex items-center gap-3.5 cursor-pointer min-w-0"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover border border-card-border shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-on-surface truncate">{user.name}</span>
                      <span className="text-xs text-text-muted font-mono">{user.username}</span>
                    </div>
                    <span className="text-xs text-text-muted truncate block">{user.school}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(user)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-text-muted hover:text-crimson-heart text-xs font-bold border border-card-border transition-all shrink-0"
                >
                  Following
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* TAB 5: FOLLOWERS */
        <div className="flex flex-col gap-3 animate-in fade-in duration-150">
          {followers.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-3xl bg-surface-container border border-card-border text-text-muted text-xs">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">group_add</span>
              <h3 className="text-base font-extrabold text-on-surface">No followers yet</h3>
              <p className="mt-1">
                Share your invite link with your A/L classmates to build your study follower circle!
              </p>
              <button
                onClick={handleCopyInvite}
                className="mt-3 px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
              >
                Copy Invite Link
              </button>
            </div>
          ) : (
            followers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-surface-container border border-card-border hover:bg-surface-container-high transition-colors"
              >
                <div
                  onClick={() => {
                    sounds.playClick();
                    setInspectUser(user);
                  }}
                  className="flex items-center gap-3.5 cursor-pointer min-w-0"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover border border-card-border shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-on-surface truncate">{user.name}</span>
                      <span className="text-xs text-text-muted font-mono">{user.username}</span>
                    </div>
                    <span className="text-xs text-text-muted truncate block">{user.school}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(user)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                    user.isFollowing
                      ? 'bg-surface-container-highest text-text-muted hover:text-crimson-heart border border-card-border'
                      : 'bg-primary text-on-primary-fixed hover:brightness-110 shadow-sm'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow Back'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. USER PROFILE INSPECTOR MODAL */}
      {inspectUser && (
        <UserProfileModal
          currentUser={userStats}
          targetUser={inspectUser}
          onClose={() => {
            setInspectUser(null);
            loadData();
          }}
          onUpdateStats={onUpdateStats}
          onStreakStarted={() => loadData()}
        />
      )}
    </div>
  );
};
