export function fuzzySearch<T>(items: T[], query: string, keys: (keyof T)[]): T[] {
  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => {
    return keys.some(key => {
      const value = String(item[key]).toLowerCase();
      return value.includes(lowerQuery);
    });
  }).sort((a, b) => {
    const aScore = keys.reduce((score, key) => {
      const value = String(a[key]).toLowerCase();
      return score + (value.startsWith(lowerQuery) ? 2 : value.includes(lowerQuery) ? 1 : 0);
    }, 0);
    
    const bScore = keys.reduce((score, key) => {
      const value = String(b[key]).toLowerCase();
      return score + (value.startsWith(lowerQuery) ? 2 : value.includes(lowerQuery) ? 1 : 0);
    }, 0);
    
    return bScore - aScore;
  });
}
