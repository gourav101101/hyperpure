"use client";
import { logError, logMessage, setUser, addBreadcrumb } from '@/lib/errorTracking';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ErrorDemo() {
  const [errorCount, setErrorCount] = useState(0);

  const throwError = () => {
    try {
      throw new Error('Test error from error-demo page');
    } catch (error) {
      logError(error as Error, {
        page: 'error-demo',
        timestamp: new Date().toISOString(),
        userAction: 'clicked throw error button',
      });
      setErrorCount(prev => prev + 1);
      toast.error('Error logged to Sentry!');
    }
  };

  const logWarning = () => {
    logMessage('This is a test warning message', 'warning');
    toast.warning('Warning logged to Sentry!');
  };

  const logInfo = () => {
    logMessage('User viewed error demo page', 'info');
    toast.info('Info logged to Sentry!');
  };

  const trackUser = () => {
    setUser({
      id: 'user123',
      email: 'test@example.com',
      username: 'testuser',
    });
    toast.success('User context set!');
  };

  const addBreadcrumbExample = () => {
    addBreadcrumb('User clicked button', 'user-action', {
      buttonName: 'Add Breadcrumb',
      timestamp: Date.now(),
    });
    toast.success('Breadcrumb added!');
  };

  const throwUnhandledError = () => {
    // This will be caught by ErrorBoundary
    throw new Error('Unhandled error - will crash component');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐛</div>
          <h1 className="text-4xl font-bold text-white mb-2">Sentry Error Tracking</h1>
          <p className="text-white/80">Monitor & fix errors in production</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Error Tracking */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🔴 Error Tracking</h2>
            <div className="space-y-3">
              <button
                onClick={throwError}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold"
              >
                Throw Error
              </button>
              <button
                onClick={logWarning}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold"
              >
                Log Warning
              </button>
              <button
                onClick={logInfo}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
              >
                Log Info
              </button>
            </div>
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-700">
                Errors logged: <span className="font-bold">{errorCount}</span>
              </div>
            </div>
          </div>

          {/* Context & Breadcrumbs */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">🎯 Context & Breadcrumbs</h2>
            <div className="space-y-3">
              <button
                onClick={trackUser}
                className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 font-semibold"
              >
                Set User Context
              </button>
              <button
                onClick={addBreadcrumbExample}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
              >
                Add Breadcrumb
              </button>
              <button
                onClick={throwUnhandledError}
                className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 font-semibold"
              >
                💥 Crash Component
              </button>
            </div>
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-purple-700">
                Context helps debug issues by tracking user actions
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-4">✨ Sentry Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-3xl mb-2">🐛</div>
              <div className="font-semibold text-sm">Error Tracking</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-semibold text-sm">Performance</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-2">🎬</div>
              <div className="font-semibold text-sm">Session Replay</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-2">🔔</div>
              <div className="font-semibold text-sm">Alerts</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold mb-3">📝 What Gets Tracked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>JavaScript errors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>API failures</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unhandled promises</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Component crashes</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>User context</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Breadcrumbs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Performance metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Stack traces</span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-800 mb-3">⚙️ Setup Required</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>1. Create account at <a href="https://sentry.io" target="_blank" className="underline font-semibold">sentry.io</a></div>
            <div>2. Get your DSN from project settings</div>
            <div>3. Add to <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code>:</div>
            <pre className="bg-yellow-100 p-3 rounded mt-2 overflow-x-auto">
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
            </pre>
            <div className="mt-3">4. Restart dev server</div>
          </div>
        </div>
      </div>
    </div>
  );
}
