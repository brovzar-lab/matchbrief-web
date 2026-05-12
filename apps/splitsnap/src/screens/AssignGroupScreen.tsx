import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { getMemberColor, getMemberInitials, generateId } from '../lib/utils';
import PaywallModal from '../components/PaywallModal';
import type { Group } from '../lib/types';

const FREE_MEMBER_LIMIT = 4;

type LocationState = {
  taxCents?: number;
  tipCents?: number;
};

export default function AssignGroupScreen(): JSX.Element {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const user = useAppStore((s) => s.user);
  const groups = useAppStore((s) => s.groups);
  const setGroups = useAppStore((s) => s.setGroups);
  const isPro = useAppStore((s) => s.isPro);
  const addToast = useAppStore((s) => s.addToast);
  const pendingItems = useAppStore((s) => s.pendingItems);

  const [showPaywall, setShowPaywall] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  function handleSelectGroup(group: Group): void {
    if (group.members.length >= FREE_MEMBER_LIMIT && !isPro) {
      setShowPaywall(true);
      return;
    }
    setSelectedGroupId(group.id);
  }

  function handleCreateGroup(): void {
    if (!newGroupName.trim()) { addToast('Enter a group name'); return; }
    if (!user) return;
    const newGroup: Group = {
      id: generateId(),
      name: newGroupName.trim(),
      members: [user.uid],
      memberEmails: { [user.uid]: user.email ?? '' },
      memberNames: { [user.uid]: user.displayName ?? 'You' },
      createdBy: user.uid,
      createdAt: new Date(),
    };
    if (isDemoMode) {
      addToast('Demo mode — group not saved');
    }
    setGroups([...groups, newGroup]);
    setSelectedGroupId(newGroup.id);
    setCreating(false);
    setNewGroupName('');
  }

  function handleInvite(): void {
    if (!inviteEmail.trim()) { addToast('Enter an email address'); return; }
    if (!selectedGroupId) { addToast('Select a group first'); return; }
    if (isDemoMode) {
      addToast('Demo mode — invite not sent');
      setInviteEmail('');
      return;
    }
    // In live mode: call inviteMember Cloud Function
    addToast(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
  }

  async function handleStartSplit(): Promise<void> {
    if (!selectedGroup) { addToast('Select a group first'); return; }

    if (isDemoMode) {
      addToast('Demo mode — split not saved');
      navigate(`/session/${sessionId ?? 'demo-session-new'}/claim`);
      return;
    }

    try {
      const { db } = await import('../lib/firebase');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      if (!db || !user) return;

      const sid = sessionId === 'new' ? generateId() : (sessionId ?? generateId());
      await setDoc(doc(db, 'groups', selectedGroup.id, 'sessions', sid), {
        groupId: selectedGroup.id,
        receiptImageUrl: '',
        subtotal: pendingItems.reduce((s, i) => s + i.price, 0),
        tax: state?.taxCents ?? 0,
        tip: state?.tipCents ?? 0,
        status: 'claiming',
        items: pendingItems,
        settledBy: [],
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      navigate(`/session/${sid}/claim`);
    } catch {
      addToast('Failed to create session. Try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pick a Group</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Existing groups */}
        <section>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Groups</p>
          <div className="space-y-2">
            {groups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              const needsPro = group.members.length >= FREE_MEMBER_LIMIT && !isPro;
              return (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full rounded-xl p-4 text-left border-2 transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-transparent bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{group.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-1">
                          {group.members.slice(0, 4).map((uid, i) => (
                            <div
                              key={uid}
                              className={`w-5 h-5 rounded-full ${getMemberColor(i)} flex items-center justify-center text-white text-xs font-bold border border-white`}
                            >
                              {getMemberInitials(group.memberNames[uid] ?? '?')}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{group.members.length} members</p>
                        {needsPro && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Pro</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Invite to selected group */}
        {selectedGroup && (
          <section className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Invite to {selectedGroup.name}</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@email.com"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
              />
              <button
                onClick={handleInvite}
                className="text-brand-600 font-semibold text-sm px-3 py-2 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                Invite
              </button>
            </div>
          </section>
        )}

        {/* Create new group */}
        {creating ? (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">New Group</p>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateGroup(); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full bg-white rounded-xl shadow-sm p-4 text-brand-600 font-semibold text-sm flex items-center gap-2 hover:bg-brand-50 transition-colors"
          >
            <span className="text-lg">+</span> Create New Group
          </button>
        )}
      </div>

      {/* Start split button */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={() => void handleStartSplit()}
          disabled={!selectedGroupId}
          className="w-full bg-brand-600 text-white rounded-xl py-4 font-bold text-base hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Start Claiming →
        </button>
      </div>
    </div>
  );
}
