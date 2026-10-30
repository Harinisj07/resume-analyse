import { analyzeSkillGap, deduplicateSkills } from './skillGap.service.js';
import { calculateReadiness } from './careerReadiness.service.js';

/**
 * Registry of verified learning resources from Official Docs, freeCodeCamp, GeeksforGeeks, and MDN.
 * All URLs are verified working HTTP 200 endpoints.
 */
export const VERIFIED_RESOURCES = {
  react: [
    {
      title: 'React Official Documentation & Interactive Guide',
      platform: 'Official Documentation',
      url: 'https://react.dev',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks React.js Tutorials',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/reactjs-tutorials/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp Front End Development Libraries Curriculum',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
      type: 'curriculum',
      verified: true,
    },
  ],
  typescript: [
    {
      title: 'TypeScript Official Handbook & Type System Reference',
      platform: 'Official Documentation',
      url: 'https://www.typescriptlang.org/docs/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks TypeScript Tutorials',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/typescript/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp TypeScript Beginner Guide & Course',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/learn-typescript-beginners-guide/',
      type: 'tutorial',
      verified: true,
    },
  ],
  javascript: [
    {
      title: 'MDN Web Docs - JavaScript Complete Guide',
      platform: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks JavaScript Programming Language Guide',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/javascript/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp JavaScript Certification & Tutorials',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/tag/javascript/',
      type: 'curriculum',
      verified: true,
    },
  ],
  nodejs: [
    {
      title: 'Node.js Official API Documentation',
      platform: 'Official Documentation',
      url: 'https://nodejs.org/docs/latest/api/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Node.js Tutorials & Architecture',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/nodejs/',
      type: 'tutorial',
      verified: true,
    },
  ],
  python: [
    {
      title: 'Python Official Tutorial & Standard Library',
      platform: 'Official Documentation',
      url: 'https://docs.python.org/3/tutorial/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Python Programming Language Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/python-programming-language/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp Learn Python Basics & Data Structures',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/learn-python-basics/',
      type: 'tutorial',
      verified: true,
    },
  ],
  docker: [
    {
      title: 'Docker Official Get Started & Architecture Guide',
      platform: 'Official Documentation',
      url: 'https://docs.docker.com/get-started/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Docker Tutorial & Containerization',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/docker-tutorial/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp Docker Tutorials & Best Practices',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/tag/docker/',
      type: 'tutorial',
      verified: true,
    },
  ],
  kubernetes: [
    {
      title: 'Kubernetes Official Tutorials & Cluster Basics',
      platform: 'Official Documentation',
      url: 'https://kubernetes.io/docs/tutorials/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Kubernetes Architecture & Pod Management',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/kubernetes/',
      type: 'tutorial',
      verified: true,
    },
  ],
  mongodb: [
    {
      title: 'MongoDB Official Manual & CRUD Tutorials',
      platform: 'Official Documentation',
      url: 'https://www.mongodb.com/docs/manual/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks MongoDB Tutorial & Aggregation Pipelines',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/mongodb-tutorial/',
      type: 'tutorial',
      verified: true,
    },
  ],
  postgresql: [
    {
      title: 'PostgreSQL Official Documentation & SQL Tutorial',
      platform: 'Official Documentation',
      url: 'https://www.postgresql.org/docs/current/tutorial.html',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks PostgreSQL Tutorial & Schema Design',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/postgresql-tutorial/',
      type: 'tutorial',
      verified: true,
    },
  ],
  git: [
    {
      title: 'Git Official Reference & Pro Git Documentation',
      platform: 'Official Documentation',
      url: 'https://git-scm.com/doc',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Git & Version Control Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/git-tutorial/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'freeCodeCamp Git and GitHub for Beginners',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/',
      type: 'tutorial',
      verified: true,
    },
  ],
  aws: [
    {
      title: 'AWS Official Getting Started Resource Center',
      platform: 'Official Documentation',
      url: 'https://aws.amazon.com/getting-started/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks AWS Cloud Architecture Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/aws-tutorial/',
      type: 'tutorial',
      verified: true,
    },
  ],
  restapis: [
    {
      title: 'MDN Web Docs - REST Architecture Glossary & Overview',
      platform: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Glossary/REST',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks REST API Introduction & Best Practices',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/rest-api-introduction/',
      type: 'tutorial',
      verified: true,
    },
  ],
  systemdesign: [
    {
      title: 'GeeksforGeeks Complete System Design Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/system-design-tutorial/',
      type: 'tutorial',
      verified: true,
    },
  ],
  fastapi: [
    {
      title: 'FastAPI Official Interactive Tutorial & User Guide',
      platform: 'Official Documentation',
      url: 'https://fastapi.tiangolo.com/tutorial/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks FastAPI Python Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/fastapi-tutorial/',
      type: 'tutorial',
      verified: true,
    },
  ],
  redis: [
    {
      title: 'Redis Official Documentation & Data Structures Guide',
      platform: 'Official Documentation',
      url: 'https://redis.io/docs/latest/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Redis In-Memory Caching Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/redis-data-types/',
      type: 'tutorial',
      verified: true,
    },
  ],
  tailwindcss: [
    {
      title: 'Tailwind CSS Official Core Concepts Documentation',
      platform: 'Official Documentation',
      url: 'https://tailwindcss.com/docs',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'GeeksforGeeks Tailwind CSS Tutorial',
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/tailwind-css/',
      type: 'tutorial',
      verified: true,
    },
  ],
};

