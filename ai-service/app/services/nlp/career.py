"""
Dynamic Career Guidance & Roadmap Generation Module
Produces tailored learning milestones, hands-on portfolio projects, and certification tracks
based on candidate's verified skill profile and target career trajectory.
"""
from typing import List, Dict, Any
from app.schemas.career import (
    CareerRoadmapRequest,
    CareerRoadmapResponse,
    RoadmapStage,
    CertificationRecommendation,
)


class CareerGuidanceEngine:
    def __init__(self):
        # Role templates with curated milestones and certification tracks
        self.role_templates: Dict[str, Dict[str, Any]] = {
            "full stack": {
                "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "FastAPI", "MongoDB", "PostgreSQL", "Docker", "Git", "REST APIs", "CI/CD"],
                "certifications": [
                    {"name": "AWS Certified Developer - Associate", "issuer": "Amazon Web Services", "level": "Intermediate", "relevance": "Validates cloud microservices deployment"},
                    {"name": "Meta Full-Stack Engineer Certificate", "issuer": "Meta", "level": "Beginner to Intermediate", "relevance": "Industry recognized full-stack foundation"},
                ],
                "stages": [
                    {
                        "title": "Advanced Frontend Architecture & State Management",
                        "duration": "Weeks 1 - 3",
                        "objective": "Master TypeScript strict typing, modern React patterns, and client-side performance optimization.",
                        "skills": ["TypeScript", "React", "Tailwind CSS", "Redux Toolkit / Zustand"],
                        "topics": ["Component lifecycle & memoization", "Custom hooks & data fetching", "Type-safe API integrations"],
                        "project": "Real-Time Collaborative Dashboard",
                        "project_desc": "Build an ultra-responsive analytics portal with TypeScript, real-time WebSocket feeds, and data visualization."
                    },
                    {
                        "title": "Scalable Backend Microservices & API Design",
                        "duration": "Weeks 4 - 7",
                        "objective": "Architect high-throughput REST & GraphQL APIs with automated testing and database connection pooling.",
                        "skills": ["Node.js", "Express", "FastAPI", "PostgreSQL", "Redis"],
                        "topics": ["JWT authentication & RBAC", "Redis caching layer", "Database indexing & query optimization"],
                        "project": "High-Throughput E-Commerce API Gateway",
                        "project_desc": "Develop a decoupled microservices API gateway handling distributed transactions and rate limiting."
                    },
                    {
                        "title": "Containerization, Cloud Infrastructure & CI/CD",
                        "duration": "Weeks 8 - 12",
                        "objective": "Deploy production-ready workloads to cloud infrastructure using automated pipelines.",
                        "skills": ["Docker", "Kubernetes", "AWS (ECS/EKS/S3)", "GitHub Actions", "Terraform"],
                        "topics": ["Multi-stage Docker builds", "Zero-downtime rolling deployments", "Infrastructure as Code"],
                        "project": "End-to-End GitOps Deployment Pipeline",
                        "project_desc": "Automate full CI/CD deployment of a containerized application to AWS ECS with automated health checks."
                    }
                ],
                "interview_focus": [
                    "Database schema design and indexing strategies",
                    "Frontend state synchronization and rendering optimization",
                    "Designing idempotent RESTful APIs and distributed error handling",
                    "System design: Scaling to 100k concurrent users"
                ]
            },
            "ai": {
                "skills": ["Python", "PyTorch", "FastAPI", "Docker", "LangChain", "LLMs", "RAG", "Vector DBs", "HuggingFace", "PostgreSQL"],
                "certifications": [
                    {"name": "AWS Certified Machine Learning - Specialty", "issuer": "Amazon Web Services", "level": "Advanced", "relevance": "Gold standard for deploying ML models on cloud"},
                    {"name": "DeepLearning.AI Generative AI Professional", "issuer": "DeepLearning.AI", "level": "Intermediate", "relevance": "Covers LLM fine-tuning and RAG architectures"},
                ],
                "stages": [
                    {
                        "title": "Modern LLM Orchestration & Prompt Engineering",
                        "duration": "Weeks 1 - 4",
                        "objective": "Implement production-ready LLM pipelines with structured outputs and function calling.",
                        "skills": ["Python", "LangChain", "LLMs", "FastAPI"],
                        "topics": ["Prompt versioning and evaluation", "Output parsing and validation", "Async API streaming"],
                        "project": "Autonomous Research Assistant Agent",
                        "project_desc": "Build an intelligent agent capable of web search, multi-document synthesis, and formatted report output."
                    },
                    {
                        "title": "Retrieval-Augmented Generation (RAG) & Vector Databases",
                        "duration": "Weeks 5 - 8",
                        "objective": "Build hybrid retrieval systems connecting proprietary documents to language models.",
                        "skills": ["Vector DBs (Pinecone/Chroma/Qdrant)", "RAG", "Embeddings", "HuggingFace"],
                        "topics": ["Chunking strategies and semantic search", "Reranking algorithms", "Context window management"],
                        "project": "Enterprise Knowledge-Base QA Engine",
                        "project_desc": "Develop a multi-tenant vector search system with semantic reranking and provenance attribution."
                    },
                    {
                        "title": "AI Model Serving, Monitoring & Cloud Deployment",
                        "duration": "Weeks 9 - 14",
                        "objective": "Deploy high-performance inference servers with model latency monitoring and guardrails.",
                        "skills": ["Docker", "Kubernetes", "AWS / GCP", "Prometheus", "CI/CD"],
                        "topics": ["Batch inference and concurrency", "Guardrails and hallucination evaluation", "GPU resource allocation"],
                        "project": "Scalable Model Inference Microservice",
                        "project_desc": "Deploy a containerized FastAPI inference microservice on Kubernetes with auto-scaling and telemetry."
                    }
                ],
                "interview_focus": [
                    "Handling context window limits and chunking trade-offs in RAG",
                    "Evaluating LLM accuracy and reducing hallucinations",
                    "Latency vs cost trade-offs in proprietary vs open-source models",
                    "System design: Real-time semantic search over 10M documents"
                ]
            },
            "devops": {
                "skills": ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "Python", "Bash"],
                "certifications": [
                    {"name": "Certified Kubernetes Administrator (CKA)", "issuer": "CNCF / Linux Foundation", "level": "Advanced", "relevance": "Industry benchmark for Kubernetes management"},
                    {"name": "HashiCorp Certified: Terraform Associate", "issuer": "HashiCorp", "level": "Intermediate", "relevance": "Essential standard for Infrastructure-as-Code"},
                ],
                "stages": [
                    {
                        "title": "Linux Systems Internals & Production Containerization",
                        "duration": "Weeks 1 - 3",
                        "objective": "Master Linux networking, process inspection, and secure container images.",
                        "skills": ["Linux", "Bash", "Docker", "Security"],
                        "topics": ["Kernel namespaces & cgroups", "Multi-stage minimal Dockerfiles", "Container vulnerability scanning"],
                        "project": "Hardened Multi-Service Container Pod",
                        "project_desc": "Package a complex microservice architecture into distroless Docker containers with non-root security contexts."
                    },
                    {
                        "title": "Kubernetes Orchestration & Service Mesh",
                        "duration": "Weeks 4 - 8",
                        "objective": "Manage multi-node clusters, ingress controllers, persistent storage, and zero-downtime releases.",
                        "skills": ["Kubernetes", "Helm", "Nginx", "K8s RBAC"],
                        "topics": ["StatefulSets vs Deployments", "Custom Resource Definitions (CRDs)", "Network policies"],
                        "project": "Production-Grade Kubernetes Cluster Setup",
                        "project_desc": "Deploy an HA Kubernetes cluster configured with Helm charts, Ingress TLS, and dynamic volume provisioning."
                    },
                    {
                        "title": "Infrastructure-as-Code & Full Observability",
                        "duration": "Weeks 9 - 14",
                        "objective": "Automate entire cloud environments with Terraform and implement end-to-end telemetry.",
                        "skills": ["Terraform", "AWS", "Prometheus", "Grafana", "GitHub Actions"],
                        "topics": ["Terraform remote state and modules", "Metric alerting and SLOs", "Distributed tracing"],
                        "project": "Self-Healing Infrastructure with Observability Dashboard",
                        "project_desc": "Provision AWS VPC, EKS, and RDS via Terraform with an integrated Prometheus/Grafana monitoring stack."
                    }
                ],
                "interview_focus": [
                    "Kubernetes pod lifecycle and troubleshooting CrashLoopBackOff",
                    "Terraform state drift resolution and best practices",
                    "Designing multi-region disaster recovery architectures",
                    "Building resilient CI/CD pipelines with rollback capabilities"
                ]
            },
            "data science": {
                "skills": ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "PostgreSQL", "Data Visualization", "MLOps", "Statistics"],
                "certifications": [
                    {"name": "Google Professional Data Engineer", "issuer": "Google Cloud", "level": "Advanced", "relevance": "Premier credential for operationalizing enterprise data architectures"},
                    {"name": "IBM Data Science Professional Certificate", "issuer": "IBM", "level": "Intermediate", "relevance": "Comprehensive industry grounding across end-to-end data pipelines"},
                ],
                "stages": [
                    {
                        "title": "Advanced Exploratory Data Analysis & Statistical Modeling",
                        "duration": "Weeks 1 - 3",
                        "objective": "Deepen proficiency in statistical hypothesis testing, data cleaning, and feature engineering at scale.",
                        "skills": ["Python", "Pandas", "SQL", "Feature Engineering"],
                        "topics": ["Outlier detection and imputation", "Distribution tests and ANOVA", "Complex SQL window functions"],
                        "project": "End-to-End Predictive Customer Churn Engine",
                        "project_desc": "Perform multivariate analysis and build predictive ensemble models on 500k+ customer interaction records."
                    },
                    {
                        "title": "Production Machine Learning & Deep Learning Architectures",
                        "duration": "Weeks 4 - 8",
                        "objective": "Design and evaluate tree-based ensembles, neural networks, and hyperparameter tuning pipelines.",
                        "skills": ["Scikit-Learn", "PyTorch", "XGBoost", "Model Evaluation"],
                        "topics": ["Cross-validation and regularization", "ROC-AUC, Precision-Recall trade-offs", "SHAP and explainable AI"],
                        "project": "Explainable Fraud Detection Microservice",
                        "project_desc": "Deploy a calibrated classification model equipped with SHAP explanations and automated data drift detection."
                    },
                    {
                        "title": "MLOps, Feature Stores & Pipeline Automation",
                        "duration": "Weeks 9 - 14",
                        "objective": "Automate model retraining, versioning, containerized serving, and performance monitoring.",
                        "skills": ["MLflow", "Docker", "FastAPI", "Airflow", "PostgreSQL"],
                        "topics": ["Model artifact versioning", "Batch vs real-time inference", "Data quality checks & Great Expectations"],
                        "project": "Automated Continuous Training (CT) Pipeline",
                        "project_desc": "Construct an automated ML pipeline using Docker, MLflow, and FastAPI with health endpoints and drift alerts."
                    }
                ],
                "interview_focus": [
                    "Bias-variance trade-off and combating model overfitting",
                    "Handling severe class imbalance in real-world classification",
                    "Designing scalable batch vs streaming inference architectures",
                    "A/B testing methodology and statistical significance calculation"
                ]
            },
            "frontend": {
                "skills": ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Redux Toolkit", "Testing Library", "Web Performance"],
                "certifications": [
                    {"name": "Meta Front-End Developer Professional Certificate", "issuer": "Meta", "level": "Intermediate", "relevance": "Industry standard for modern client-side architectures"},
                    {"name": "Certified Web Accessibility Specialist (WAS)", "issuer": "IAAP", "level": "Advanced", "relevance": "Benchmark for enterprise WCAG 2.1 compliance and a11y"},
                ],
                "stages": [
                    {
                        "title": "Modern Component Architecture & Strict Typing",
                        "duration": "Weeks 1 - 3",
                        "objective": "Build component libraries with strict TypeScript typing, Tailwind CSS tokens, and accessibility standards.",
                        "skills": ["TypeScript", "React", "Tailwind CSS", "Accessibility (a11y)"],
                        "topics": ["Polymorphic component design", "ARIA roles and keyboard navigation", "Compound component patterns"],
                        "project": "Production-Grade Design System & Component Library",
                        "project_desc": "Publish an accessible, themeable UI design system with documentation and automated visual regression tests."
                    },
                    {
                        "title": "State Management, Server Components & Routing",
                        "duration": "Weeks 4 - 8",
                        "objective": "Master Next.js App Router, React Server Components (RSC), and robust client state orchestration.",
                        "skills": ["Next.js", "Zustand / Redux Toolkit", "React Query / TanStack Query", "REST APIs"],
                        "topics": ["Server-side rendering vs client hydration", "Optimistic UI updates & caching", "Streaming with Suspense"],
                        "project": "High-Performance Content & Analytics Portal",
                        "project_desc": "Architect a blazing-fast dashboard with SSR, incremental static regeneration (ISR), and dynamic charts."
                    },
                    {
                        "title": "Client Performance Optimization, Core Web Vitals & Testing",
                        "duration": "Weeks 9 - 12",
                        "objective": "Achieve 95+ Lighthouse scores through code splitting, image optimization, and rigorous test coverage.",
                        "skills": ["Vitest", "Testing Library", "Playwright", "Lighthouse", "Web Vitals"],
                        "topics": ["LCP, INP, CLS optimization", "Bundle analysis and tree-shaking", "Automated E2E user journeys"],
                        "project": "Enterprise Progressive Web App (PWA) with 98+ Lighthouse",
                        "project_desc": "Audit and optimize a feature-rich web app with offline capabilities, service workers, and automated test suite."
                    }
                ],
                "interview_focus": [
                    "Browser critical rendering path and DOM optimization",
                    "React Fiber architecture and reconciliation algorithms",
                    "Client-side caching strategies and stale-while-revalidate patterns",
                    "Micro-frontend architectural patterns and module federation"
                ]
            },
            "security": {
                "skills": ["Linux", "Python", "Networking", "Cryptography", "OWASP", "SIEM", "Docker", "AWS Security", "Penetration Testing", "Bash"],
                "certifications": [
                    {"name": "CompTIA Security+ (SY0-701)", "issuer": "CompTIA", "level": "Intermediate", "relevance": "Global benchmark for core cybersecurity operations"},
                    {"name": "Certified Information Systems Security Professional (CISSP)", "issuer": "ISC2", "level": "Advanced", "relevance": "Gold standard for information security management and architecture"},
                ],
                "stages": [
                    {
                        "title": "Network Security, Cryptography & Systems Hardening",
                        "duration": "Weeks 1 - 3",
                        "objective": "Deep-dive into TCP/IP protocol security, TLS handshakes, PKI infrastructure, and OS hardening.",
                        "skills": ["Linux", "Bash", "Networking", "Cryptography"],
                        "topics": ["Firewall configuration (iptables/ufw)", "Certificate management & mutual TLS (mTLS)", "Zero Trust architecture principles"],
                        "project": "Hardened Linux Gateway with Automated Auditing",
                        "project_desc": "Configure an encrypted gateway with custom iptables, CIS benchmarks compliance, and automated log forwarding."
                    },
                    {
                        "title": "Application Security & OWASP Threat Mitigation",
                        "duration": "Weeks 4 - 8",
                        "objective": "Identify, exploit, and remediate top web vulnerabilities including injection, broken auth, and SSRF.",
                        "skills": ["OWASP Top 10", "Burp Suite", "Python", "API Security"],
                        "topics": ["Static (SAST) and Dynamic (DAST) analysis", "JWT token tampering and prevention", "Secure coding best practices"],
                        "project": "Automated CI/CD DevSecOps Vulnerability Scanner",
                        "project_desc": "Build a pipeline action executing automated dependency vulnerability checks and code security scans."
                    },
                    {
                        "title": "Cloud Security, SIEM & Incident Response",
                        "duration": "Weeks 9 - 14",
                        "objective": "Manage IAM policies, cloud security posture (CSPM), SIEM log ingestion, and forensic analysis.",
                        "skills": ["AWS Security / GCP", "SIEM (Wazuh/Splunk)", "Docker", "Incident Response"],
                        "topics": ["Least privilege IAM policy generation", "Audit log correlation and alert triage", "Container security & runtime protection"],
                        "project": "Cloud Security Event Monitoring Stack",
                        "project_desc": "Deploy an automated threat detection stack streaming AWS CloudTrail / Linux syslog into an open-source SIEM."
                    }
                ],
                "interview_focus": [
                    "Remediating OWASP Top 10 vulnerabilities in modern web applications",
                    "Designing secure authentication and authorization systems (OAuth 2.0 / OIDC)",
                    "Incident response lifecycle and threat containment protocols",
                    "Defense-in-depth principles across cloud-native environments"
                ]
            }
        }

    def generate_roadmap(self, request: CareerRoadmapRequest) -> CareerRoadmapResponse:
        """Dynamically builds tailored milestones matching candidate's gaps to the target role."""
        target_role = request.target_role.strip()
        role_lower = target_role.lower()

        # Select closest matching role template
        template_key = "full stack"
        if any(k in role_lower for k in ["security", "cyber", "infosec", "pen test", "devsecops"]):
            template_key = "security"
        elif any(k in role_lower for k in ["frontend", "front end", "react", "mobile", "ios", "android", "ui/ux", "web designer"]):
            template_key = "frontend"
        elif any(k in role_lower for k in ["data science", "data scientist", "data engineer", "data analyst", "analytics", "bi developer"]):
            template_key = "data science"
        elif any(k in role_lower for k in ["ai", "machine learning", "deep learning", "llm", "nlp", "artificial intelligence", "computer vision"]):
            template_key = "ai"
        elif any(k in role_lower for k in ["devops", "cloud", "site reliability", "sre", "platform", "infrastructure", "kubernetes", "systems admin"]):
            template_key = "devops"

        template = self.role_templates[template_key]
        expected_skills = template["skills"]

        # Normalize candidate skills
        candidate_skill_set = {s.strip().lower() for s in request.current_skills}

        # Calculate overlap and critical gaps
        skills_overlap = [s for s in expected_skills if s.lower() in candidate_skill_set]
        critical_gap_skills = [s for s in expected_skills if s.lower() not in candidate_skill_set]

        # Readiness score
        total_skills = len(expected_skills)
        readiness = round((len(skills_overlap) / max(total_skills, 1)) * 100.0, 1)
        # Cap min at 25 and max at 95 to keep motivation realistic
        readiness = max(min(readiness, 95.0), 25.0)

        # Timeline estimation based on gaps
        gap_count = len(critical_gap_skills)
        if gap_count <= 2:
            timeline = "6 - 8 Weeks"
        elif gap_count <= 5:
            timeline = "10 - 14 Weeks"
        else:
            timeline = "16 - 20 Weeks"

        # Build stages with tailored gap skills injected
        stages: List[RoadmapStage] = []
        for idx, stage_data in enumerate(template["stages"]):
            # Filter skills needed for this stage that candidate is missing
            stage_skills = stage_data["skills"]
            missing_in_stage = [s for s in stage_skills if s.lower() not in candidate_skill_set]
            
            # If candidate already has all skills for this stage, mark as advanced mastery
            to_acquire = missing_in_stage if missing_in_stage else [f"Advanced {stage_skills[0]} Optimization"]

            stages.append(
                RoadmapStage(
                    stage_number=idx + 1,
                    title=stage_data["title"],
                    duration=stage_data["duration"],
                    objective=stage_data["objective"],
                    skills_to_acquire=to_acquire,
                    recommended_topics=stage_data["topics"],
                    hands_on_project=stage_data["project"],
                    project_description=stage_data["project_desc"],
                )
            )

        certifications = [
            CertificationRecommendation(
                name=c["name"],
                issuer=c["issuer"],
                level=c["level"],
                relevance=c["relevance"]
            )
            for c in template["certifications"]
        ]

        return CareerRoadmapResponse(
            status="success",
            target_role=target_role,
            readiness_score=readiness,
            skills_overlap=skills_overlap,
            critical_gap_skills=critical_gap_skills,
            estimated_timeline=timeline,
            stages=stages,
            certifications=certifications,
            interview_focus_areas=template["interview_focus"],
        )
