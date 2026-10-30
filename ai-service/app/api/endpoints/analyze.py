from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from app.schemas.resume import (
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    AnalyzeResumeNLPRequest,
    AnalyzeResumeNLPResponse,
)
from app.services.nlp.extractor import ResumeExtractor
from app.services.nlp.analyzer import ResumeAnalyzer
from app.services.nlp.matcher import JobMatcher
from app.services.nlp.resume_parser import nlp_resume_parser

router = APIRouter()

# Instantiate singleton NLP services
extractor = ResumeExtractor()
analyzer = ResumeAnalyzer()
matcher = JobMatcher(extractor=extractor)


def _process_analysis(
    text: str,
    target_role: Optional[str] = None,
    target_job_description: Optional[str] = None,
    source_filename: Optional[str] = None
) -> ResumeAnalysisResponse:
    """Core analysis orchestrator shared by text payload and file upload endpoints."""
    if not text or len(text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text must contain at least 10 characters."
        )

    # 1. Extract contact entities
    contact_info = extractor.extract_contact_info(text)

    # 2. Detect standard section headers
    detected_sections = extractor.detect_sections(text)

    # 3. Extract skills with categorized breakdown
    skills, skills_by_category = extractor.extract_skills(text)

    # 4. Multi-dimensional ATS scoring
    effective_role = target_role or "Full Stack Software Engineer"
    ats_score, breakdown, strengths, improvements, action_verbs_count, metrics_count, word_count = analyzer.analyze(
        text=text,
        contact_info=contact_info,
        sections=detected_sections,
        skills=skills,
        target_role=effective_role
    )

    # 5. Job Description / Role Benchmark Matching
    job_match = matcher.match_resume(
        candidate_skills=skills,
        target_role=effective_role,
        job_description=target_job_description or ""
    )

    missing_skills = job_match.missing_critical_skills

    return ResumeAnalysisResponse(
        status="success",
        ats_score=ats_score,
        score_breakdown=breakdown,
        contact_info=contact_info,
        detected_sections=detected_sections,
        skills=skills,
        skills_by_category=skills_by_category,
        missing_skills=missing_skills,
        job_match=job_match,
        strengths=strengths,
        improvements=improvements,
        action_verbs_count=action_verbs_count,
        metrics_count=metrics_count,
        word_count=word_count,
        metadata={
            "raw_text_length": len(text),
            "target_role": effective_role,
            "engine": "nlp-engine-v2-production",
            "source_filename": source_filename,
            "has_job_description": bool(target_job_description and len(target_job_description.strip()) > 20),
        },
    )


@router.post("/analyze", response_model=ResumeAnalysisResponse, summary="Analyze Resume Text")
async def analyze_resume_text(payload: ResumeAnalysisRequest):
    """Parses raw text, performs NLP entity extraction, and evaluates multi-dimensional ATS score."""
    return _process_analysis(
        text=payload.raw_text,
        target_role=payload.target_role,
        target_job_description=payload.target_job_description,
    )


@router.post("/analyze/file", response_model=ResumeAnalysisResponse, summary="Analyze Uploaded Resume File")
async def analyze_resume_file(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    target_job_description: Optional[str] = Form(None)
):
    """Extracts text from PDF, DOCX, or TXT file and runs full NLP analysis pipeline."""
    try:
        content = await file.read()
        extracted_text = extractor.extract_text(content, file.filename or "resume.txt")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to extract text from {file.filename}: {str(e)}"
        )

    return _process_analysis(
        text=extracted_text,
        target_role=target_role,
        target_job_description=target_job_description,
        source_filename=file.filename,
    )


@router.post("/analyze-resume", response_model=AnalyzeResumeNLPResponse, summary="Analyze Resume with Structured NLP")
async def analyze_resume_nlp(payload: AnalyzeResumeNLPRequest):
    """
    NLP Resume Analysis Endpoint
    Extracts structured technical skills, programming languages, frameworks, databases,
    cloud technologies, DevOps tools, certifications, education, projects, experience,
    and soft skills with canonical skill normalization.
    """
    text = payload.text or payload.raw_text or payload.resume_text or ""
    if not text or len(text.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text must contain extractable text content."
        )

    result = nlp_resume_parser.parse_resume(text)
    return AnalyzeResumeNLPResponse(**result)
