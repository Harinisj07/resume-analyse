from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ResumeAnalysisRequest(BaseModel):
    raw_text: str = Field(..., min_length=10, description="Extracted resume text content")
    target_role: Optional[str] = Field(default=None, description="Optional target job title or role")
    target_job_description: Optional[str] = Field(default=None, description="Optional job description text")


class ExtractedSkill(BaseModel):
    name: str
    category: str = "general"
    confidence: float = 1.0


class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None


class ScoreBreakdown(BaseModel):
    contact_score: float = Field(..., ge=0, le=100)
    structure_score: float = Field(..., ge=0, le=100)
    impact_score: float = Field(..., ge=0, le=100)
    relevance_score: float = Field(..., ge=0, le=100)
    format_score: float = Field(..., ge=0, le=100)


class DetectedSections(BaseModel):
    summary: bool = False
    experience: bool = False
    education: bool = False
    skills: bool = False
    projects: bool = False
    certifications: bool = False


class JobMatchDetails(BaseModel):
    match_percentage: float = 0.0
    matched_skills: List[str] = []
    missing_critical_skills: List[str] = []
    recommended_keywords: List[str] = []


class ResumeAnalysisResponse(BaseModel):
    status: str = "success"
    ats_score: float = Field(..., ge=0, le=100)
    score_breakdown: ScoreBreakdown
    contact_info: ContactInfo
    detected_sections: DetectedSections
    skills: List[ExtractedSkill] = []
    skills_by_category: Dict[str, List[str]] = {}
    missing_skills: List[str] = []
    job_match: Optional[JobMatchDetails] = None
    strengths: List[str] = []
    improvements: List[str] = []
    action_verbs_count: int = 0
    metrics_count: int = 0
    word_count: int = 0
    metadata: Dict[str, Any] = {}


class AnalyzeResumeNLPRequest(BaseModel):
    text: Optional[str] = None
    raw_text: Optional[str] = None
    resume_text: Optional[str] = None


class AnalyzeResumeNLPResponse(BaseModel):
    skills: List[str] = []
    programmingLanguages: List[str] = []
    frameworks: List[str] = []
    databases: List[str] = []
    cloudTechnologies: List[str] = []
    devopsTools: List[str] = []
    certifications: List[Any] = []
    education: List[Any] = []
    projects: List[Any] = []
    experience: List[Any] = []
    softSkills: List[str] = []
