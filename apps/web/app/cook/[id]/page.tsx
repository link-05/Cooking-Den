"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CookingSlideshow from "@/app/components/cooking-slideshow";
import { getFullRecipe } from "@/lib/store";
import type { Recipe } from "@/lib/types";

export default function CookPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loaded = getFullRecipe(id);
    if (loaded) setRecipe(loaded);
    else setNotFound(true);
  }, [id]);

  if (notFound) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          Recipe not found — try saving it again from the home page.
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

  return <CookingSlideshow recipe={recipe} />;
}
