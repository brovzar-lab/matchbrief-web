export function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function computeVenmoLink(handle: string, amountCents: number, sessionId: string): string {
  const amount = (amountCents / 100).toFixed(2);
  return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(handle)}&amount=${amount}&note=${encodeURIComponent(`SplitTab ${sessionId}`)}`;
}

export function computeVenmoWebLink(handle: string): string {
  return `https://venmo.com/u/${encodeURIComponent(handle)}`;
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function computePersonalTotal(
  items: Array<{ price: number; quantity: number; claimedBy: string[] }>,
  participantId: string,
  subtotal: number,
  tax: number,
  tip: number,
): number {
  let itemTotal = 0;
  for (const item of items) {
    if (item.claimedBy.includes(participantId)) {
      itemTotal += Math.round((item.price * item.quantity) / item.claimedBy.length);
    }
  }
  if (subtotal === 0) return itemTotal;
  const ratio = itemTotal / subtotal;
  return itemTotal + Math.round(tax * ratio) + Math.round(tip * ratio);
}