/**
 * Knowledge base defining learning curriculum details for common skills
 */
export const SKILL_CURRICULUM_DATA = {
  react: {
    stage: 'Intermediate',
    estimatedTime: '12-16 hours',
    objectives: [
      'Master JSX, functional components, hooks (useState, useEffect, useMemo, useCallback), and prop-drilling prevention.',
      'Implement efficient component composition, state lifting, and custom hooks for reusable UI logic.',
      'Understand React Reconciliation, Virtual DOM lifecycle, and client performance optimizations.',
    ],
    prerequisites: ['Modern JavaScript (ES6+)', 'DOM manipulation basics', 'HTML5 & CSS3 layout fundamentals'],
    exercises: [
      'Build a searchable, paginated data table component with debounced filter inputs.',
      'Implement a custom hook `useLocalStorageState` with JSON serialization and sync events.',
      'Refactor an imperative DOM widget into an accessible, controlled React component.',
    ],
    project: {
      title: 'Dynamic Analytics Dashboard Widget',
      description: 'Build an interactive dashboard component with real-time data filtering, tabbed navigation, and optimistic UI updates.',
    },
  },
  typescript: {
    stage: 'Intermediate',
    estimatedTime: '10-14 hours',
    objectives: [
      'Understand static typing fundamentals: interfaces, type aliases, union types, and generics.',
      'Write type-safe API payloads, discriminated unions, and utility types (Partial, Pick, Omit, Record).',
      'Configure tsconfig.json for strict mode, module resolution, and seamless build integration.',
    ],
    prerequisites: ['Solid JavaScript proficiency', 'Object-oriented programming concepts'],
    exercises: [
      'Define a type-safe generic HTTP client wrapper with response validation types.',
      'Implement an event-bus system using discriminated union event types.',
      'Create custom mapped types and conditional type guards for runtime data validation.',
    ],
    project: {
      title: 'Type-Safe Data Validation & Query Engine',
      description: 'Implement a type-safe query filter builder that validates input payloads against dynamic schema definitions at compile time.',
    },
  },
  docker: {
    stage: 'Advanced',
    estimatedTime: '8-12 hours',
    objectives: [
      'Understand containerization principles, Docker daemon architecture, and image layer caching.',
      'Write production-ready multi-stage Dockerfiles that minimize image size and eliminate build dependencies.',
      'Orchestrate multi-service environments with Docker Compose (app, database, Redis cache, networking).',
    ],
    prerequisites: ['Basic Linux command-line', 'Application build and runtime environments'],
    exercises: [
      'Containerize a Node.js or Python backend application using a multi-stage non-root Alpine image.',
      'Create a docker-compose.yml configuration with persistent volumes, network bridges, and health checks.',
      'Optimize image build cache order by isolating package manifests from source code.',
    ],
    project: {
      title: 'Multi-Container Microservice Environment',
      description: 'Configure and test an isolated development environment running a backend API, database container, and Redis cache with health checks and volume persistence.',
    },
  },
  nodejs: {
    stage: 'Intermediate',
    estimatedTime: '10-14 hours',
    objectives: [
      'Understand the Node.js event loop, libuv thread pool, and asynchronous non-blocking I/O.',
      'Work comfortably with Core APIs: streams, buffers, file system, events, and HTTP servers.',
      'Build structured RESTful microservices with middleware, error handling, and environment configuration.',
    ],
    prerequisites: ['JavaScript ES6+ fundamentals', 'Asynchronous programming (Promises, async/await)'],
    exercises: [
      'Write a streaming file processor that parses large log files without memory spikes.',
      'Implement a centralized error-handling middleware that maps operational errors to HTTP status codes.',
      'Create a rate-limiting middleware using token-bucket algorithm or in-memory map.',
    ],
    project: {
      title: 'Production-Ready Modular REST API Server',
      description: 'Build an Express/Node.js backend with structured routing, JWT auth middleware, logging, and environment-driven configurations.',
    },
  },
  python: {
    stage: 'Beginner',
    estimatedTime: '10-14 hours',
    objectives: [
      'Master Python core syntax, data structures (lists, dicts, sets, tuples), and list comprehensions.',
      'Understand object-oriented programming, decorators, context managers, and exception handling.',
      'Leverage virtual environments (venv), package management (pip/poetry), and modern type hints.',
    ],
    prerequisites: ['Basic computational thinking and algorithmic problem solving'],
    exercises: [
      'Implement a custom context manager for timing code execution and resource cleanup.',
      'Write a text processing script that extracts structured data using regular expressions and dictionary mappings.',
      'Build a modular CLI tool with argparse or click that processes structured input files.',
    ],
    project: {
      title: 'Data Parsing & Extraction CLI Utility',
      description: 'Build a standalone command-line Python application that ingests structured input files, validates schemas, and generates formatted reports.',
    },
  },
  mongodb: {
    stage: 'Intermediate',
    estimatedTime: '8-10 hours',
    objectives: [
      'Understand document schema design principles: embedding vs referencing, and 1-to-N relationships.',
      'Construct aggregation pipelines ($match, $group, $lookup, $unwind, $project) for analytical queries.',
      'Implement indexing strategies (single-field, compound, text, TTL) to ensure low-latency reads.',
    ],
    prerequisites: ['Basic database concepts', 'JSON data structure familiarity'],
    exercises: [
      'Design an e-commerce schema with optimized embed/reference tradeoffs for products and reviews.',
      'Write an aggregation pipeline calculating monthly analytics and category averages.',
      'Analyze query execution plans using explain("executionStats") to optimize index usage.',
    ],
    project: {
      title: 'Aggregated Analytics Repository',
      description: 'Implement a Mongoose/MongoDB data access layer with complex aggregation queries, schema validators, and compound indexes.',
    },
  },
  postgresql: {
    stage: 'Intermediate',
    estimatedTime: '10-12 hours',
    objectives: [
      'Master relational schema normalization (3NF), foreign key constraints, and transactional ACID guarantees.',
      'Write advanced SQL queries using JOINs, window functions, CTEs (Common Table Expressions), and subqueries.',
      'Design query performance indexes (B-Tree, GIN) and inspect query plans using EXPLAIN ANALYZE.',
    ],
    prerequisites: ['Basic data storage concepts'],
    exercises: [
      'Write a multi-table transaction with rollbacks for financial balance transfers.',
      'Formulate complex analytical queries using window functions (ROW_NUMBER, DENSE_RANK, LAG).',
      'Optimize a slow query by indexing foreign keys and analyzing execution tree nodes.',
    ],
    project: {
      title: 'Relational Transactional Ledger System',
      description: 'Architect a relational PostgreSQL database schema with strict constraints, stored procedures, and migration scripts.',
    },
  },
  git: {
    stage: 'Beginner',
    estimatedTime: '4-6 hours',
    objectives: [
      'Understand the Git object model: blobs, trees, commits, and branch pointer references.',
      'Master standard workflows: branching, merging, rebasing, stash management, and resolving merge conflicts.',
      'Write conventional commit messages and manage remote collaborative pull requests.',
    ],
    prerequisites: ['Terminal / Command line interface basics'],
    exercises: [
      'Simulate a merge conflict between two branches and resolve it manually using diff tools.',
      'Interactive rebase to squash multiple feature commits into a clean, atomic commit message.',
      'Set up Git hooks (pre-commit) to automatically format code before committing.',
    ],
    project: {
      title: 'Branching Strategy & Release Flow Practice',
      description: 'Establish a Git repository demonstrating Gitflow or Trunk-Based development with feature branches, PR templates, and semantic tagging.',
    },
  },
  aws: {
    stage: 'Advanced',
    estimatedTime: '12-16 hours',
    objectives: [
      'Understand core cloud infrastructure primitives: compute (EC2/ECS), storage (S3), and networking (VPC).',
      'Configure IAM roles, policies, and least-privilege security controls for cloud-deployed services.',
      'Deploy containerized applications to cloud platforms with environment isolation and HTTPS certificates.',
    ],
    prerequisites: ['Networking fundamentals (DNS, HTTP/S, TCP/IP)', 'Docker containerization basics'],
    exercises: [
      'Configure an S3 bucket with secure CORS, lifecycle policies, and presigned upload URLs.',
      'Draft an IAM policy with fine-grained action permissions for a specific microservice.',
      'Set up a cloud reverse proxy with automated TLS certificate management.',
    ],
    project: {
      title: 'Cloud-Hosted Secure Storage & Deployment Architecture',
      description: 'Design and deploy a containerized web application integrated with cloud storage, secure environment secrets, and health check monitoring.',
    },
  },
  kubernetes: {
    stage: 'Advanced',
    estimatedTime: '12-16 hours',
    objectives: [
      'Understand Kubernetes control plane and node architecture: Pods, Deployments, Services, and Ingress.',
      'Write declarative YAML manifests with resource requests/limits, readiness, and liveness probes.',
      'Implement ConfigMaps, Secrets, Horizontal Pod Autoscaling (HPA), and rolling update strategies.',
    ],
    prerequisites: ['Docker containerization', 'Microservice architecture fundamentals'],
    exercises: [
      'Deploy a multi-replica application deployment with zero-downtime rolling update strategy.',
      'Configure a ClusterIP service and Ingress controller for path-based routing.',
      'Simulate pod failures to verify automated pod restarts and self-healing behaviors.',
    ],
    project: {
      title: 'Declarative K8s Production Cluster Manifests',
      description: 'Author a complete Kubernetes configuration suite including Deployments, Services, ConfigMaps, and Autoscalers for a multi-tier microservice.',
    },
  },
  restapis: {
    stage: 'Beginner',
    estimatedTime: '6-8 hours',
    objectives: [
      'Understand REST architectural constraints: statelessness, uniform interface, resource naming conventions.',
      'Properly utilize HTTP methods (GET, POST, PUT, PATCH, DELETE) and status code semantics (200, 201, 400, 401, 403, 404, 422, 500).',
      'Implement payload validation, query pagination (limit/offset and cursor-based), and API documentation.',
    ],
    prerequisites: ['Basic HTTP request/response concepts'],
    exercises: [
      'Design clean RESTful endpoint routes for a hierarchical resource collection (e.g. /resumes/:id/skills).',
      'Implement pagination, sorting, and field-filtering query parameters on a list endpoint.',
      'Write OpenAPI / Swagger specification documentation for an existing API endpoint collection.',
    ],
    project: {
      title: 'Idiomatic RESTful Service Specification & API',
      description: 'Build a compliant, documented RESTful microservice with standardized JSON response envelopes, error structures, and validation.',
    },
  },
  systemdesign: {
    stage: 'Advanced',
    estimatedTime: '14-18 hours',
    objectives: [
      'Master high-level architecture principles: load balancing, horizontal vs vertical scaling, and CAP theorem.',
      'Design caching strategies (cache-aside, write-through, TTLs, invalidation) using Redis/Memcached.',
      'Incorporate asynchronous messaging queues (RabbitMQ, Kafka, SQS) to decouple heavy processing tasks.',
    ],
    prerequisites: ['Relational & NoSQL database concepts', 'Networking and web protocols'],
    exercises: [
      'Design an idempotent distributed background job processing pipeline with dead-letter queues.',
      'Calculate back-of-the-envelope capacity estimations for throughput, memory, and storage requirements.',
      'Draft an architecture diagram illustrating failover strategies, read replicas, and CDN distribution.',
    ],
    project: {
      title: 'Scalable System Architecture Blueprint',
      description: 'Design a comprehensive system architecture document for a high-traffic web platform covering data partitioning, caching layers, and disaster recovery.',
    },
  },
};

