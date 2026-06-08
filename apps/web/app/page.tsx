import Link from "next/link";
import UrlInput from "@/app/components/url-input";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col px-6 py-10">
      <div className="self-start">
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
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cooked Den
            </h1>
            <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
              Paste any recipe URL. We strip the ads, save it forever, and add
              cost, nutrition, and cooking mode.
            </p>
          </div>

          <UrlInput />

          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Works with any recipe site — AllRecipes, NYT Cooking, Serious Eats,
            and more.
          </p>
        </div>
      </div>
    </main>
  );
}
