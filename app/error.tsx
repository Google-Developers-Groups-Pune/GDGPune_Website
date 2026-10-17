"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex items-center gap-1.5 mb-6">
        <span className="size-3 rounded-full bg-google-blue" />
        <span className="size-3 rounded-full bg-google-red" />
        <span className="size-3 rounded-full bg-google-yellow" />
        <span className="size-3 rounded-full bg-google-green" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-base text-fg-muted">
        We encountered a temporary issue while loading this page. Please try refreshing.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-full bg-google-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174ea6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-google-blue"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line-strong bg-white px-6 py-2.5 text-sm font-semibold text-fg transition hover:border-google-blue hover:bg-blue-pale/50"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}
