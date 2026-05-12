import { Purchases } from '@revenuecat/purchases-js';
import { isDemoMode } from './demo';

let initialized = false;

export function initRevenueCat(userId: string): void {
  if (isDemoMode || initialized) return;
  const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY;
  if (!apiKey || apiKey === 'REPLACE_WITH_VALUE') return;
  Purchases.configure(apiKey, userId);
  initialized = true;
}

export async function checkProEntitlement(): Promise<boolean> {
  if (isDemoMode || !initialized) return false;
  try {
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    return 'pro' in customerInfo.entitlements.active;
  } catch {
    return false;
  }
}

export async function presentPaywall(): Promise<boolean> {
  if (isDemoMode || !initialized) return false;
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();
    const current = offerings.current;
    if (!current) return false;
    const result = await Purchases.getSharedInstance().purchase({
      rcPackage: current.monthly!,
    });
    return 'pro' in result.customerInfo.entitlements.active;
  } catch {
    return false;
  }
}
