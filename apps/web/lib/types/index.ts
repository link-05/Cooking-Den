export interface StepTimer {
  id: string;
  label: string;
  duration_seconds: number;
  prep_buffer_seconds: number;
}

export interface Ingredient {
  id: string;
  position: number;
  quantity: string;
  unit: string;
  name: string;
  raw_text: string;
}

export interface Step {
  id: string;
  position: number;
  content: string;
  timers: StepTimer[];
}

export interface Recipe {
  id: string;
  original_url: string;
  title: string;
  servings: number;
  cook_time: string;
  last_fetched_at: string;
  nutrition_text: string | null;
  nutrition_calculated: boolean;
  cost_text: string | null;
  cost_calculated: boolean;
  ingredients: Ingredient[];
  steps: Step[];
}

export interface ParseResponse {
  recipe: Recipe;
}

export interface ParseRequest {
  url: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
  cook_time: string;
  servings: number;
  original_url: string;
  saved_at: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface CollectionMembership {
  collection_id: string;
  recipe_id: string;
}
