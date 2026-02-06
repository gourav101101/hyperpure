const cache = new Map<string, { data: any; expiry: number }>();

export function setCache(key: string, data: any, ttlSeconds = 300) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
