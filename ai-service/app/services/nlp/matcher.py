"""
Job Description & Resume Semantic Matching Module
Matches candidate skills against Job Descriptions or target role expectations,
calculates match percentages, identifies gaps, and suggests ATS keywords.
"""
import re
from typing import List, Dict, Any, Tuple
from app.schemas.resume import ExtractedSkill, JobMatchDetails
from app.services.nlp.extractor import ResumeExtractor


class JobMatcher:
    def __init__(self, extractor: ResumeExtractor):
        self.extractor = extractor

        # Role baseline skill benchmarks when explicit JD isn't provided
        self.role_benchmarks: Dict[str, List[str]] = {
            "frontend": [
                "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS",
                "Redux", "REST APIs", "Jest", "Vite", "Git"
            ],
            "backend": [
                "Python", "Node.js", "Express", "FastAPI", "PostgreSQL", "MongoDB",
                "Redis", "Docker", "REST APIs", "Microservices", "Git", "CI/CD"
            ],
            "full stack": [
                "JavaScript", "TypeScript", "React", "Node.js", "Python", "MongoDB",
                "PostgreSQL", "Docker", "REST APIs", "Git", "CI/CD", "Tailwind CSS"
            ],
            "devops": [
                "Linux", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD",
                "GitHub Actions", "Ansible", "Prometheus", "Grafana", "Bash", "Python"
            ],
            "cloud": [
                "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
                "Microservices", "System Design", "Linux", "Security"
            ],
            "data scientist": [
                "Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "PyTorch",
                "TensorFlow", "Machine Learning", "Data Analysis", "Git"
            ],
            "ai engineer": [
                "Python", "PyTorch", "LLMs", "LangChain", "HuggingFace", "RAG",
                "FastAPI", "Docker", "Vector DBs", "Machine Learning"
            ],
        }

    def match_resume(
        self,
        candidate_skills: List[ExtractedSkill],
        target_role: str = "",
        job_description: str = ""
    ) -> JobMatchDetails:
        """
        Compare candidate skills with either target JD or role benchmark.
        Returns match percentage, matched skills, missing critical skills, and suggested keywords.
        """
        candidate_skill_names = {s.name.lower(): s.name for s in candidate_skills}

        target_skills_dict: Dict[str, str] = {}

        if job_description and len(job_description.strip()) > 30:
            # Extract skills present in the target job description
            jd_skills, _ = self.extractor.extract_skills(job_description)
            for s in jd_skills:
                target_skills_dict[s.name.lower()] = s.name
        else:
            # Fall back to role benchmarks
            role_lower = (target_role or "full stack").lower()
            matched_role_key = None
            for key in self.role_benchmarks:
                if key in role_lower:
                    matched_role_key = key
                    break
            
            benchmark_list = self.role_benchmarks.get(matched_role_key or "full stack", self.role_benchmarks["full stack"])
            for skill in benchmark_list:
                target_skills_dict[skill.lower()] = skill

        matched_skills: List[str] = []
        missing_skills: List[str] = []

        for lower_skill, display_name in target_skills_dict.items():
            if lower_skill in candidate_skill_names:
                matched_skills.append(display_name)
            else:
                missing_skills.append(display_name)

        total_target = len(target_skills_dict)
        if total_target > 0:
            match_percentage = round((len(matched_skills) / total_target) * 100.0, 1)
        else:
            match_percentage = 80.0

        # Suggested keywords to weave into resume
        recommended_keywords = missing_skills[:6]

        return JobMatchDetails(
            match_percentage=match_percentage,
            matched_skills=matched_skills,
            missing_critical_skills=missing_skills,
            recommended_keywords=recommended_keywords,
        )
