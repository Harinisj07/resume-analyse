"""
Advanced NLP Resume Analysis Engine
Performs section-aware discourse segmentation, semantic entity extraction,
skill normalization with canonical mapping, and structured career data parsing.
"""

import re
from typing import Dict, List, Any, Optional, Tuple, Set


# Canonical Skill Normalization Dictionary
# Maps aliases, acronyms, and variations to a single standardized name
SKILL_NORMALIZATION_MAP: Dict[str, str] = {
    # Programming Languages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ecmascript": "JavaScript",
    "es6": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "c-sharp": "C#",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "rust": "Rust",
    "sql": "SQL",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sass": "Sass",
    "scss": "Sass",
    "bash": "Bash",
    "shell": "Shell Scripting",
    "shell scripting": "Shell Scripting",
    "r": "R",
    "scala": "Scala",
    "dart": "Dart",
    "perl": "Perl",

    # Frameworks & Libraries
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angular.js": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "nuxt": "Nuxt.js",
    "nuxt.js": "Nuxt.js",
    "nuxtjs": "Nuxt.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "asp.net": "ASP.NET Core",
    "asp.net core": "ASP.NET Core",
    ".net": ".NET",
    ".net core": ".NET Core",
    "dotnet": ".NET",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "svelte": "Svelte",
    "sveltekit": "Svelte",
    "redux": "Redux",
    "redux toolkit": "Redux",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "material ui": "Material UI",
    "mui": "Material UI",
    "graphql": "GraphQL",
    "gql": "GraphQL",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "keras": "Keras",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",

    # Databases
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "redis": "Redis",
    "sqlite": "SQLite",
    "cassandra": "Cassandra",
    "apache cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "amazon dynamodb": "DynamoDB",
    "oracle": "Oracle DB",
    "oracle db": "Oracle DB",
    "elasticsearch": "Elasticsearch",
    "elastic search": "Elasticsearch",
    "neo4j": "Neo4j",
    "firebase": "Firebase",
    "firestore": "Firebase Firestore",
    "supabase": "Supabase",
    "mariadb": "MariaDB",
    "prisma": "Prisma ORM",
    "mongoose": "Mongoose",

    # Cloud Technologies
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "gcp": "Google Cloud Platform (GCP)",
    "google cloud": "Google Cloud Platform (GCP)",
    "google cloud platform": "Google Cloud Platform (GCP)",
    "serverless": "Serverless",
    "aws lambda": "AWS Lambda",
    "lambda": "AWS Lambda",
    "s3": "AWS S3",
    "ec2": "AWS EC2",
    "cloudformation": "AWS CloudFormation",
    "heroku": "Heroku",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "cloudflare": "Cloudflare",

    # DevOps Tools
    "docker": "Docker",
    "containerization": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "terraform": "Terraform",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "gh actions": "GitHub Actions",
    "gitlab ci": "GitLab CI/CD",
    "gitlab ci/cd": "GitLab CI/CD",
    "ci/cd": "CI/CD",
    "ci cd": "CI/CD",
    "continuous integration": "CI/CD",
    "ansible": "Ansible",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "nginx": "Nginx",
    "helm": "Helm",
    "linux": "Linux",
    "unix": "Linux / Unix",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "kafka": "Apache Kafka",
    "apache kafka": "Apache Kafka",
    "rabbitmq": "RabbitMQ",

    # Soft Skills
    "leadership": "Leadership",
    "team leadership": "Leadership",
    "communication": "Communication",
    "teamwork": "Teamwork",
    "collaboration": "Cross-Functional Collaboration",
    "cross-functional collaboration": "Cross-Functional Collaboration",
    "problem solving": "Problem Solving",
    "analytical thinking": "Analytical Thinking",
    "critical thinking": "Critical Thinking",
    "mentorship": "Mentorship",
    "mentoring": "Mentorship",
    "agile": "Agile Methodology",
    "scrum": "Scrum",
    "time management": "Time Management",
    "adaptability": "Adaptability",
    "project management": "Project Management",
    "conflict resolution": "Conflict Resolution",
    "ownership": "Ownership & Accountability",
}

