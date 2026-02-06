import * as Sentry from "@sentry/nextjs";

// Log error to Sentry
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Log message to Sentry
export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Set user context
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

// Clear user context
export function clearUser() {
  Sentry.setUser(null);
}

// Add breadcrumb
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Track performance
export function trackPerformance(name: string, operation: string) {
  return Sentry.startSpan({ name, op: operation }, () => {
    // Return a finish function for compatibility
    return { finish: () => {} };
  });
}
