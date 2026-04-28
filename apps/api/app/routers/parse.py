"""POST /parse — accepts a URL and returns a Recipe.

For step 6 this returns a hardcoded Spaghetti Carbonara, matching the Next.js
mock route at apps/web/app/api/parse/route.ts. The real three-tier parser
(recipe-scrapers → BeautifulSoup → Claude) arrives in step 8.
"""

# Import the datetime library
from datetime import datetime, timezone

# Import fastapi from APIRouter
from fastapi import APIRouter

# Import all data schema
from ..schemas import (
    Ingredient,
    ParseRequest,
    ParseResponse,
    Recipe,
    Step,
    StepTimer,
)

# An APIRouter is a mini FastAPI app — a group of routes that get mounted
# onto the main app via app.include_router(). This keeps endpoints organized
# by feature (parse, recipes, nutrition, ...) instead of all in main.py.
router = APIRouter()


# Build the mock recipe once at import time. Constructing Pydantic models
# directly (instead of dicts) means any typo or missing field fails *now*,
# at server startup, not later when a user hits the endpoint.
_MOCK_RECIPE = Recipe(
    id="mock-1",
    original_url="",  # filled in per-request below
    title="Spaghetti Carbonara",
    servings=4,
    cook_time="30 mins",
    last_fetched_at=datetime.now(timezone.utc).isoformat(),
    nutrition_text=None,
    nutrition_calculated=False,
    cost_text=None,
    cost_calculated=False,
    ingredients=[
        Ingredient(id="i1", position=1, quantity="400", unit="g",
                   name="spaghetti", raw_text="400g spaghetti"),
        Ingredient(id="i2", position=2, quantity="200", unit="g",
                   name="pancetta or guanciale",
                   raw_text="200g pancetta or guanciale, diced"),
        Ingredient(id="i3", position=3, quantity="4", unit="",
                   name="large eggs", raw_text="4 large eggs"),
        Ingredient(id="i4", position=4, quantity="100", unit="g",
                   name="Pecorino Romano, finely grated",
                   raw_text="100g Pecorino Romano, finely grated"),
        Ingredient(id="i5", position=5, quantity="2", unit="cloves",
                   name="garlic", raw_text="2 cloves garlic, smashed"),
        Ingredient(id="i6", position=6, quantity="", unit="",
                   name="salt and coarsely ground black pepper",
                   raw_text="salt and coarsely ground black pepper"),
    ],
    steps=[
        Step(
            id="s1", position=1,
            content="Bring a large pot of heavily salted water to a boil.",
            timers=[StepTimer(id="t1", label="Boil water",
                              duration_seconds=600, prep_buffer_seconds=30)],
        ),
        Step(
            id="s2", position=2,
            content=(
                "Cook the pancetta and smashed garlic in a large skillet over "
                "medium heat, stirring occasionally, until the fat renders and "
                "the pancetta is crispy. Discard the garlic."
            ),
            timers=[StepTimer(id="t2", label="Cook pancetta",
                              duration_seconds=480, prep_buffer_seconds=30)],
        ),
        Step(
            id="s3", position=3,
            content=(
                "Add the spaghetti to the boiling water and cook until al dente "
                "according to package instructions. Reserve 1 cup of pasta water "
                "before draining."
            ),
            timers=[StepTimer(id="t3", label="Cook pasta",
                              duration_seconds=540, prep_buffer_seconds=30)],
        ),
        Step(
            id="s4", position=4,
            content=(
                "While the pasta cooks, whisk the eggs and Pecorino Romano "
                "together in a bowl until smooth. Season generously with black "
                "pepper."
            ),
            timers=[],
        ),
        Step(
            id="s5", position=5,
            content=(
                "Remove the skillet from heat. Add the drained pasta and toss to "
                "coat in the pancetta fat. Working quickly, pour the egg mixture "
                "over the pasta, tossing constantly and adding pasta water a "
                "splash at a time until the sauce is creamy and clings to every "
                "strand. Serve immediately."
            ),
            timers=[],
        ),
    ],
)


# @router.post is the decorator that registers this function as the POST
# handler for "/parse". The function name (`parse`) is internal — only the
# path and HTTP method matter.
#
# - `req: ParseRequest`  → FastAPI sees the type, parses the JSON body for
#                          you, and returns a 422 error automatically if the
#                          body is missing fields or the wrong type.
#                          (No `if (!body.url)` check needed.)
# - `-> ParseResponse`   → declared return type drives the OpenAPI docs and
#                          response serialization. Returning anything that
#                          doesn't fit raises a server-side error.
@router.post("/parse")
async def parse(req: ParseRequest) -> ParseResponse:
    # model_copy(update=...) is Pydantic v2's "spread + override" — the
    # equivalent of `{ ...MOCK_RECIPE.recipe, original_url: body.url }`
    # in TypeScript. Returns a new Recipe; the original is untouched.
    recipe = _MOCK_RECIPE.model_copy(update={"original_url": req.url})
    return ParseResponse(recipe=recipe)
