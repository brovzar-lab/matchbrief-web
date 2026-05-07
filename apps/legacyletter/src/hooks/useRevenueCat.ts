import { useState, useEffect } from 'react';
import Purchases, {
  type PurchasesPackage,
  type PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { Alert } from 'react-native';
import { isDemoMode, type TierId } from '../lib/config';
import { useStore } from '../lib/store';

const PRODUCT_TO_TIER: Record<string, TierId> = {
  'com.lemaa.legacyletter.pro_monthly': 'pro_monthly',
  'com.lemaa.legacyletter.vault_monthly': 'vault_monthly',
  'com.lemaa.legacyletter.lifetime': 'lifetime',
};

export interface UseRevenueCatResult {
  packages: Record<string, PurchasesPackage>;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  purchase: (productId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export function useRevenueCat(): UseRevenueCatResult {
  const [packages, setPackages] = useState<Record<string, PurchasesPackage>>({});
  const [isLoading, setIsLoading] = useState(!isDemoMode);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const updateSubscription = useStore((s) => s.updateSubscription);

  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;

    Purchases.getOfferings()
      .then((offerings) => {
        if (cancelled) return;
        const pkgMap: Record<string, PurchasesPackage> = {};
        for (const pkg of offerings.current?.availablePackages ?? []) {
          pkgMap[pkg.product.identifier] = pkg;
        }
        setPackages(pkgMap);
      })
      .catch(() => {
        // offerings failed to load — prices fall back to static values
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function purchase(productId: string): Promise<boolean> {
    const pkg = packages[productId];
    if (!pkg) {
      Alert.alert('Unavailable', 'This plan is not available right now. Please try again later.');
      return false;
    }

    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const tier = PRODUCT_TO_TIER[productId] ?? 'pro_monthly';
      const expiry = customerInfo.allExpirationDates[productId];
      updateSubscription({
        tier,
        expiresAt: expiry ? new Date(expiry) : null,
        revenueCatId: customerInfo.originalAppUserId,
      });
      return true;
    } catch (error) {
      const rcError = error as PurchasesError;
      if (rcError.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Purchase failed', 'Something went wrong. Please try again.');
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }

  async function restore(): Promise<boolean> {
    setIsRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const activeSubs = [...customerInfo.activeSubscriptions];
      const tier = activeSubs
        .map((id) => PRODUCT_TO_TIER[id])
        .find((t): t is TierId => t !== undefined);

      if (tier) {
        const productId = activeSubs.find((id) => PRODUCT_TO_TIER[id] === tier) ?? '';
        const expiry = customerInfo.allExpirationDates[productId];
        updateSubscription({
          tier,
          expiresAt: expiry ? new Date(expiry) : null,
          revenueCatId: customerInfo.originalAppUserId,
        });
        Alert.alert('Purchases restored', 'Your subscription has been restored.');
        return true;
      }

      Alert.alert('Nothing to restore', 'No active purchases found for this account.');
      return false;
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases. Please try again.');
      return false;
    } finally {
      setIsRestoring(false);
    }
  }

  return { packages, isLoading, isPurchasing, isRestoring, purchase, restore };
}
