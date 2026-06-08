import Link from "next/link";
import type { Recipe, StepTimer } from "@/lib/types";

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hrs} hr ${remaining} min` : `${hrs} hr`;
}

function TimerBadge({ timer }: { timer: StepTimer }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {timer.label} · {formatDuration(timer.duration_seconds)}
    </span>
  );
}

export default function RecipeView({ recipe }: { recipe: Recipe }) {
  return (
		<>
			<Link
				href="/library"
				className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
			>
			<svg
				className="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
			Library
		</Link>
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              {recipe.servings} servings
            </span>
          )}
          {recipe.cook_time && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {recipe.cook_time}
            </span>
          )}
          {recipe.original_url && (
            <a
              href={recipe.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Original source
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Ingredients */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Ingredients
          </h2>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-baseline gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {ingredient.raw_text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Instructions
          </h2>
          <ol className="flex flex-col gap-6">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {step.position}
                </span>
                <div className="flex flex-col gap-2 pt-0.5">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {step.content}
                  </p>
                  {step.timers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {step.timers.map((timer) => (
                        <TimerBadge key={timer.id} timer={timer} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Footer actions */}
      <div className="mt-10 flex gap-3">
        <Link
          href={`/cook/${recipe.id}`}
          className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Start cooking
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Save another
        </Link>
      </div>
    </div>
		</>
  );
}
