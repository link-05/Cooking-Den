"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecipeSummary, Collection, CollectionMembership } from "@/lib/types";

interface Props {
  recipe: RecipeSummary;
  collections: Collection[];
  memberships: CollectionMembership[];
  onAddToCollection: (collectionId: string, recipeId: string) => void;
  onRemoveFromCollection: (collectionId: string, recipeId: string) => void;
}

export default function RecipeCard({
  recipe,
  collections,
  memberships,
  onAddToCollection,
  onRemoveFromCollection,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);

  const recipeCollections = memberships
    .filter((m) => m.recipe_id === recipe.id)
    .map((m) => collections.find((c) => c.id === m.collection_id))
    .filter((c): c is Collection => c !== undefined);

  function toggleCollection(collectionId: string) {
    const isMember = memberships.some(
      (m) => m.collection_id === collectionId && m.recipe_id === recipe.id
    );
    if (isMember) {
      onRemoveFromCollection(collectionId, recipe.id);
    } else {
      onAddToCollection(collectionId, recipe.id);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={`/recipe/${recipe.id}`} className="flex flex-col gap-1">
        <h3 className="font-semibold leading-snug text-zinc-900 transition-colors hover:text-orange-600 dark:text-zinc-50">
          {recipe.title}
        </h3>
        <div className="flex gap-3 text-xs text-zinc-400">
          {recipe.cook_time && <span>{recipe.cook_time}</span>}
          {recipe.servings > 0 && <span>{recipe.servings} servings</span>}
        </div>
      </Link>

      {recipeCollections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recipeCollections.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Link
          href={`/cook/${recipe.id}`}
          className="text-xs font-medium text-orange-500 hover:text-orange-600"
        >
          Cook
        </Link>

        {collections.length > 0 && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu((v) => !v)}
              title="Add to collection"
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="p-1">
                    {collections.map((c) => {
                      const isMember = memberships.some(
                        (m) => m.collection_id === c.id && m.recipe_id === recipe.id
                      );
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleCollection(c.id)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <span
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                              isMember
                                ? "border-orange-500 bg-orange-500"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          >
                            {isMember && (
                              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
