import type { Recipe, RecipeSummary, Collection, CollectionMembership } from "@/lib/types";

const KEYS = {
  recipes: "cd_recipes",
  collections: "cd_collections",
  memberships: "cd_memberships",
} as const;

const RECIPE_KEY_PREFIX = "cd_recipe_";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getRecipes(): RecipeSummary[] {
  return read<RecipeSummary[]>(KEYS.recipes, []);
}

export function saveRecipe(recipe: Recipe): RecipeSummary {
  const summary: RecipeSummary = {
    id: recipe.id,
    title: recipe.title,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    original_url: recipe.original_url,
    saved_at: new Date().toISOString(),
  };
  const existing = getRecipes();
  const without = existing.filter((r) => r.id !== summary.id);
  write(KEYS.recipes, [summary, ...without]);
  write(`${RECIPE_KEY_PREFIX}${recipe.id}`, recipe);
  return summary;
}

export function getFullRecipe(id: string): Recipe | null {
  return read<Recipe | null>(`${RECIPE_KEY_PREFIX}${id}`, null);
}

export function getCollections(): Collection[] {
  return read<Collection[]>(KEYS.collections, []);
}

export function createCollection(name: string): Collection {
  const collection: Collection = {
    id: crypto.randomUUID(),
    name,
  };
  write(KEYS.collections, [...getCollections(), collection]);
  return collection;
}

export function getMemberships(): CollectionMembership[] {
  return read<CollectionMembership[]>(KEYS.memberships, []);
}

export function addToCollection(collectionId: string, recipeId: string): void {
  const existing = getMemberships();
  const alreadyMember = existing.some(
    (m) => m.collection_id === collectionId && m.recipe_id === recipeId
  );
  if (!alreadyMember) {
    write(KEYS.memberships, [
      ...existing,
      { collection_id: collectionId, recipe_id: recipeId },
    ]);
  }
}

export function removeFromCollection(
  collectionId: string,
  recipeId: string
): void {
  write(
    KEYS.memberships,
    getMemberships().filter(
      (m) => !(m.collection_id === collectionId && m.recipe_id === recipeId)
    )
  );
}
