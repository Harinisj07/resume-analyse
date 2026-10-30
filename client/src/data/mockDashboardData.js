/**
 * mockDashboardData.js
 * Comprehensive mock data structure representing the candidate's dashboard state.
 * 
 * DESIGNED FOR FUTURE BACKEND INTEGRATION:
 * This schema maps directly to expected REST responses from:
 * - GET /api/v1/resumes/active
 * - GET /api/v1/career/roadmaps/active
 * - GET /api/v1/dashboard/overview
 */

export const mockDashboardData = {
  // 1. Candidate Profile & Welcome State
  candidate: {
    id: "usr_94812a8f",
    name: "Jane Doe",
    email: "jane.doe@techdev.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "JD",
    currentTitle: "Senior Cloud Infrastructure Engineer",
    experienceYears: 7,
    location: "San Francisco, CA (Remote)",
    lastActive: "Today at 2:30 PM",
  },

  // 2. Active Resume Status
  resumeStatus: {
    id: "res_60381029",
    fileName: "Jane_Doe_Cloud_Architect_2026.pdf",
    fileSize: "328 KB",
    fileType: "application/pdf",
    lastScanned: "2 hours ago",
    scanTimestamp: "2026-09-07T17:30:00Z",
    parseStatus: "ATS Indexed & Verified",
    health: "Optimal",
    wordCount: 485,
    pageCount: 1,
    detectedSections: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      certifications: true,
      projects: true,
    },
    sectionsCoverage: 100, // percentage of standard ATS sections present
    viewUrl: "/analyzer?resumeId=res_60381029",
  },

  // 3. Resume Score (ATS Composite & Breakdown)
  resumeScore: {
    overallScore: 88,
    maxScore: 100,
    grade: "Excellent",
    percentileRank: 92, // Top 8% of applicants
    trend: +6, // +6% improvement from previous version
    status: "Strong Candidate",
    summary: "Your resume passes standard ATS parsing with high keyword density and authoritative action metrics.",
    breakdown: {
      keywords: { score: 84, weight: 30, status: "Good", description: "Matches 84% of required industry keywords" },
      formatting: { score: 95, weight: 20, status: "Excellent", description: "Standard single-column clean layout" },
      contentImpact: { score: 82, weight: 30, status: "Strong", description: "7 quantified metrics & 11 strong action verbs" },
      relevance: { score: 91, weight: 20, status: "Excellent", description: "Closely tailored to senior engineering roles" },
    },
    // Historical score trends for Recharts AreaChart
    scoreHistory: [
      { scan: "v1.0 Initial", score: 68, date: "Aug 12" },
      { scan: "v1.1 Formatted", score: 74, date: "Aug 20" },
      { scan: "v2.0 Keywords Added", score: 82, date: "Aug 30" },
      { scan: "v2.1 Metrics Polished", score: 88, date: "Sep 07" },
    ],
  },

  // 4. Career Readiness Score & Competencies
  careerReadiness: {
    score: 78,
    maxScore: 100,
    statusLabel: "Job Ready / Senior Tier",
    tier: "Level 5 - Senior Staff Path",
    estimatedTimeToGoal: "3 - 4 Weeks",
    milestonesCompleted: 5,
    milestonesTotal: 7,
    summary: "Strong foundation in infrastructure and cloud architecture. Closing knowledge in multi-cluster Kubernetes and Kafka will elevate you to top-tier Staff Architect compensation.",
    // RadarChart data comparing candidate's verified skills vs target industry benchmark
    radarCompetencies: [
      { subject: "Cloud Architecture", current: 92, benchmark: 85, fullMark: 100 },
      { subject: "DevOps & CI/CD", current: 88, benchmark: 80, fullMark: 100 },
      { subject: "System Design", current: 78, benchmark: 85, fullMark: 100 },
      { subject: "Distributed Systems", current: 72, benchmark: 82, fullMark: 100 },
      { subject: "Security & FinOps", current: 68, benchmark: 75, fullMark: 100 },
      { subject: "Engineering Leadership", current: 75, benchmark: 70, fullMark: 100 },
    ],
  },

  // 5. Target Role
  targetRole: {
    id: "role_cloud_arch",
    title: "Senior Cloud Solutions Architect",
    level: "Senior / Staff",
    industry: "Cloud Infrastructure & Distributed Systems",
    avgSalaryRange: "$165,000 - $195,000",
    openMarketRoles: "2,480+ Openings",
    marketDemand: "Very High",
    difficulty: "Advanced",
    description: "Designs, deploys, and optimizes large-scale multi-region cloud infrastructures with high availability, microservices, and automated governance.",
    availableAlternatives: [
      { id: "role_sre_lead", title: "Lead Site Reliability Engineer", matchScore: 84 },
      { id: "role_devops_architect", title: "Principal DevOps Architect", matchScore: 81 },
      { id: "role_platform_eng", title: "Staff Platform Engineer", matchScore: 86 },
    ],
  },

  // 6. Skill Match Percentage & Category Breakdown
  skillMatch: {
    overallPercentage: 82,
    matchedCount: 23,
    totalRequiredCount: 28,
    // Category-by-category breakdown for Recharts BarChart
    categories: [
      { name: "Cloud & Virtualization", matched: 95, target: 100, count: "5/5 skills" },
      { name: "DevOps & Tooling", matched: 88, target: 100, count: "7/8 skills" },
      { name: "Languages & Runtimes", matched: 85, target: 100, count: "4/5 skills" },
      { name: "Data & Storage", matched: 80, target: 100, count: "4/5 skills" },
      { name: "System Architecture", matched: 70, target: 100, count: "3/5 skills" },
    ],
  },

  // 7. Missing Skills (Gaps identified against the target role)
  missingSkills: [
    {
      id: "skill_kafka",
      name: "Apache Kafka",
      category: "Data & Event Streaming",
      importance: "Critical",
      matchBoost: "+6% Match",
      estimatedWeeks: "2 weeks",
      marketDemand: "94/100",
      description: "Distributed event store and stream-processing platform for real-time telemetry and microservices.",
    },
    {
      id: "skill_ansible",
      name: "Ansible",
      category: "Configuration Management",
      importance: "Recommended",
      matchBoost: "+4% Match",
      estimatedWeeks: "1-2 weeks",
      marketDemand: "82/100",
      description: "Agentless IT automation engine for configuration management and application deployment.",
    },
    {
      id: "skill_opentelemetry",
      name: "OpenTelemetry",
      category: "Observability",
      importance: "Recommended",
      matchBoost: "+3% Match",
      estimatedWeeks: "1 week",
      marketDemand: "88/100",
      description: "Vendor-neutral observability framework for distributed tracing and metrics aggregation.",
    },
    {
      id: "skill_finops",
      name: "FinOps & Cloud Economics",
      category: "Cost Governance",
      importance: "Optional",
      matchBoost: "+2% Match",
      estimatedWeeks: "1 week",
      marketDemand: "79/100",
      description: "Cloud financial management practices optimizing multi-account AWS/GCP spend allocation.",
    },
  ],

  // 8. High-Priority Skills (Top urgent skills needed immediately)
  highPrioritySkills: [
    {
      id: "hp_k8s_cluster",
      name: "Kubernetes Multi-Cluster (CKA)",
      priorityTag: "P0 - Critical",
      priorityLevel: 1,
      matchBoost: "+8%",
      demandScore: 98,
      status: "In Progress",
      learningStatus: "75% completed",
      reason: "Requested by 91% of Senior Cloud Architect job specifications.",
    },
    {
      id: "hp_terraform_cloud",
      name: "Terraform Cloud & Enterprise IaC",
      priorityTag: "P0 - Critical",
      priorityLevel: 1,
      matchBoost: "+7%",
      demandScore: 95,
      status: "Verified in Resume",
      learningStatus: "Active Experience",
      reason: "Essential for automated immutable infrastructure deployments.",
    },
    {
      id: "hp_kafka_streams",
      name: "Kafka Event-Driven Architecture",
      priorityTag: "P1 - High",
      priorityLevel: 2,
      matchBoost: "+6%",
      demandScore: 92,
      status: "Not Started",
      learningStatus: "Queued in Roadmap",
      reason: "Required for high-throughput distributed microservice architectures.",
    },
  ],

  // 9. Learning Roadmap Progress
  learningRoadmap: {
    overallProgress: 64,
    currentStageName: "Stage 2: Enterprise Container Orchestration & Security",
    targetCompletionDate: "October 15, 2026",
    totalEstimatedHours: 48,
    completedHours: 31,
    stages: [
      {
        id: "stg_1",
        stageNumber: 1,
        title: "Advanced Cloud Networking & VPC Peering",
        status: "completed",
        progress: 100,
        hours: "12 hrs",
        skillsCovered: ["AWS DirectConnect", "Transit Gateways", "BGP Routing"],
        description: "Mastered multi-region hub-and-spoke network topologies and secure private link peering.",
      },
      {
        id: "stg_2",
        stageNumber: 2,
        title: "Enterprise Container Orchestration & CKA Prep",
        status: "in_progress",
        progress: 75,
        hours: "16 hrs",
        skillsCovered: ["Kubernetes Multi-Cluster", "Istio Service Mesh", "Network Policies"],
        description: "Hardening production clusters, ingress controllers, RBAC, and zero-trust service meshes.",
      },
      {
        id: "stg_3",
        stageNumber: 3,
        title: "Distributed Streaming & Real-Time Event Architecture",
        status: "upcoming",
        progress: 20,
        hours: "10 hrs",
        skillsCovered: ["Apache Kafka", "Schema Registry", "Dead Letter Queues"],
        description: "Building decoupled resilient pipelines capable of millions of events per second.",
      },
      {
        id: "stg_4",
        stageNumber: 4,
        title: "System Design for 99.999% Reliability & FinOps",
        status: "upcoming",
        progress: 0,
        hours: "10 hrs",
        skillsCovered: ["Disaster Recovery", "Chaos Engineering", "AWS Cost Explorer API"],
        description: "Architectural disaster recovery patterns, chaos testing, and active cost governance.",
      },
    ],
  },

  // 10. Interview Readiness
  interviewReadiness: {
    overallScore: 76,
    maxScore: 100,
    statusText: "Strongly Competitive",
    mockInterviewsCompleted: 3,
    nextRecommendedAction: "Practice Distributed Cache & Rate Limiting System Design",
    domains: [
      { name: "System Design & Architecture", score: 84, rating: "Ready for Staff Rounds", color: "brand" },
      { name: "Technical Cloud & Kubernetes", score: 88, rating: "Expert Knowledge", color: "emerald" },
      { name: "Coding & Scripting (Python/Go)", score: 72, rating: "Review Concurrency", color: "cyan" },
      { name: "Behavioral & STAR Leadership", score: 70, rating: "Add More Failure Scenarios", color: "amber" },
    ],
    recentQuestionsPracticed: [
      { title: "Design a Global Multi-Tenant Log Aggregator", score: "9/10", date: "Yesterday" },
      { title: "Explain Kubernetes CNI vs CSI Drivers Under Load", score: "8.5/10", date: "3 days ago" },
    ],
  },

  // 11. Recent Activity Feed
  recentActivity: [
    {
      id: "act_1",
      title: "ATS Resume Scored (v2.1)",
      description: "Scored 88/100 (+6 pts) against Senior Cloud Solutions Architect criteria.",
      type: "scan",
      timestamp: "2 hours ago",
      badge: "Score Update",
      badgeVariant: "success",
    },
    {
      id: "act_2",
      title: "Target Role Selected",
      description: "Updated career target to Senior Cloud Solutions Architect ($165k-$195k).",
      type: "target_role",
      timestamp: "Yesterday, 4:15 PM",
      badge: "Career Goal",
      badgeVariant: "primary",
    },
    {
      id: "act_3",
      title: "Completed Milestone: VPC Peering & Transit Gateway",
      description: "Finished Stage 1 hands-on lab in Cloud Networking.",
      type: "milestone",
      timestamp: "Sep 05, 2026",
      badge: "Roadmap",
      badgeVariant: "cyan",
    },
    {
      id: "act_4",
      title: "Job Description Match Analysis",
      description: "Matched candidate profile against Netflix Senior SRE spec (84% fit).",
      type: "match",
      timestamp: "Sep 04, 2026",
      badge: "JD Match",
      badgeVariant: "default",
    },
    {
      id: "act_5",
      title: "Resume Uploaded",
      description: "Uploaded Jane_Doe_Cloud_Architect_2026.pdf (328 KB).",
      type: "upload",
      timestamp: "Sep 02, 2026",
      badge: "Document",
      badgeVariant: "default",
    },
  ],
};

export default mockDashboardData;