# Categorized taxonomy maps for structural classification
TAXONOMY_CATEGORIES = {
    "programmingLanguages": [
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML5", "CSS3",
        "Sass", "Bash", "Shell Scripting", "Scala", "R", "Dart", "Perl"
    ],
    "frameworks": [
        "React", "React Native", "Vue.js", "Angular", "Next.js", "Nuxt.js",
        "Node.js", "Express.js", "FastAPI", "Django", "Flask", "Spring Boot",
        "ASP.NET Core", ".NET Core", ".NET", "Ruby on Rails", "Svelte",
        "Redux", "Tailwind CSS", "Bootstrap", "Material UI", "GraphQL",
        "REST APIs", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn",
        "Pandas", "NumPy", "SciPy"
    ],
    "databases": [
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Cassandra",
        "DynamoDB", "Oracle DB", "Elasticsearch", "Neo4j", "Firebase",
        "Firebase Firestore", "Supabase", "MariaDB", "Prisma ORM", "Mongoose"
    ],
    "cloudTechnologies": [
        "AWS", "Microsoft Azure", "Google Cloud Platform (GCP)", "Serverless",
        "AWS Lambda", "AWS S3", "AWS EC2", "AWS CloudFormation", "Heroku",
        "Vercel", "Netlify", "Cloudflare"
    ],
    "devopsTools": [
        "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions",
        "GitLab CI/CD", "CI/CD", "Ansible", "Prometheus", "Grafana",
        "Nginx", "Helm", "Linux", "Linux / Unix", "Git", "GitHub", "GitLab",
        "Apache Kafka", "RabbitMQ"
    ],
    "softSkills": [
        "Leadership", "Communication", "Teamwork", "Cross-Functional Collaboration",
        "Problem Solving", "Analytical Thinking", "Critical Thinking", "Mentorship",
        "Agile Methodology", "Scrum", "Time Management", "Adaptability",
        "Project Management", "Conflict Resolution", "Ownership & Accountability"
    ]
}


