import React, { useState, useEffect } from 'react';
import { FriendUser, UserStats } from '../../types';
import { getAllFriendsList, toggleFollowUser, blockUser } from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';

interface FollowingListModalProps {
  currentUser: UserStats;
  initialTab?: 'following' | 'followers' | 'mutual';
  onClose: () => void;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onOpenUserProfile?: (user: FriendUser) => void;
}

export const FollowingListModal: React.FC<FollowingListModalProps> = ({
  currentUser,
  initialTab = 'following',
  onClose,
  onUpdateStats,
  onOpenUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'mutual'>(initialTab);
  const [data, setData] = useState<{
    following: FriendUser[];
    followers: FriendUser[];
    mutual: FriendUser[];
  }>({ following: [], followers: [], mutual: [] });
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getAllFriendsList(currentUser.id).then((res) => {
      setData({
        following: res.following,
        followers: res.followers,
        mutual: res.mutual,
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleToggleFollow = async (target: FriendUser) => {
    sounds.playClick();
    const res = await toggleFollowUser(currentUser, target);
    if (res.isFollowing) sounds.playCorrect();
    loadData();
    if (onUpdateStats) {
      onUpdateStats({ followingCount: res.followingCount });
    }
  };

  const handleBlock = async (target: FriendUser) => {
    if (window.confirm(`Block ${target.name}? They will no longer be able to track your activity.`)) {
      sounds.playIncorrect();
      await blockUser(currentUser.id || 'guest', target.id);
      loadData();
    }
  };

  const currentList =
    activeTab === 'following'
      ? data.following
      : activeTab === 'followers'
      ? data.followers
      : data.mutual;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#131f24] border-2 border-card-border p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[85vh] select-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">group</span>
            <h2 className="text-xl font-black text-on-surface">Your Network</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 p-1 bg-surface-container rounded-2xl border border-card-border">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('following');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'following'
                ? 'bg-primary text-on-primary-fixed shadow'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            Following ({data.following.length})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('followers');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'followers'
                ? 'bg-primary text-on-primary-fixed shadow'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            Followers ({data.followers.length})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('mutual');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
              activeTab === 'mutual'
                ? 'bg-primary text-on-primary-fixed shadow'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            Mutual ({data.mutual.length})
          </button>
        </div>

        {/* Content List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-text-muted flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-base text-primary">sync</span>
              <span>Loading connections...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl opacity-50">person_search</span>
              <span>No candidates in this list yet.</span>
            </div>
          ) : (
            currentList.map((user) => (
              <div
                key={user.id}
                className="p-3.5 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3 hover:bg-surface-variant/40 transition-colors"
              >
                <div
                  onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-card-border shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-on-surface truncate">
                        {user.name}
                      </span>
                      {user.isMutual && (
                        <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-black uppercase">
                          Mutual
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted truncate">
                      {user.username} • {user.school}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleFollow(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      user.isFollowing
                        ? 'bg-surface-container-high border border-card-border text-text-muted hover:text-crimson-heart hover:border-crimson-heart/40'
                        : 'bg-primary text-on-primary-fixed shadow hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>

                  <button
                    onClick={() => handleBlock(user)}
                    title="Block User"
                    className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-crimson-heart/20 hover:text-crimson-heart text-text-muted flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">block</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