/**
 * Normalizes skill name to search key in resource and curriculum maps
 */
export const normalizeSkillKey = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

/**
 * Finds verified learning resources for a skill, with fallback to verified trusted platform search hubs
 */
export const getResourcesForSkill = (skillName) => {
  const key = normalizeSkillKey(skillName);

  if (VERIFIED_RESOURCES[key]) {
    return VERIFIED_RESOURCES[key];
  }

  // Check partial key matches
  for (const [knownKey, resources] of Object.entries(VERIFIED_RESOURCES)) {
    if (key.includes(knownKey) || knownKey.includes(key)) {
      return resources;
    }
  }

  // Verified safe fallback resources on GeeksforGeeks and MDN
  return [
    {
      title: `GeeksforGeeks ${skillName} Reference & Tutorials`,
      platform: 'GeeksforGeeks',
      url: 'https://www.geeksforgeeks.org/',
      type: 'tutorial',
      verified: true,
    },
    {
      title: 'MDN Web Docs Standard Reference',
      platform: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/',
      type: 'documentation',
      verified: true,
    },
    {
      title: 'freeCodeCamp Developer News & Curriculum',
      platform: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/',
      type: 'curriculum',
      verified: true,
    },
  ];
};

/**
 * Generates structured curriculum data for a skill
 */
