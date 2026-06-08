"use client";

import { useEffect, useRef, useState } from "react";
import type { StepTimer } from "@/lib/types";

type Phase = "idle" | "prep" | "running" | "paused" | "expired" | "done";

interface Props {
  timer: StepTimer;
  onStart?: () => void;
  onComplete?: () => void;
}

const GRACE_SECONDS = 60;

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function CookingTimer({ timer, onStart, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState<number>(timer.duration_seconds);

  const phaseDurationRef = useRef<number>(0);
  const startedAtRef = useRef<number | null>(null);
  const pausedFromRef = useRef<"prep" | "running" | null>(null);

  function beginPhase(p: "prep" | "running") {
    const duration =
      p === "prep" ? timer.prep_buffer_seconds : timer.duration_seconds;
    phaseDurationRef.current = duration;
    startedAtRef.current = Date.now();
    setRemaining(duration);
    setPhase(p);
  }

  function handleStart() {
    onStart?.();
    if (timer.prep_buffer_seconds > 0) beginPhase("prep");
    else beginPhase("running");
  }

  function handleReset() {
    startedAtRef.current = null;
    phaseDurationRef.current = 0;
    pausedFromRef.current = null;
    setRemaining(timer.duration_seconds);
    setPhase("idle");
  }

  function handleContinue() {
    setPhase("done");
    onComplete?.();
  }

  function handlePause() {
    if (phase !== "prep" && phase !== "running") return;
    pausedFromRef.current = phase;
    startedAtRef.current = null;
    setPhase("paused");
  }

  function handleResume() {
    const resumeTo = pausedFromRef.current;
    if (!resumeTo) return;
    phaseDurationRef.current = remaining;
    startedAtRef.current = Date.now();
    pausedFromRef.current = null;
    setPhase(resumeTo);
  }

  function handleSkipPrep() {
    if (phase !== "prep") return;
    phaseDurationRef.current = timer.duration_seconds;
    startedAtRef.current = Date.now();
    setRemaining(timer.duration_seconds);
    setPhase("running");
  }

  useEffect(() => {
    if (phase !== "prep" && phase !== "running") return;

    const tick = () => {
      if (startedAtRef.current === null) return;
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const rem = phaseDurationRef.current - elapsed;

      if (rem > 0) {
        setRemaining(rem);
        return;
      }

      if (phase === "prep") {
        // Inline prep → running transition so the effect stays self-contained.
        phaseDurationRef.current = timer.duration_seconds;
        startedAtRef.current = Date.now();
        setRemaining(timer.duration_seconds);
        setPhase("running");
        return;
      }

      // running done
      setRemaining(0);
      if (rem < -GRACE_SECONDS) {
        setPhase("expired");
      } else {
        setPhase("done");
        onComplete?.();
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phase, onComplete, timer.duration_seconds]);

  const isPrep = phase === "prep";
  const isRunning = phase === "running";
  const isPaused = phase === "paused";
  const isDone = phase === "done";
  const isExpired = phase === "expired";

  const ringColor = isPrep
    ? "border-amber-400"
    : isRunning
      ? "border-orange-500"
      : isPaused
        ? "border-zinc-400 dark:border-zinc-500"
        : isDone
          ? "border-emerald-500"
          : isExpired
            ? "border-rose-500"
            : "border-zinc-300 dark:border-zinc-700";

  const labelColor = isDone
    ? "text-emerald-600 dark:text-emerald-400"
    : isExpired
      ? "text-rose-600 dark:text-rose-400"
      : isPaused
        ? "text-zinc-500 dark:text-zinc-400"
        : "text-zinc-600 dark:text-zinc-300";

  const headerLabel = isPrep
    ? `Get ready · ${timer.label}`
    : isPaused
      ? `Paused · ${timer.label}`
      : timer.label;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`text-sm font-medium ${labelColor}`}>{headerLabel}</div>

      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${ringColor} transition-colors`}
      >
        <span className="font-mono text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {isDone ? "Done" : formatClock(remaining)}
        </span>
      </div>

      <div className="flex min-h-9 flex-wrap items-center justify-center gap-2">
        {phase === "idle" && (
          <button
            onClick={handleStart}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Start
          </button>
        )}

        {isPrep && (
          <>
            <button
              onClick={handleSkipPrep}
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Skip prep
            </button>
            <button
              onClick={handlePause}
              className="rounded-full border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Pause
            </button>
            <button
              onClick={handleReset}
              className="rounded-full px-2 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Reset
            </button>
          </>
        )}

        {isRunning && (
          <>
            <button
              onClick={handlePause}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Pause
            </button>
            <button
              onClick={handleReset}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={handleResume}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Resume
            </button>
            <button
              onClick={handleReset}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </>
        )}

        {isExpired && (
          <button
            onClick={handleContinue}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            I&rsquo;m back
          </button>
        )}

        {isDone && (
          <button
            onClick={handleReset}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
