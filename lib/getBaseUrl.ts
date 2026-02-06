export function getBaseUrl(): string | undefined {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  return undefined;
}
