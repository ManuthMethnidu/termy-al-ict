import React, { useState, useEffect } from 'react';
import { FriendUser, UserStats } from '../../types';
import {
  searchUsers,
  getAllFriendsList,
  toggleFollowUser,
  generateInviteLink,
} from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';

interface AddFriendsModalProps {
  currentUser: UserStats;
  onClose: () => void;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onOpenUserProfile?: (user: FriendUser) => void;
}

export const AddFriendsModal: React.FC<AddFriendsModalProps> = ({
  currentUser,
  onClose,
  onUpdateStats,
  onOpenUserProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<FriendUser[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteLink = generateInviteLink(currentUser.username);

  useEffect(() => {
    getAllFriendsList(currentUser.id).then(({ suggestions }) => {
      setSuggestedFriends(suggestions.slice(0, 5));
    });
  }, [currentUser.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      searchUsers(searchQuery, currentUser.id).then((res) => {
        setSearchResults(res);
        setLoading(false);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, currentUser.id]);

  const handleToggleFollow = async (target: FriendUser) => {
    sounds.playClick();
    const res = await toggleFollowUser(currentUser, target);
    if (res.isFollowing) {
      sounds.playCorrect();
    }
    // Update local lists
    setSearchResults((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, isFollowing: res.isFollowing, isMutual: res.isMutual } : u))
    );
    setSuggestedFriends((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, isFollowing: res.isFollowing, isMutual: res.isMutual } : u))
    );
    if (onUpdateStats) {
      onUpdateStats({ followingCount: res.followingCount });
    }
  };

  const handleCopyLink = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `Join me on Termy to master Sri Lankan A/L ICT past papers, earn double XP boosts, and team up in weekly Friends Quests! ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#131f24] border-2 border-card-border p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-on-surface">Add & Follow Friends</h2>
              <p className="text-xs text-text-muted">
                Follow anyone immediately — no approval or request needed!
              </p>
            </div>
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

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search by username (@kavindu_royal), name, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container border border-card-border focus:border-primary focus:outline-none text-sm font-medium text-on-surface placeholder:text-text-muted transition-colors"
          />
        </div>

        {/* Search Results if active */}
        {searchQuery.trim() && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-extrabold text-text-muted">
              Search Results ({searchResults.length})
            </span>
            {loading ? (
              <div className="py-6 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-base text-primary">sync</span>
                <span>Searching student network...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                No candidates found matching "{searchQuery}". Share your direct invite link below!
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3 hover:bg-surface-variant/40 transition-colors"
                >
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-card-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm">
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

                  <button
                    onClick={() => handleToggleFollow(user)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                      user.isFollowing
                        ? 'bg-surface-container-high border border-card-border text-text-muted hover:text-crimson-heart hover:border-crimson-heart/40'
                        : 'bg-primary text-on-primary-fixed shadow hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Direct Invite Link Capsule */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-surface-container to-surface-container border border-purple-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">link</span>
              <span>Invite via Direct Share Link</span>
            </span>
            <span className="text-[10px] text-text-muted font-bold">Instantly Connect</span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Anyone who opens your invite link will automatically follow you and jump straight into your national study cohort.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-variant border border-card-border text-xs font-extrabold text-on-surface flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                {copiedLink ? 'check' : 'content_copy'}
              </span>
              <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Share Link'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Suggested Active Study Classmates */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-text-muted">
              Suggested Classmates & Peers
            </span>
            <span className="text-[10px] text-lightning-gold font-bold">Active in Leagues</span>
          </div>

          <div className="flex flex-col gap-2">
            {suggestedFriends.map((peer) => (
              <div
                key={peer.id}
                className="p-3 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3 hover:bg-surface-variant/40 transition-colors"
              >
                <div
                  onClick={() => onOpenUserProfile && onOpenUserProfile(peer)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  {peer.avatarUrl ? (
                    <img
                      src={peer.avatarUrl}
                      alt={peer.name}
                      className="w-10 h-10 rounded-xl object-cover border border-card-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-card-border text-on-surface flex items-center justify-center font-bold text-sm">
                      {peer.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-on-surface truncate">
                        {peer.name}
                      </span>
                      <span className="text-[10px] font-bold text-lightning-gold">
                        🔥 {peer.streakDays}d
                      </span>
                    </div>
                    <span className="text-xs text-text-muted truncate">
                      {peer.username} • {peer.school}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFollow(peer)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                    peer.isFollowing
                      ? 'bg-surface-container-high border border-card-border text-text-muted'
                      : 'bg-primary text-on-primary-fixed shadow hover:brightness-110 active:scale-95'
                  }`}
                >
                  {peer.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