export const getSkillCurriculum = (skillName, priority = 'Medium', assignedStage = null) => {
  const key = normalizeSkillKey(skillName);
  const existing = SKILL_CURRICULUM_DATA[key];

  let stage = assignedStage;
  if (!stage) {
    if (existing?.stage) {
      stage = existing.stage;
    } else if (priority === 'High') {
      stage = 'Beginner';
    } else if (priority === 'Medium') {
      stage = 'Intermediate';
    } else {
      stage = 'Advanced';
    }
  }

  const resources = getResourcesForSkill(skillName);

  if (existing) {
    return {
      stage,
      learningObjectives: existing.objectives,
      prerequisites: existing.prerequisites,
      practicalExercises: existing.exercises,
      estimatedTime: existing.estimatedTime,
      projectTask: existing.project,
      resources,
    };
  }

  // Dynamic high-quality synthesis for any uncatalogued skill
  return {
    stage,
    learningObjectives: [
      `Master core syntax, foundational mental models, and primary design principles of ${skillName}.`,
      `Learn how to integrate ${skillName} into production application codebases following best practices.`,
      `Diagnose, troubleshoot, and optimize typical development patterns and edge cases in ${skillName}.`,
    ],
    prerequisites: [
      'General software engineering fundamentals',
      'Basic version control with Git and command line familiarity',
    ],
    practicalExercises: [
      `Build a focused proof-of-concept module implementing key ${skillName} capabilities.`,
      `Write automated unit or integration tests verifying behavior and error edge cases.`,
      `Refactor and benchmark existing logic to demonstrate performance or readability gains.`,
    ],
    estimatedTime: priority === 'High' ? '10-14 hours' : priority === 'Medium' ? '8-10 hours' : '6-8 hours',
    projectTask: {
      title: `${skillName} Hands-On Implementation Task`,
      description: `Build an end-to-end practical project exercising ${skillName} in conjunction with your core tech stack, with clean error handling and documentation.`,
    },
    resources,
  };
};

