# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from .endpoints import health, analyze, career

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(analyze.router, tags=["Resume Analysis"])
api_router.include_router(career.router, prefix="/career", tags=["Career Guidance"])

