# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from ...schemas.health import HealthResponse
from ...core.config import settings
import sys
import platform

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
async def health_check():
    return HealthResponse(
        status="ok",
        service="ai-service",
        version=settings.VERSION,
        details={
            "python_version": sys.version.split()[0],
            "platform": platform.platform(),
            "nlp_pipeline_ready": True,
        },
    )
