export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function buildVenmoLink(handle: string, amountCents: number, note: string): string {
  const amount = (amountCents / 100).toFixed(2);
  return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle)}&amount=${amount}&note=${encodeURIComponent(note)}`;
}

export function buildCashAppLink(cashtag: string, amountCents: number): string {
  const amount = (amountCents / 100).toFixed(2);
  return `https://cash.app/$${cashtag}/${amount}`;
}

export function getMemberInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const MEMBER_COLORS = [
  'bg-orange-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-yellow-400',
  'bg-teal-400',
  'bg-red-400',
];

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
