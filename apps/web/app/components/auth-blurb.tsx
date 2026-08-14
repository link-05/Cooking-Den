// Shared marketing blurb shown above the Clerk form on both auth pages.
// Kept in one place so /sign-in and /sign-up stay in sync.
export default function AuthBlurb() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cooking Den
        </h1>
        <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          Paste any recipe URL. We strip the ads, save it forever, and a dedicated cooking mode.
        </p>
        <p className="text-sm italic text-zinc-400 dark:text-zinc-500">
          Your recipe with built in cooking step by step timer.
        </p>
      </div>

      <ul className="flex flex-col gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <li className="flex items-center gap-2">
          <Check /> Ad-free, saved forever
        </li>
        {/* <li className="flex items-center gap-2">
          <Check /> Cost &amp; nutrition on demand
        </li> */}
        <li className="flex items-center gap-2">
          <Check /> Step-by-step cooking mode with timers
        </li>
      </ul>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-orange-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