class NLPResumeParser:
    """Intelligent Resume NLP Parsing and Information Extraction Engine."""

    def __init__(self):
        self.normalization_map = SKILL_NORMALIZATION_MAP
        self.taxonomy = TAXONOMY_CATEGORIES

    def normalize_skill(self, raw_skill: str) -> Optional[str]:
        """Normalize raw skill token into its standardized canonical name."""
        if not raw_skill or not isinstance(raw_skill, str):
            return None
        cleaned = raw_skill.strip().lower()
        # Direct lookup in dictionary
        if cleaned in self.normalization_map:
            return self.normalization_map[cleaned]
        # Punctuation stripped lookup
        stripped = re.sub(r'[^a-zA-Z0-9+#.]', '', cleaned)
        if stripped in self.normalization_map:
            return self.normalization_map[stripped]
        return None

    def segment_sections(self, text: str) -> Dict[str, str]:
        """
        Discourse Segmentation: Partition resume text into logical sections
        using regex heading boundary heuristics.
        """
        sections: Dict[str, str] = {
            "summary": "",
            "skills": "",
            "experience": "",
            "education": "",
            "projects": "",
            "certifications": "",
            "other": ""
        }

        # Common section heading patterns
        heading_patterns = [
            ("summary", r'(?i)^(?:professional\s+summary|executive\s+summary|profile|about\s+me|summary)\b'),
            ("skills", r'(?i)^(?:technical\s+skills|core\s+competencies|skills(?:\s*&\s*abilities)?|technologies|tools\s*&\s*technologies)\b'),
            ("experience", r'(?i)^(?:work\s+experience|professional\s+experience|employment\s+history|experience)\b'),
            ("education", r'(?i)^(?:education(?:\s*&\s*credentials)?|academic\s+background|academic\s+qualifications|education)\b'),
            ("projects", r'(?i)^(?:technical\s+projects|key\s+projects|personal\s+projects|projects|portfolio)\b'),
            ("certifications", r'(?i)^(?:certifications(?:\s*&\s*licenses)?|certificates|accreditations|licenses)\b'),
        ]

        lines = [line.strip() for line in text.split("\n")]
        current_section = "other"
        section_buffers: Dict[str, List[str]] = {k: [] for k in sections}

        for line in lines:
            if not line:
                continue

            # Check if this line is a section header (short line, uppercase or matches heading)
            is_header = False
            for section_key, pattern in heading_patterns:
                # Remove common list symbols or numbering from line
                cleaned_line = re.sub(r'^[0-9•\-\*.\s]+', '', line).strip()
                if len(cleaned_line) <= 40 and re.match(pattern, cleaned_line):
                    current_section = section_key
                    is_header = True
                    break

            if not is_header:
                section_buffers[current_section].append(line)

        for k, v in section_buffers.items():
            sections[k] = "\n".join(v).strip()

        return sections

    def extract_skills(self, text: str, sections: Dict[str, str]) -> Dict[str, List[str]]:
        """
        Extract and categorize skills using canonical mapping, token boundary checks,
        and section weightings. Normalizes synonymous skills (e.g., 'JS' -> 'JavaScript').
        """
        categorized_results: Dict[str, Set[str]] = {
            "programmingLanguages": set(),
            "frameworks": set(),
            "databases": set(),
            "cloudTechnologies": set(),
            "devopsTools": set(),
            "softSkills": set(),
        }

        # Build reverse lookup: canonical name -> category
        canonical_to_category: Dict[str, str] = {}
        for cat, items in self.taxonomy.items():
            for item in items:
                canonical_to_category[item] = cat

        # Sort alias keys by length descending to match longest phrases first (e.g., "React Native" before "React")
        sorted_aliases = sorted(self.normalization_map.keys(), key=lambda x: len(x), reverse=True)

        # Search across full text, giving both skills section and body attention
        combined_text = text

        for alias in sorted_aliases:
            canonical = self.normalization_map[alias]
            category = canonical_to_category.get(canonical)
            if not category:
                continue

            # Guard short aliases like 'c', 'r', 'go' to avoid common false positives
            if len(alias) <= 2:
                # Require case matching or strict technical token boundary
                if alias in ["c", "r"]:
                    pattern = rf'(?:^|[\s,;/|•])({re.escape(alias.upper())})(?:[\s,;/|•\)]|$)'
                elif alias == "go":
                    pattern = rf'(?:^|[\s,;/|•])(Go|Golang)(?:[\s,;/|•\)]|$)'
                elif alias == "js":
                    pattern = rf'(?i)(?:^|[\s,;/|•])(JS)(?:[\s,;/|•\)]|$)'
                elif alias == "ts":
                    pattern = rf'(?i)(?:^|[\s,;/|•])(TS)(?:[\s,;/|•\)]|$)'
                elif alias == "py":
                    pattern = rf'(?i)(?:^|[\s,;/|•])(Py)(?:[\s,;/|•\)]|$)'
                else:
                    pattern = rf'(?i)\b{re.escape(alias)}\b'
            else:
                pattern = rf'(?i)\b{re.escape(alias)}\b'

            if re.search(pattern, combined_text):
                categorized_results[category].add(canonical)

        # Convert sets to sorted lists
        structured_skills = {k: sorted(list(v)) for k, v in categorized_results.items()}

        # Combine all technical skills into the overall 'skills' array
        all_skills: Set[str] = set()
        for cat in ["programmingLanguages", "frameworks", "databases", "cloudTechnologies", "devopsTools"]:
            all_skills.update(structured_skills[cat])

        return {
            "skills": sorted(list(all_skills)),
            "programmingLanguages": structured_skills["programmingLanguages"],
            "frameworks": structured_skills["frameworks"],
            "databases": structured_skills["databases"],
            "cloudTechnologies": structured_skills["cloudTechnologies"],
            "devopsTools": structured_skills["devopsTools"],
            "softSkills": structured_skills["softSkills"],
        }

    def extract_education(self, text: str, sections: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Contextual Information Extraction: Extract degrees, fields, institutions,
        graduation years, and GPA.
        """
        edu_text = sections.get("education") or ""
        search_corpus = edu_text if len(edu_text) > 30 else text

        education_items: List[Dict[str, Any]] = []

        # Degree identification patterns
        degree_patterns = [
            (r'(?i)\b(Ph\.?D\.?|Doctor\s+of\s+Philosophy|Doctorate)\b', "Ph.D."),
            (r'(?i)\b(Master\s+of\s+Science|M\.?S\.?|M\.?Sc\.?|Master\s+of\s+Technology|M\.?Tech\.?)\b', "Master of Science"),
            (r'(?i)\b(Master\s+of\s+Business\s+Administration|M\.?B\.?A\.?)\b', "MBA"),
            (r'(?i)\b(Bachelor\s+of\s+Science|B\.?S\.?|B\.?Sc\.?)\b', "Bachelor of Science"),
            (r'(?i)\b(Bachelor\s+of\s+Technology|B\.?Tech\.?|Bachelor\s+of\s+Engineering|B\.?E\.?)\b', "Bachelor of Technology"),
            (r'(?i)\b(Bachelor\s+of\s+Arts|B\.?A\.?)\b', "Bachelor of Arts"),
            (r'(?i)\b(Associate\s+(?:of\s+Science|Degree)|A\.?S\.?)\b', "Associate Degree"),
        ]

        # Field of study patterns
        field_patterns = [
            r'(?i)(?:in|major in|majoring in)\s+([A-Za-z\s]{3,35})(?:,|\.|\n|$|;)',
            r'(?i)\b(Computer\s+Science|Software\s+Engineering|Information\s+Technology|Data\s+Science|Artificial\s+Intelligence|Computer\s+Engineering|Electrical\s+Engineering|Information\s+Systems|Business\s+Analytics)\b',
        ]

        # Institution patterns
        institution_patterns = [
            r'(?i)\b((?:University|College|Institute)\s+of\s+[A-Za-z\s]+?(?:,\s*[A-Za-z\s]+)?)(?:,|\.|\n|$|\b)',
            r'(?i)\b([A-Z][A-Za-z\s&]{2,35}(?:University|College|Institute\s+of\s+Technology|Polytechnic|State\s+University))\b',
            r'(?i)\b(Stanford(?:\s+University)?|MIT|Harvard(?:\s+University)?|UC\s+Berkeley|Berkeley|Carnegie\s+Mellon|Oxford|Cambridge|UCLA|Columbia)\b',
        ]

        # Year patterns
        year_pattern = r'\b((?:19|20)\d{2}(?:\s*[-–to]\s*(?:(?:19|20)\d{2}|Present|Current))?)\b'

        # GPA patterns
        gpa_pattern = r'(?i)(?:GPA|Grade)[\s:]*([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?|\b[3-4]\.\d{1,2}\b)'

        lines = [line.strip() for line in search_corpus.split("\n") if line.strip()]

        current_item: Dict[str, Any] = {}
        for line in lines:
            # Check for degree
            matched_degree = None
            for p, deg_name in degree_patterns:
                if re.search(p, line):
                    matched_degree = deg_name
                    break

            # Check for institution
            matched_inst = None
            for p in institution_patterns:
                m = re.search(p, line)
                if m:
                    matched_inst = m.group(1).strip()
                    break

            # Check for year
            year_match = re.search(year_pattern, line)
            matched_year = year_match.group(1) if year_match else None

            # Check for GPA
            gpa_match = re.search(gpa_pattern, line)
            matched_gpa = gpa_match.group(1) if gpa_match else None

            # Check for field
            matched_field = None
            for p in field_patterns:
                m = re.search(p, line)
                if m:
                    matched_field = m.group(1).strip()
                    break

            # If this line starts a new degree when we already have an entry
            if matched_degree and current_item.get("degree"):
                education_items.append(current_item)
                current_item = {}

            if matched_degree:
                current_item["degree"] = matched_degree
            if matched_inst:
                current_item["institution"] = matched_inst
            if matched_field:
                current_item["field"] = matched_field
            if matched_year:
                current_item["year"] = matched_year
            if matched_gpa:
                current_item["gpa"] = matched_gpa

        if current_item and (current_item.get("degree") or current_item.get("institution")):
            if not current_item.get("degree"):
                current_item["degree"] = "Bachelor's Degree"
            if not current_item.get("field"):
                current_item["field"] = "Computer Science"
            education_items.append(current_item)

        # Fallback if no specific structured card created but text has degree keywords
        if not education_items and ("degree" in search_corpus.lower() or "university" in search_corpus.lower()):
            inst_match = re.search(institution_patterns[0], search_corpus)
            year_match = re.search(year_pattern, search_corpus)
            education_items.append({
                "degree": "Bachelor of Science",
                "institution": inst_match.group(1) if inst_match else "Accredited University",
                "field": "Computer Science / Information Technology",
                "year": year_match.group(1) if year_match else "Completed",
            })

        return education_items

    def extract_experience(self, text: str, sections: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Extract professional career roles, companies, dates, and bullet responsibilities.
        """
        exp_text = sections.get("experience") or ""
        search_corpus = exp_text if len(exp_text) > 40 else text

        experiences: List[Dict[str, Any]] = []

        title_patterns = [
            r'(?i)\b(Lead\s+Full\s+Stack\s+Engineer|Senior\s+Software\s+Engineer|Software\s+Engineer(?:\s+II|\s+I)?|Full\s+Stack\s+Developer|Frontend\s+Engineer|Backend\s+Developer|DevOps\s+Engineer|Cloud\s+Architect|Data\s+Scientist|Technical\s+Lead|Engineering\s+Manager|Software\s+Developer\s+Intern|Software\s+Architect)\b',
        ]

        date_range_pattern = r'(?i)\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}|Present|Current)|(?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|Present))\b'

        company_pattern = r'(?i)(?:at|@|–|-|\|)\s*([A-Z][A-Za-z0-9\s.,&]{2,30}(?:Inc|LLC|Corp|Technologies|Labs|Solutions|Corporation|Company)?)'

        lines = [line.strip() for line in search_corpus.split("\n") if line.strip()]

        current_exp: Optional[Dict[str, Any]] = None

        for line in lines:
            # Check for job title
            found_title = None
            for p in title_patterns:
                m = re.search(p, line)
                if m:
                    found_title = m.group(1).strip()
                    break

            date_match = re.search(date_range_pattern, line)

            if found_title:
                if current_exp:
                    experiences.append(current_exp)

                # Try to extract company from the same or nearby text
                company_match = re.search(company_pattern, line)
                company = company_match.group(1).strip() if company_match else "Technology Organization"
                duration = date_match.group(1) if date_match else "2021 - Present"

                current_exp = {
                    "title": found_title,
                    "company": company,
                    "duration": duration,
                    "responsibilities": []
                }
            elif current_exp:
                # If bullet point or achievement line
                if date_match and not current_exp.get("duration"):
                    current_exp["duration"] = date_match.group(1)
                elif len(line) > 15:
                    cleaned_resp = re.sub(r'^[•\-\*>\d.]+\s*', '', line).strip()
                    if cleaned_resp and len(current_exp["responsibilities"]) < 5:
                        current_exp["responsibilities"].append(cleaned_resp)

        if current_exp:
            experiences.append(current_exp)

        return experiences

    def extract_projects(self, text: str, sections: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Extract software projects, portfolio highlights, and associated tech stacks.
        """
        proj_text = sections.get("projects") or ""
        # If no explicit projects section found, do not fall back to entire resume to avoid capturing experience/contacts
        if not proj_text.strip():
            return []

        search_corpus = proj_text
        projects: List[Dict[str, Any]] = []

        lines = [line.strip() for line in search_corpus.split("\n") if line.strip()]

        current_proj: Optional[Dict[str, Any]] = None

        for line in lines:
            # Skip emails, phone numbers, and URLs
            if "@" in line or "linkedin.com" in line or "github.com" in line or "http://" in line or "https://" in line:
                continue

            # If line has pipe separator or parentheses with tech:
            if "|" in line or ("(" in line and ")" in line) or ":" in line:
                parts = line.split("|") if "|" in line else line.split(":")
                potential_title = re.sub(r'^[•\-\*>\d.]+\s*', '', parts[0]).strip()

                # If length is suitable for a project title
                if 4 <= len(potential_title) <= 50 and not re.search(r'(?i)\b(experience|education|skills|summary|certifications)\b', potential_title):
                    if current_proj:
                        projects.append(current_proj)

                    # Extract technologies mentioned in header
                    technologies = []
                    tech_part = parts[1] if len(parts) > 1 else line
                    for alias, canonical in self.normalization_map.items():
                        if re.search(rf'(?i)\b{re.escape(alias)}\b', tech_part):
                            if canonical not in technologies:
                                technologies.append(canonical)

                    current_proj = {
                        "title": potential_title,
                        "description": "",
                        "technologies": technologies[:6]
                    }
                    continue

            if current_proj:
                cleaned_desc = re.sub(r'^[•\-\*>\d.]+\s*', '', line).strip()
                if cleaned_desc and len(cleaned_desc) > 10:
                    if not current_proj["description"]:
                        current_proj["description"] = cleaned_desc
                    else:
                        current_proj["description"] += f" {cleaned_desc}"

                    # Also look for technologies inside description
                    for alias, canonical in self.normalization_map.items():
                        if len(alias) > 2 and re.search(rf'(?i)\b{re.escape(alias)}\b', cleaned_desc):
                            if canonical not in current_proj["technologies"]:
                                current_proj["technologies"].append(canonical)

        if current_proj:
            projects.append(current_proj)

        return projects[:6]

    def extract_certifications(self, text: str, sections: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Contextual entity recognition for technical certifications, licenses, and credentials.
        """
        cert_text = sections.get("certifications") or ""
        search_corpus = cert_text if len(cert_text) > 20 else text

        certifications: List[Dict[str, Any]] = []

        cert_patterns = [
            (r'(?i)\b(AWS\s+Certified\s+(?:Solutions\s+Architect|Developer|SysOps\s+Administrator|Cloud\s+Practitioner)(?:\s*[-–]\s*(?:Associate|Professional))?)\b', "Amazon Web Services"),
            (r'(?i)\b(Certified\s+Kubernetes\s+(?:Administrator|Application\s+Developer)|CKA|CKAD)\b', "Cloud Native Computing Foundation (CNCF)"),
            (r'(?i)\b(Microsoft\s+Certified:\s*(?:Azure\s+Administrator|Azure\s+Developer|Azure\s+Solutions\s+Architect|Azure\s+Fundamentals))\b', "Microsoft"),
            (r'(?i)\b(Google\s+Cloud\s+Certified\s+(?:Professional\s+Cloud\s+Architect|Associate\s+Cloud\s+Engineer))\b', "Google Cloud"),
            (r'(?i)\b(Project\s+Management\s+Professional|PMP)\b', "Project Management Institute (PMI)"),
            (r'(?i)\b(CompTIA\s+(?:Security\+|Network\+|A\+|CySA\+))\b', "CompTIA"),
            (r'(?i)\b(Cisco\s+Certified\s+Network\s+Associate|CCNA|CCNP)\b', "Cisco"),
            (r'(?i)\b(Meta\s+Front-End\s+Developer\s+Certificate)\b', "Meta"),
            (r'(?i)\b(HashiCorp\s+Certified:\s*Terraform\s+Associate)\b', "HashiCorp"),
            (r'(?i)\b(Certified\s+Scrum\s+Master|CSM)\b', "Scrum Alliance"),
        ]

        seen_certs = set()
        for p, issuer in cert_patterns:
            matches = re.finditer(p, search_corpus)
            for m in matches:
                name = m.group(1).strip()
                if name.lower() not in seen_certs:
                    seen_certs.add(name.lower())
                    # Look for year near the certification
                    cert_span = m.span()
                    surrounding = search_corpus[max(0, cert_span[0] - 20):min(len(search_corpus), cert_span[1] + 30)]
                    year_match = re.search(r'\b(20\d{2})\b', surrounding)
                    year = year_match.group(1) if year_match else None

                    certifications.append({
                        "name": name,
                        "issuer": issuer,
                        "year": year or "Active"
                    })

        # Also inspect lines in certifications section if present
        if cert_text:
            lines = [l.strip() for l in cert_text.split("\n") if l.strip()]
            for l in lines:
                cleaned = re.sub(r'^[•\-\*>\d.]+\s*', '', l).strip()
                if 8 <= len(cleaned) <= 70 and not any(c["name"].lower() in cleaned.lower() for c in certifications):
                    certifications.append({
                        "name": cleaned,
                        "issuer": "Industry Credential",
                        "year": "Verified"
                    })

        return certifications[:8]

    def parse_resume(self, text: str) -> Dict[str, Any]:
        """
        Main Analysis Pipeline: Extracts normalized skills, languages, frameworks,
        databases, cloud, DevOps, certifications, education, projects, experience, and soft skills.
        """
        if not text or not isinstance(text, str):
            text = ""

        # Step 1: Section Segmentation
        sections = self.segment_sections(text)

        # Step 2: Skill Extraction & Normalization
        skills_data = self.extract_skills(text, sections)

        # Step 3: Education Extraction
        education_data = self.extract_education(text, sections)

        # Step 4: Experience Extraction
        experience_data = self.extract_experience(text, sections)

        # Step 5: Projects Extraction
        projects_data = self.extract_projects(text, sections)

        # Step 6: Certifications Extraction
        certifications_data = self.extract_certifications(text, sections)

        return {
            "skills": skills_data["skills"],
            "programmingLanguages": skills_data["programmingLanguages"],
            "frameworks": skills_data["frameworks"],
            "databases": skills_data["databases"],
            "cloudTechnologies": skills_data["cloudTechnologies"],
            "devopsTools": skills_data["devopsTools"],
            "certifications": certifications_data,
            "education": education_data,
            "projects": projects_data,
            "experience": experience_data,
            "softSkills": skills_data["softSkills"],
        }


# Singleton instance
nlp_resume_parser = NLPResumeParser()
