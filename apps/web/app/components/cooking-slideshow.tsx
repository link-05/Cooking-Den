"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import CookingStep from "./cooking-step";

function useScreenWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch {
        // Permission denied or unsupported — silently fall back.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      if (sentinel) sentinel.release().catch(() => {});
    };
  }, [active]);
}

export default function CookingSlideshow({ recipe }: { recipe: Recipe }) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useScreenWakeLock(!finished);

  const total = recipe.steps.length;
  const step = recipe.steps[index];

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= total - 1) {
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  if (total === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          This recipe has no steps to cook.
        </p>
        <Link
          href={`/recipe/${recipe.id}`}
          className="text-sm font-medium text-orange-500 hover:text-orange-600"
        >
          ← Back to recipe
        </Link>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {recipe.title} — done!
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/recipe/${recipe.id}`}
            className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Back to recipe
          </Link>
          <Link
            href="/library"
            className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Library
          </Link>
        </div>
      </main>
    );
  }

  const progressPct = ((index + 1) / total) * 100;

  return (
    <main className="flex flex-1 flex-col">
      {/* Top bar: title, exit, progress */}
      <header className="flex flex-col gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/recipe/${recipe.id}`}
            className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </Link>
          <h1 className="truncate text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {recipe.title}
          </h1>
          <div className="w-12" />
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Slide */}
      <CookingStep
        key={step.id}
        step={step}
        stepNumber={index + 1}
        totalSteps={total}
        onAdvance={goNext}
      />

      {/* Bottom nav */}
      <footer className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ← Previous
        </button>
        <span className="text-xs text-zinc-400">
          {index + 1} / {total}
        </span>
        <button
          onClick={goNext}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Next →
        </button>
      </footer>
    </main>
  );
}
