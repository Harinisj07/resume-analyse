from pydantic import BaseModel, Field
from typing import List, Optional


class RoadmapStage(BaseModel):
    stage_number: int
    title: str
    duration: str
    objective: str
    skills_to_acquire: List[str] = []
    recommended_topics: List[str] = []
    hands_on_project: str
    project_description: str


class CertificationRecommendation(BaseModel):
    name: str
    issuer: str
    level: str
    relevance: str


class CareerRoadmapRequest(BaseModel):
    target_role: str = Field(..., min_length=2, description="Target career role or job title")
    current_skills: List[str] = Field(default=[], description="List of candidate's verified skills")
    experience_level: Optional[str] = Field(default="intermediate", description="Current experience level")


class CareerRoadmapResponse(BaseModel):
    status: str = "success"
    target_role: str
    readiness_score: float = Field(..., ge=0, le=100)
    skills_overlap: List[str] = []
    critical_gap_skills: List[str] = []
    estimated_timeline: str
    stages: List[RoadmapStage] = []
    certifications: List[CertificationRecommendation] = []
    interview_focus_areas: List[str] = []