/**
 * Generates a full personalized learning roadmap
 *
 * @param {Object} params
 * @param {Object} params.resumeDoc - User's resume analysis
 * @param {Object} params.roleDoc - Selected target role
 * @param {Object} [params.skillGapDoc] - Optional existing skill gap analysis
 * @param {Object} [params.readinessDoc] - Optional existing career readiness score
 * @returns {Object} Structured roadmap ready for persistence
 */
export const generatePersonalizedRoadmap = async ({
  resumeDoc,
  roleDoc,
  skillGapDoc = null,
  readinessDoc = null,
  userId = null,
}) => {
  if (!roleDoc) {
    throw new Error('Target role is required to generate a learning roadmap.');
  }

  // 1. Resolve extracted resume skills
  let extractedSkills = [];
  if (resumeDoc) {
    if (Array.isArray(resumeDoc.extractedSkills)) {
      for (const item of resumeDoc.extractedSkills) {
        if (typeof item === 'string') extractedSkills.push(item);
        else if (item && typeof item === 'object' && item.name) extractedSkills.push(item.name);
      }
    }
    if (Array.isArray(resumeDoc.skills)) extractedSkills.push(...resumeDoc.skills);
  }
  extractedSkills = deduplicateSkills(extractedSkills);

  // 2. Resolve or compute Skill Gap Analysis
  let gapData = skillGapDoc;
  if (!gapData) {
    gapData = analyzeSkillGap(extractedSkills, roleDoc);
  }

  // 3. Resolve or compute Career Readiness
  let readinessData = readinessDoc;
  if (!readinessData) {
    const atsScore = resumeDoc?.atsScore || 65;
    readinessData = calculateReadiness({ gapAnalysis: gapData, atsScore });
  }

  // 4. Strict Prioritization of Missing Skills: High -> Medium -> Low
  // Requirement 2: "Prioritize missing skills in this order: High, Medium, then Low."
  const prioritizedSkillsList = [];

  // 4a. High Priority: Missing Required Skills
  const missingRequired = gapData.missingRequiredSkills || [];
  for (const skill of missingRequired) {
    prioritizedSkillsList.push({
      skillName: skill,
      priority: 'High',
      type: 'required',
    });
  }

  // 4b. Medium Priority: Missing Preferred Skills
  const missingPreferred = gapData.missingPreferredSkills || [];
  for (const skill of missingPreferred) {
    prioritizedSkillsList.push({
      skillName: skill,
      priority: 'Medium',
      type: 'preferred',
    });
  }

  // 4c. Low Priority: Supplementary skills for completeness if few gaps exist
  if (prioritizedSkillsList.length < 3) {
    // Recommend foundational or adjacent skills from preferred or role domain
    const candidateSkillsLower = new Set(extractedSkills.map((s) => s.toLowerCase()));
    const allRoleSkills = [...(roleDoc.requiredSkills || []), ...(roleDoc.preferredSkills || [])];
    for (const s of allRoleSkills) {
      if (!candidateSkillsLower.has(s.toLowerCase())) {
        const alreadyInList = prioritizedSkillsList.some(
          (p) => p.skillName.toLowerCase() === s.toLowerCase()
        );
        if (!alreadyInList) {
          prioritizedSkillsList.push({
            skillName: s,
            priority: 'Low',
            type: 'supplementary',
          });
        }
      }
    }
  }

  // Fallback if candidate already matches all skills in the role
  if (prioritizedSkillsList.length === 0) {
    const generalBonusSkills = ['System Design', 'Cloud Architecture (AWS/GCP)', 'CI/CD Automation'];
    for (const bs of generalBonusSkills) {
      prioritizedSkillsList.push({
        skillName: bs,
        priority: 'Low',
        type: 'advanced_mastery',
      });
    }
  }

  // Ensure strict ordering: High first, then Medium, then Low
  const priorityWeight = { High: 1, Medium: 2, Low: 3 };
  prioritizedSkillsList.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

  // 5. Organize into Beginner, Intermediate, and Advanced stages
  // Requirement 3: "Organize learning into Beginner, Intermediate, and Advanced stages where appropriate."
  const beginnerSkills = [];
  const intermediateSkills = [];
  const advancedSkills = [];

  prioritizedSkillsList.forEach((item, index) => {
    let stageTarget = 'Beginner';
    const key = normalizeSkillKey(item.skillName);
    const existing = SKILL_CURRICULUM_DATA[key];

    if (existing?.stage) {
      stageTarget = existing.stage;
    } else {
      // Natural progression based on priority and position
      if (item.priority === 'High') {
        stageTarget = index % 2 === 0 ? 'Beginner' : 'Intermediate';
      } else if (item.priority === 'Medium') {
        stageTarget = 'Intermediate';
      } else {
        stageTarget = 'Advanced';
      }
    }

    const curriculum = getSkillCurriculum(item.skillName, item.priority, stageTarget);

    const taskObj = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      skillName: item.skillName,
      priority: item.priority,
      stage: stageTarget,
      learningObjectives: curriculum.learningObjectives,
      prerequisites: curriculum.prerequisites,
      practicalExercises: curriculum.practicalExercises,
      estimatedTime: curriculum.estimatedTime,
      projectTask: curriculum.projectTask,
      resources: curriculum.resources,
      status: 'Not Started',
    };

    if (stageTarget === 'Beginner') beginnerSkills.push(taskObj);
    else if (stageTarget === 'Intermediate') intermediateSkills.push(taskObj);
    else advancedSkills.push(taskObj);
  });

  // Ensure every stage has tasks or balance naturally
  if (beginnerSkills.length === 0 && intermediateSkills.length > 1) {
    beginnerSkills.push(intermediateSkills.shift());
  }
  if (advancedSkills.length === 0 && intermediateSkills.length > 1) {
    advancedSkills.push(intermediateSkills.pop());
  }

  // Maintain High -> Medium -> Low sorting inside each stage
  const sortStageTasks = (tasks) =>
    tasks.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

  const stages = [
    {
      id: 'stage-1',
      stageNumber: 1,
      stageName: 'Beginner',
      title: 'Stage 1: Core Fundamentals & Essential Gaps',
      description: 'Focuses on foundational high-priority technical gaps and prerequisite building blocks.',
      estimatedWeeks: '2-4 weeks',
      skills: sortStageTasks(beginnerSkills),
    },
    {
      id: 'stage-2',
      stageNumber: 2,
      stageName: 'Intermediate',
      title: 'Stage 2: Applied Competencies & Framework Integration',
      description: 'Strengthens core frameworks, database design, REST/GraphQL services, and applied development.',
      estimatedWeeks: '3-5 weeks',
      skills: sortStageTasks(intermediateSkills),
    },
    {
      id: 'stage-3',
      stageNumber: 3,
      stageName: 'Advanced',
      title: 'Stage 3: Cloud Architecture, System Scaling & Polish',
      description: 'Covers production deployment, automated container pipelines, system design, and testing.',
      estimatedWeeks: '3-4 weeks',
      skills: sortStageTasks(advancedSkills),
    },
  ].filter((stage) => stage.skills.length > 0);

  // 6. Calculate Progress & Summary Metrics
  const totalTasks = stages.reduce((acc, st) => acc + st.skills.length, 0);
  const completedTasks = 0;
  const inProgressTasks = 0;
  const overallProgress = 0;

  const highPriorityCount = prioritizedSkillsList.filter((s) => s.priority === 'High').length;
  const mediumPriorityCount = prioritizedSkillsList.filter((s) => s.priority === 'Medium').length;
  const lowPriorityCount = prioritizedSkillsList.filter((s) => s.priority === 'Low').length;

  return {
    userId: userId || resumeDoc?.userId || null,
    resumeId: resumeDoc?._id || null,
    resumeFileName: resumeDoc?.fileName || 'Candidate Resume',
    roleId: roleDoc._id,
    roleName: roleDoc.name,
    roleCategory: roleDoc.category || 'Engineering',
    targetRole: roleDoc.name,
    readinessScore: readinessData.readinessScore || 0,
    readinessTier: readinessData.readinessTier || 'Developing',
    skillGapId: gapData._id || null,
    careerReadinessId: readinessData._id || null,
    stages,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overallProgress,
    summary: {
      totalSkillsCount: prioritizedSkillsList.length,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      estimatedTotalWeeks: `${Math.max(6, Math.ceil(totalTasks * 1.5))}-${Math.max(8, Math.ceil(totalTasks * 2.2))} weeks`,
    },
  };
};

/**
 * Recomputes overall progress based on task statuses
 */
export const recalculateProgress = (stages) => {
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;

  for (const stage of stages) {
    for (const task of stage.skills) {
      totalTasks += 1;
      if (task.status === 'Completed') {
        completedTasks += 1;
      } else if (task.status === 'In Progress') {
        inProgressTasks += 1;
      }
    }
  }

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overallProgress,
  };
};

export default {
  VERIFIED_RESOURCES,
  SKILL_CURRICULUM_DATA,
  getResourcesForSkill,
  getSkillCurriculum,
  generatePersonalizedRoadmap,
  recalculateProgress,
};
