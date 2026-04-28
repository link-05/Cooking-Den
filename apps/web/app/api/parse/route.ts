import { NextRequest, NextResponse } from "next/server";
import type { ParseRequest, ParseResponse } from "@/lib/types";

const MOCK_RECIPE: ParseResponse = {
  recipe: {
    id: "mock-1",
    original_url: "",
    title: "Spaghetti Carbonara",
    servings: 4,
    cook_time: "30 mins",
    last_fetched_at: new Date().toISOString(),
    nutrition_text: null,
    nutrition_calculated: false,
    cost_text: null,
    cost_calculated: false,
    ingredients: [
      {
        id: "i1",
        position: 1,
        quantity: "400",
        unit: "g",
        name: "spaghetti",
        raw_text: "400g spaghetti",
      },
      {
        id: "i2",
        position: 2,
        quantity: "200",
        unit: "g",
        name: "pancetta or guanciale",
        raw_text: "200g pancetta or guanciale, diced",
      },
      {
        id: "i3",
        position: 3,
        quantity: "4",
        unit: "",
        name: "large eggs",
        raw_text: "4 large eggs",
      },
      {
        id: "i4",
        position: 4,
        quantity: "100",
        unit: "g",
        name: "Pecorino Romano, finely grated",
        raw_text: "100g Pecorino Romano, finely grated",
      },
      {
        id: "i5",
        position: 5,
        quantity: "2",
        unit: "cloves",
        name: "garlic",
        raw_text: "2 cloves garlic, smashed",
      },
      {
        id: "i6",
        position: 6,
        quantity: "",
        unit: "",
        name: "salt and coarsely ground black pepper",
        raw_text: "salt and coarsely ground black pepper",
      },
    ],
    steps: [
      {
        id: "s1",
        position: 1,
        content:
          "Bring a large pot of heavily salted water to a boil.",
        timers: [
          {
            id: "t1",
            label: "Boil water",
            duration_seconds: 600,
            prep_buffer_seconds: 30,
          },
        ],
      },
      {
        id: "s2",
        position: 2,
        content:
          "Cook the pancetta and smashed garlic in a large skillet over medium heat, stirring occasionally, until the fat renders and the pancetta is crispy. Discard the garlic.",
        timers: [
          {
            id: "t2",
            label: "Cook pancetta",
            duration_seconds: 480,
            prep_buffer_seconds: 30,
          },
        ],
      },
      {
        id: "s3",
        position: 3,
        content:
          "Add the spaghetti to the boiling water and cook until al dente according to package instructions. Reserve 1 cup of pasta water before draining.",
        timers: [
          {
            id: "t3",
            label: "Cook pasta",
            duration_seconds: 540,
            prep_buffer_seconds: 30,
          },
        ],
      },
      {
        id: "s4",
        position: 4,
        content:
          "While the pasta cooks, whisk the eggs and Pecorino Romano together in a bowl until smooth. Season generously with black pepper.",
        timers: [],
      },
      {
        id: "s5",
        position: 5,
        content:
          "Remove the skillet from heat. Add the drained pasta and toss to coat in the pancetta fat. Working quickly, pour the egg mixture over the pasta, tossing constantly and adding pasta water a splash at a time until the sauce is creamy and clings to every strand. Serve immediately.",
        timers: [],
      },
    ],
  },
};

export async function POST(request: NextRequest) {
  const body: ParseRequest = await request.json();

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Stamp the original URL onto the mock so the response reflects the request
  const recipe = { ...MOCK_RECIPE.recipe, original_url: body.url };

  return NextResponse.json({ recipe } satisfies ParseResponse);
}
