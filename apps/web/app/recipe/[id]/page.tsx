"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RecipeView from "@/app/components/recipe-view";
import type { Recipe } from "@/lib/types";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`recipe_${id}`);
    if (stored) {
      setRecipe(JSON.parse(stored) as Recipe);
    } else {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Recipe not found — it may have expired. Try pasting the URL again.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-orange-500 hover:text-orange-600"
        >
          ← Back to home
        </Link>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <RecipeView recipe={recipe} />
    </main>
  );
}
