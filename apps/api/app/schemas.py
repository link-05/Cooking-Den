from pydantic import BaseModel
# Pydantic does type checking

# The data schema for a timer, it will have an id, label, duration for how long it last, and a prep buffer
class StepTimer(BaseModel):
    id: str
    label: str
    duration_seconds: int
    prep_buffer_seconds: int

# An ingredient data model
class Ingredient(BaseModel):
    id: str
    position: int
    quantity: str
    unit: str
    name: str
    raw_text: str

# The actual step
class Step(BaseModel):
    id: str
    position: int
    content: str
    timers: list[StepTimer]

# the overall recipe content
class Recipe(BaseModel):
    id: str
    original_url: str
    title: str
    servings: int
    cook_time: str
    last_fetched_at: str
    nutrition_text: str | None
    nutrition_calculated: bool
    cost_text: str | None
    cost_calculated: bool
    ingredients: list[Ingredient]
    steps: list[Step]

# The holder for the url that is asked to be parsed. 
class ParseRequest(BaseModel):
    url: str

# The output of the parsed url, after it is converted to a recipe.
class ParseResponse(BaseModel):
    recipe: Recipe
