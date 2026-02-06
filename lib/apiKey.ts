import { randomBytes } from 'crypto';

interface ApiKey {
  key: string;
  userId: string;
  createdAt: number;
  expiresAt?: number;
}

const apiKeys = new Map<string, ApiKey>();

export function generateApiKey(userId: string, expiresInDays?: number): string {
  const key = `sk_${randomBytes(32).toString('hex')}`;
  const createdAt = Date.now();
  
  apiKeys.set(key, {
    key,
    userId,
    createdAt,
    expiresAt: expiresInDays ? createdAt + expiresInDays * 86400000 : undefined,
  });
  
  return key;
}

export function validateApiKey(key: string): { valid: boolean; userId?: string } {
  const apiKey = apiKeys.get(key);
  
  if (!apiKey) return { valid: false };
  
  if (apiKey.expiresAt && Date.now() > apiKey.expiresAt) {
    apiKeys.delete(key);
    return { valid: false };
  }
  
  return { valid: true, userId: apiKey.userId };
}

export function revokeApiKey(key: string): void {
  apiKeys.delete(key);
}
