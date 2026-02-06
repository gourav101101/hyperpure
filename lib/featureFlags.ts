const flags: Record<string, boolean> = {
  enableLoyaltyProgram: true,
  enableBulkOrders: true,
  enableSellerAnalytics: true,
  enablePriceIntelligence: false,
  enableFraudDetection: true,
};

export function isFeatureEnabled(flag: string): boolean {
  return flags[flag] ?? false;
}

export function getAllFlags(): Record<string, boolean> {
  return { ...flags };
}
