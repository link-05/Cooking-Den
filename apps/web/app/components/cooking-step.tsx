"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Step } from "@/lib/types";
import CookingTimer from "./cooking-timer";

interface Props {
  step: Step;
  stepNumber: number;
  totalSteps: number;
  onAdvance: () => void;
}

const AUTO_ADVANCE_DELAY_MS = 1500;

export default function CookingStep({
  step,
  stepNumber,
  totalSteps,
  onAdvance,
}: Props) {
  const [started, setStarted] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleStart = useCallback((id: string) => {
    setStarted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const allStartedDone = useMemo(() => {
    if (started.size === 0) return false;
    for (const id of started) if (!completed.has(id)) return false;
    return true;
  }, [started, completed]);

  // Auto-advance after the last started timer completes.
  useEffect(() => {
    if (!allStartedDone) return;
    const t = setTimeout(onAdvance, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [allStartedDone, onAdvance]);

  const isLast = stepNumber === totalSteps;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-10">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-orange-500">
          Step {stepNumber} of {totalSteps}
        </div>

        <p className="text-center text-2xl font-medium leading-relaxed text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {step.content}
        </p>

        {step.timers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {step.timers.map((timer) => (
              <CookingTimer
                key={timer.id}
                timer={timer}
                onStart={() => handleStart(timer.id)}
                onComplete={() => handleComplete(timer.id)}
              />
            ))}
          </div>
        )}

        {allStartedDone && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400">
            All timers done — advancing…
          </div>
        )}
      </div>

      <button
        onClick={onAdvance}
        className="rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600"
      >
        {isLast ? "Finish cooking" : "Done — next step"}
      </button>
    </div>
  );
}
