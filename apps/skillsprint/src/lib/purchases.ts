import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { isDemoMode } from './config';

const RC_API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';
const RC_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';

// Products defined in RevenueCat dashboard
export const PRODUCT_IDS = {
  monthly: 'skillsprint_premium_monthly',
  annual: 'skillsprint_premium_annual',
  teamMonthly: 'skillsprint_team_monthly', // future — defined now, not offered yet
} as const;

export const ENTITLEMENT_PREMIUM = 'premium';

function getApiKey(): string {
  return Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
}

function isConfigured(): boolean {
  const key = getApiKey();
  return Boolean(key) && key !== 'REPLACE_WITH_VALUE';
}

export function configurePurchases(uid: string): void {
  if (isDemoMode || !isConfigured()) return;
  Purchases.configure({ apiKey: getApiKey(), appUserID: uid });
}

function hasPremiumEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
}

export function useCustomerInfo(): { isPremium: boolean; isLoading: boolean } {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode || !isConfigured()) {
      setIsLoading(false);
      return;
    }

    let active = true;

    Purchases.getCustomerInfo()
      .then((info) => {
        if (active) setIsPremium(hasPremiumEntitlement(info));
      })
      .catch(() => {
        // Silently fail — user stays on free tier
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      if (active) setIsPremium(hasPremiumEntitlement(info));
    });

    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  return { isPremium, isLoading };
}

export async function purchaseMonthly(): Promise<boolean> {
  if (isDemoMode || !isConfigured()) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p: PurchasesPackage) => p.product.identifier === PRODUCT_IDS.monthly,
    );
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPremiumEntitlement(customerInfo);
  } catch {
    return false;
  }
}

export async function purchaseAnnual(): Promise<boolean> {
  if (isDemoMode || !isConfigured()) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p: PurchasesPackage) => p.product.identifier === PRODUCT_IDS.annual,
    );
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return hasPremiumEntitlement(customerInfo);
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (isDemoMode || !isConfigured()) return false;
  try {
    const info = await Purchases.restorePurchases();
    return hasPremiumEntitlement(info);
  } catch {
    return false;
  }
}
