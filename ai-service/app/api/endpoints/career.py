from fastapi import APIRouter
from app.schemas.career import CareerRoadmapRequest, CareerRoadmapResponse
from app.services.nlp.career import CareerGuidanceEngine

router = APIRouter()
career_engine = CareerGuidanceEngine()


@router.post("/roadmap", response_model=CareerRoadmapResponse, summary="Generate Tailored Career Roadmap")
async def generate_career_roadmap(payload: CareerRoadmapRequest):
    """
    Computes candidate career readiness score, detects critical gap skills,
    and returns phased learning milestones and portfolio project recommendations.
    """
    return career_engine.generate_roadmap(payload)
