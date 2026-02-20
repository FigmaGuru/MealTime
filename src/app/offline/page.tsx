'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">You&apos;re offline</h1>
        <p className="text-muted-foreground text-sm">
          Check your connection and try again. Your meal plans are cached and will sync when
          you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
