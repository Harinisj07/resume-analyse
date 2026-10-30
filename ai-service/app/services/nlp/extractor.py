"""
Resume Text & Entity Extraction Module
Handles PDF, DOCX, and TXT parsing, contact entity extraction, section detection,
and deep multi-domain skill taxonomy identification.
"""
import io
import re
from typing import Dict, Any, List, Tuple, Optional
# pyrefly: ignore [missing-import]
import pypdf
# pyrefly: ignore [missing-import]
import docx
from app.schemas.resume import ExtractedSkill, ContactInfo, DetectedSections


class ResumeExtractor:
    def __init__(self):
        self.supported_formats = [".pdf", ".docx", ".txt"]

        # Skill Taxonomy categorized by domain
        self.skills_taxonomy: Dict[str, List[str]] = {
            "Languages": [
                "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Golang",
                "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "HTML5", "CSS",
                "CSS3", "Bash", "Shell", "Scala", "R", "Dart"
            ],
            "Frameworks & Web": [
                "React", "React.js", "Vue", "Vue.js", "Angular", "Next.js", "Nuxt.js",
                "Node.js", "Express", "Express.js", "FastAPI", "Django", "Flask",
                "Spring Boot", "ASP.NET", "Ruby on Rails", "Svelte", "Redux", "Tailwind CSS",
                "Tailwind", "Bootstrap", "GraphQL", "REST APIs", "RESTful API"
            ],
            "Databases": [
                "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Cassandra",
                "DynamoDB", "Oracle", "Elasticsearch", "Neo4j", "Firebase", "Supabase",
                "MariaDB", "Mongoose", "Prisma"
            ],
            "Cloud & DevOps": [
                "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker",
                "Kubernetes", "K8s", "Terraform", "Jenkins", "GitHub Actions", "GitLab CI",
                "CI/CD", "Ansible", "Prometheus", "Grafana", "Nginx", "Serverless",
                "Linux", "Helm", "CloudFormation"
            ],
            "AI & Data Science": [
                "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy", "Keras",
                "OpenCV", "NLP", "Computer Vision", "LLMs", "LangChain", "HuggingFace",
                "RAG", "Data Analysis", "Deep Learning", "Machine Learning", "Transformers"
            ],
            "Tools & Methodologies": [
                "Git", "GitHub", "GitLab", "Jira", "Postman", "Jest", "Cypress",
                "Pytest", "Selenium", "Vite", "Webpack", "Microservices", "Agile",
                "Scrum", "TDD", "System Design", "Distributed Systems", "Clean Code"
            ],
            "Soft Skills": [
                "Leadership", "Communication", "Problem Solving", "Teamwork",
                "Mentorship", "Project Management", "Critical Thinking",
                "Cross-functional Collaboration", "Adaptability", "Time Management"
            ],
        }

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """Extract plain text from uploaded file buffer (.pdf, .docx, .txt)."""
        ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
        ext = f".{ext}"

        if ext == ".pdf":
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_content))
                text_parts = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                return "\n".join(text_parts).strip()
            except Exception as e:
                raise ValueError(f"Failed to parse PDF document: {str(e)}")

        elif ext == ".docx":
            try:
                doc = docx.Document(io.BytesIO(file_content))
                text_parts = []
                for para in doc.paragraphs:
                    if para.text.strip():
                        text_parts.append(para.text.strip())
                for table in doc.tables:
                    for row in table.rows:
                        row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                        if row_text:
                            text_parts.append(row_text)
                return "\n".join(text_parts).strip()
            except Exception as e:
                raise ValueError(f"Failed to parse DOCX document: {str(e)}")

        elif ext in [".txt", ""]:
            for encoding in ["utf-8", "latin-1", "cp1252"]:
                try:
                    return file_content.decode(encoding).strip()
                except UnicodeDecodeError:
                    continue
            return file_content.decode("utf-8", errors="ignore").strip()

        else:
            raise ValueError(f"Unsupported file format: {ext}. Supported formats: {', '.join(self.supported_formats)}")

    def extract_contact_info(self, text: str) -> ContactInfo:
        """Extract candidate contact details using robust regex patterns."""
        # Email
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        email_match = re.search(email_pattern, text)
        email = email_match.group(0).strip() if email_match else None

        # Phone
        phone_pattern = r'(?:(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+?\d{10,14})'
        phone_match = re.search(phone_pattern, text)
        phone = phone_match.group(0).strip() if phone_match else None

        # LinkedIn
        linkedin_pattern = r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        linkedin = linkedin_match.group(0).strip() if linkedin_match else None

        # GitHub
        github_pattern = r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        github = github_match.group(0).strip() if github_match else None

        # Portfolio / Personal Website
        portfolio_pattern = r'https?:\/\/(?!www\.linkedin\.com|www\.github\.com)[a-zA-Z0-9_.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?'
        portfolio_match = re.search(portfolio_pattern, text, re.IGNORECASE)
        portfolio = portfolio_match.group(0).strip() if portfolio_match else None

        # Name heuristic: inspect first 3 non-empty lines
        name = None
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for line in lines[:3]:
            # If line doesn't contain @, http, or phone digits, and is between 2 and 4 words
            if "@" not in line and "http" not in line and not re.search(r'\d{3,}', line):
                words = line.split()
                if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                    name = line
                    break

        return ContactInfo(
            name=name,
            email=email,
            phone=phone,
            linkedin=linkedin,
            github=github,
            portfolio=portfolio,
        )

    def detect_sections(self, text: str) -> DetectedSections:
        """Check for presence of core standard resume sections."""
        lower_text = text.lower()
        
        has_summary = bool(re.search(r'\b(summary|professional summary|profile|about me|executive summary|objective)\b', lower_text))
        has_experience = bool(re.search(r'\b(experience|work experience|employment|work history|professional background)\b', lower_text))
        has_education = bool(re.search(r'\b(education|academic|qualifications|university|degrees)\b', lower_text))
        has_skills = bool(re.search(r'\b(skills|technical skills|technologies|competencies|core competencies|tools)\b', lower_text))
        has_projects = bool(re.search(r'\b(projects|personal projects|key projects|portfolio)\b', lower_text))
        has_certifications = bool(re.search(r'\b(certifications|certificates|licenses|accreditations|credentials)\b', lower_text))

        return DetectedSections(
            summary=has_summary,
            experience=has_experience,
            education=has_education,
            skills=has_skills,
            projects=has_projects,
            certifications=has_certifications,
        )

    def extract_skills(self, text: str) -> Tuple[List[ExtractedSkill], Dict[str, List[str]]]:
        """
        Extract verified technical and soft skills using category-aware pattern matching.
        Returns both a list of ExtractedSkill objects and a dictionary grouped by category.
        """
        extracted_skills: List[ExtractedSkill] = []
        skills_by_category: Dict[str, List[str]] = {}
        seen_names = set()

        for category, skill_list in self.skills_taxonomy.items():
            cat_matched = []
            for skill in skill_list:
                # Use word boundaries; short skills like "C", "R", "Go" require case-sensitive matching
                if len(skill) <= 2:
                    pattern = rf'(?<![A-Za-z0-9]){re.escape(skill)}(?![A-Za-z0-9])'
                    matches = re.findall(pattern, text)
                else:
                    pattern = rf'\b{re.escape(skill)}\b'
                    matches = re.findall(pattern, text, re.IGNORECASE)

                if matches:
                    normalized_name = skill
                    if normalized_name.lower() not in seen_names:
                        seen_names.add(normalized_name.lower())
                        cat_matched.append(normalized_name)
                        
                        # Assign confidence based on frequency
                        count = len(matches)
                        confidence = min(0.70 + (count * 0.08), 0.99)
                        
                        extracted_skills.append(
                            ExtractedSkill(
                                name=normalized_name,
                                category=category,
                                confidence=round(confidence, 2)
                            )
                        )
            if cat_matched:
                skills_by_category[category] = cat_matched

        return extracted_skills, skills_by_category
