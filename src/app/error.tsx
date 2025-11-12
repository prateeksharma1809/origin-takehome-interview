"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Page error:', error);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto rounded border border-red-200 bg-red-50 text-red-800 p-4">
        <h2 className="text-lg font-semibold mb-2">Something went wrong loading sessions</h2>
        <p className="mb-4">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded bg-red-600 px-3 py-1.5 text-white text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
