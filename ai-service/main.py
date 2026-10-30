import sys
from pathlib import Path

# Ensure ai-service root directory is in sys.path regardless of execution CWD
ai_service_dir = Path(__file__).resolve().parent
if str(ai_service_dir) not in sys.path:
    sys.path.insert(0, str(ai_service_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.core.config import settings
from app.api.api_v1 import api_router
from app.schemas.health import HealthResponse
from app.schemas.resume import AnalyzeResumeNLPRequest, AnalyzeResumeNLPResponse
from app.services.nlp.resume_parser import nlp_resume_parser

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level health endpoint for direct discovery
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def root_health():
    return HealthResponse(
        status="ok",
        service="ai-service",
        version=settings.VERSION,
    )

# Root-level NLP analysis endpoint (POST /analyze-resume)
@app.post("/analyze-resume", response_model=AnalyzeResumeNLPResponse, tags=["Resume Analysis"])
async def root_analyze_resume(payload: AnalyzeResumeNLPRequest):
    text = payload.text or payload.raw_text or payload.resume_text or ""
    if not text or len(text.strip()) < 5:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text must contain extractable text content."
        )
    result = nlp_resume_parser.parse_resume(text)
    return AnalyzeResumeNLPResponse(**result)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
