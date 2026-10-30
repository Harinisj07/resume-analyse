"""
Resume Content & ATS Scoring Analyzer Module
Performs multi-dimensional weighted scoring: Contact Completeness, Section Structure,
Action Verbs & Impact Metrics, Keyword Relevance, and Formatting/Readability.
"""
import re
from typing import Dict, Any, List, Tuple
from app.schemas.resume import ContactInfo, DetectedSections, ExtractedSkill, ScoreBreakdown


class ResumeAnalyzer:
    def __init__(self):
        # High-impact resume power action verbs
        self.action_verbs = {
            "architected", "engineered", "spearheaded", "orchestrated", "scaled",
            "optimized", "designed", "developed", "deployed", "implemented",
            "streamlined", "accelerated", "automated", "refactored", "built",
            "pioneered", "championed", "formulated", "established", "maximized",
            "reduced", "increased", "cut", "saved", "mentored", "directed",
            "collaborated", "managed", "negotiated", "secured", "integrated",
            "transformed", "modernized", "enhanced", "resolved", "executed"
        }

    def analyze(
        self,
        text: str,
        contact_info: ContactInfo,
        sections: DetectedSections,
        skills: List[ExtractedSkill],
        target_role: str = ""
    ) -> Tuple[float, ScoreBreakdown, List[str], List[str], int, int, int]:
        """
        Calculates ATS composite score and sub-scores along with strengths and improvements.
        Returns: (ats_score, score_breakdown, strengths, improvements, action_verbs_count, metrics_count, word_count)
        """
        words = text.split()
        word_count = len(words)

        # 1. Contact Score (10% weight)
        contact_score = 0.0
        if contact_info.email:
            contact_score += 35.0
        if contact_info.phone:
            contact_score += 25.0
        if contact_info.linkedin:
            contact_score += 20.0
        if contact_info.github or contact_info.portfolio:
            contact_score += 20.0
        contact_score = min(contact_score, 100.0)

        # 2. Structure Score (15% weight)
        structure_score = 0.0
        if sections.experience:
            structure_score += 30.0
        if sections.skills:
            structure_score += 25.0
        if sections.education:
            structure_score += 25.0
        if sections.summary:
            structure_score += 10.0
        if sections.projects or sections.certifications:
            structure_score += 10.0
        structure_score = min(structure_score, 100.0)

        # 3. Impact & Action Verbs Score (25% weight)
        # Regex for impact metrics (e.g., 45%, $2M, 100k, 3x, 50+)
        metric_pattern = r'(\b\d+[\d,.]*\s*(?:%|\+|k|m|million|billion|x\b|\$))|(\$\s*\d+[\d,.]*)'
        metric_matches = re.findall(metric_pattern, text, re.IGNORECASE)
        metrics_count = len(metric_matches)

        # Count action verbs in resume
        lower_text = text.lower()
        found_verbs = [verb for verb in self.action_verbs if re.search(rf'\b{verb}\b', lower_text)]
        action_verbs_count = len(found_verbs)

        # Score impact: 5+ metrics and 5+ action verbs yields high score
        verb_pts = min(action_verbs_count * 10, 50)
        metric_pts = min(metrics_count * 10, 50)
        impact_score = float(verb_pts + metric_pts)

        # 4. Keyword & Skill Relevance Score (35% weight)
        skill_count = len(skills)
        if skill_count >= 15:
            relevance_score = 95.0
        elif skill_count >= 10:
            relevance_score = 85.0
        elif skill_count >= 6:
            relevance_score = 72.0
        elif skill_count >= 3:
            relevance_score = 55.0
        else:
            relevance_score = 35.0

        # Adjust score if target role keywords appear in text
        if target_role:
            role_keywords = [w.lower() for w in target_role.split() if len(w) > 3]
            matched_role_words = [kw for kw in role_keywords if kw in lower_text]
            if matched_role_words:
                relevance_score = min(relevance_score + (len(matched_role_words) * 4), 100.0)

        # 5. Formatting & Readability Score (15% weight)
        format_score = 70.0
        # Word count check (optimal: 300 to 1200 words)
        if 350 <= word_count <= 1100:
            format_score += 15.0
        elif word_count < 200:
            format_score -= 25.0
        elif word_count > 1500:
            format_score -= 15.0

        # Bullet point detection
        bullet_lines = len(re.findall(r'^\s*[-•*]\s+', text, re.MULTILINE))
        if bullet_lines >= 8:
            format_score += 15.0
        elif bullet_lines >= 4:
            format_score += 8.0

        format_score = max(min(format_score, 100.0), 20.0)

        # Composite ATS Score
        composite_score = (
            (contact_score * 0.10) +
            (structure_score * 0.15) +
            (impact_score * 0.25) +
            (relevance_score * 0.35) +
            (format_score * 0.15)
        )
        ats_score = round(composite_score, 1)

        # Generate Strengths
        strengths = []
        if impact_score >= 70:
            strengths.append(f"Strong quantification with {metrics_count} measurable achievements detected")
        if action_verbs_count >= 5:
            strengths.append(f"Effective use of {action_verbs_count} authoritative action verbs (e.g., {', '.join(found_verbs[:3])})")
        if skill_count >= 8:
            strengths.append(f"Robust technical competency profile with {skill_count} recognized domain skills")
        if structure_score >= 85:
            strengths.append("Standard ATS-friendly section hierarchy properly structured")
        if contact_info.linkedin or contact_info.github:
            strengths.append("Professional profile links (LinkedIn/GitHub) readily accessible for recruiters")
        if len(strengths) == 0:
            strengths.append("Clean foundation with concise technical content")

        # Generate Recommendations & Improvements
        improvements = []
        if metrics_count < 3:
            improvements.append("Quantify accomplishments using the XYZ formula: Accomplished [X], as measured by [Y], by doing [Z] (e.g. '% cut in load times', '$ savings')")
        if action_verbs_count < 4:
            improvements.append("Replace passive expressions ('was responsible for', 'helped with') with assertive verbs like 'architected', 'spearheaded', or 'orchestrated'")
        if not sections.summary:
            improvements.append("Add a 2-3 sentence Professional Summary at the top highlighting your years of experience and core specialties")
        if not sections.projects:
            improvements.append("Incorporate a Key Projects section showcasing real-world system architecture, GitHub links, and live demos")
        if not contact_info.linkedin:
            improvements.append("Add a verified LinkedIn profile link in the header contact block")
        if not contact_info.github and "software" in (target_role or "").lower():
            improvements.append("Add a GitHub profile link to provide evidence of open-source or coding activity")
        if word_count < 300:
            improvements.append(f"Resume is relatively brief ({word_count} words); elaborate on specific project responsibilities and technical decisions")
        elif word_count > 1200:
            improvements.append(f"Resume is lengthy ({word_count} words); streamline older positions into concise 2-3 line summaries")

        breakdown = ScoreBreakdown(
            contact_score=round(contact_score, 1),
            structure_score=round(structure_score, 1),
            impact_score=round(impact_score, 1),
            relevance_score=round(relevance_score, 1),
            format_score=round(format_score, 1),
        )

        return ats_score, breakdown, strengths, improvements, action_verbs_count, metrics_count, word_count
