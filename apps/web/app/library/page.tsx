"use client";

import { useState } from "react";
import RecipeCard from "@/app/components/recipe-card";
import AddRecipeTile from "@/app/components/add-recipe-tile";
import { useLibrary } from "@/lib/hooks/use-library";

export default function LibraryPage() {
  const {
    recipes,
    collections,
    memberships,
    createCollection,
    addToCollection,
    removeFromCollection,
  } = useLibrary();

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createCollection(newCollectionName.trim());
    setNewCollectionName("");
    setShowNewCollection(false);
  }

  const filteredRecipes =
    activeCollectionId === null
      ? recipes
      : recipes.filter((r) =>
          memberships.some(
            (m) => m.collection_id === activeCollectionId && m.recipe_id === r.id
          )
        );

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 md:w-56 md:border-b-0 md:border-r md:p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Library
        </p>

        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => setActiveCollectionId(null)}
            className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              activeCollectionId === null
                ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            All recipes
            <span className="text-xs text-zinc-400">{recipes.length}</span>
          </button>

          {collections.map((c) => {
            const count = memberships.filter(
              (m) => m.collection_id === c.id
            ).length;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCollectionId(c.id)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeCollectionId === c.id
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="ml-2 flex-shrink-0 text-xs text-zinc-400">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-3">
          {showNewCollection ? (
            <form onSubmit={handleCreateCollection} className="flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCollection(false);
                    setNewCollectionName("");
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewCollection(true)}
              className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New collection
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {activeCollectionId !== null && filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              No recipes in this collection yet.
            </p>
            <p className="text-sm text-zinc-400">
              Use the + button on any recipe card to add it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCollectionId === null && <AddRecipeTile />}
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                collections={collections}
                memberships={memberships}
                onAddToCollection={addToCollection}
                onRemoveFromCollection={removeFromCollection}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
