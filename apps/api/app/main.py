from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import parse

app = FastAPI(title="Cooking Den API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
