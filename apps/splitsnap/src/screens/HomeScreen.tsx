import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { formatCents, relativeTime, getMemberColor, getMemberInitials } from '../lib/utils';

export default function HomeScreen(): JSX.Element {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const groups = useAppStore((s) => s.groups);
  const activeSessions = useAppStore((s) => s.activeSessions);

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-600 text-white px-4 pt-12 pb-20">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-orange-200 text-sm">Hey, {firstName}</p>
            <h1 className="text-2xl font-bold">SplitSnap</h1>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Split CTA */}
      <div className="px-4 -mt-12 mb-6">
        <button
          onClick={() => navigate('/camera')}
          className="w-full bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-shadow active:scale-98"
        >
          <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📸</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-lg">New Split</p>
            <p className="text-gray-500 text-sm">Snap a receipt to get started</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="px-4 space-y-6">
        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Splits</h2>
            <div className="space-y-3">
              {activeSessions.map((session) => {
                const group = groups.find((g) => g.id === session.groupId);
                const total = session.subtotal + session.tax + session.tip;
                const claimed = session.items.filter((i) => i.claimedBy !== null).length;
                return (
                  <button
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}/claim`)}
                    className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{group?.name ?? 'Unknown Group'}</p>
                        <p className="text-xs text-gray-400">{relativeTime(session.createdAt)}</p>
                      </div>
                      <span className="text-brand-600 font-bold text-lg">{formatCents(total)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {group?.members.slice(0, 4).map((uid, i) => (
                          <div
                            key={uid}
                            className={`w-6 h-6 rounded-full ${getMemberColor(i)} flex items-center justify-center text-white text-xs font-bold border border-white`}
                          >
                            {getMemberInitials(group.memberNames[uid] ?? '?')}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {claimed}/{session.items.length} claimed
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Groups */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Groups</h2>
            <button
              onClick={() => navigate('/groups/new')}
              className="text-brand-600 text-sm font-semibold"
            >
              + New
            </button>
          </div>
          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 shadow-sm">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm">No groups yet. Start a split to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const groupSessions = activeSessions.filter((s) => s.groupId === group.id);
                return (
                  <button
                    key={group.id}
                    onClick={() => navigate(`/group/${group.id}/history`)}
                    className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-400">
                          {group.members.length} members
                          {groupSessions.length > 0 && (
                            <span className="ml-2 text-brand-600 font-medium">• {groupSessions.length} active</span>
                          )}
                        </p>
                      </div>
                      <div className="flex -space-x-1">
                        {group.members.slice(0, 3).map((uid, i) => (
                          <div
                            key={uid}
                            className={`w-8 h-8 rounded-full ${getMemberColor(i)} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
                          >
                            {getMemberInitials(group.memberNames[uid] ?? '?')}
                          </div>
                        ))}
                        {group.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                            +{group.members.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="h-16" />
    </div>
  );
}
