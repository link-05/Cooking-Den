"use client";

import { useCallback, useEffect, useState } from "react";
import * as store from "@/lib/store";
import type { Recipe, RecipeSummary, Collection, CollectionMembership } from "@/lib/types";

export function useLibrary() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberships, setMemberships] = useState<CollectionMembership[]>([]);

  useEffect(() => {
    setRecipes(store.getRecipes());
    setCollections(store.getCollections());
    setMemberships(store.getMemberships());
  }, []);

  const saveRecipe = useCallback((recipe: Recipe) => {
    store.saveRecipe(recipe);
    setRecipes(store.getRecipes());
  }, []);

  const createCollection = useCallback((name: string) => {
    store.createCollection(name);
    setCollections(store.getCollections());
  }, []);

  const addToCollection = useCallback((collectionId: string, recipeId: string) => {
    store.addToCollection(collectionId, recipeId);
    setMemberships(store.getMemberships());
  }, []);

  const removeFromCollection = useCallback((collectionId: string, recipeId: string) => {
    store.removeFromCollection(collectionId, recipeId);
    setMemberships(store.getMemberships());
  }, []);

  return {
    recipes,
    collections,
    memberships,
    saveRecipe,
    createCollection,
    addToCollection,
    removeFromCollection,
  };
}
