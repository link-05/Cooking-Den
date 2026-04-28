"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as store from "@/lib/store";
import type { ParseResponse } from "@/lib/types";

export default function UrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setIsParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to parse recipe");
      }

      const { recipe }: ParseResponse = await res.json();
      sessionStorage.setItem(`recipe_${recipe.id}`, JSON.stringify(recipe));
      store.saveRecipe(recipe);
      router.push(`/recipe/${recipe.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsParsing(false);
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="Paste a recipe URL…"
          disabled={isParsing}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={isParsing || !url.trim()}
          className="rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isParsing ? "Saving…" : "Save recipe"}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
