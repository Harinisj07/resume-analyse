import mongoose from 'mongoose';
import Resume from './src/models/resume.model.js';
import axios from 'axios';

async function runNLPModuleTests() {
  console.log('=== TEST SUITE: NLP RESUME ANALYSIS MODULE ===');

  // Step 1: Connect to MongoDB
  console.log('\n--- 1. Connecting to MongoDB ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_analyzer');
  console.log('✓ Connected to MongoDB.');

  // Step 2: Test FastAPI Python Endpoint directly
  console.log('\n--- 2. Testing Python FastAPI POST /analyze-resume Endpoint ---');
  const sampleText = `
Alex Morgan
San Francisco, CA | alex.morgan@example.com | linkedin.com/in/alexmorgan-dev
PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years experience architecting cloud applications using JS, React.js, Node.js, and Mongo.
TECHNICAL SKILLS
Languages: JS, TypeScript, Python, SQL, Bash
Frameworks: React.js, Express, FastAPI, Tailwind CSS
Databases: MongoDB, Postgres, Redis
Cloud & DevOps: AWS, Docker, K8s, Terraform, GitHub Actions, CI/CD
Soft Skills: Leadership, Agile, Cross-functional Collaboration
CERTIFICATIONS
AWS Certified Solutions Architect - Associate 2023
Certified Kubernetes Administrator (CKA)
EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2018 - 2022)
GPA: 3.8/4.0
EXPERIENCE
Senior Software Engineer - Apex Cloud Systems (2022 - Present)
- Architected and scaled distributed backend microservices processing 2.5M daily requests
- Integrated automated NLP evaluation pipelines using FastAPI and Docker
PROJECTS
Cloud-Native E-Commerce Platform | React, Node.js, AWS
- High throughput transactional ordering engine with distributed lock handling
`;

  console.log('Sending sample resume text to AI service: http://localhost:8000/analyze-resume ...');
  let aiResponse;
  try {
    const res = await axios.post('http://localhost:8000/analyze-resume', {
      text: sampleText,
    }, { timeout: 15000 });
    aiResponse = res.data;
  } catch (err) {
    console.error('FastAPI error:', err.message, err.response?.data || '');
    throw err;
  }

  console.log('✓ AI Service responded with structured JSON.');
  console.log('  Keys present:', Object.keys(aiResponse));

  // Verify all 11 required keys
  const expectedKeys = [
    'skills',
    'programmingLanguages',
    'frameworks',
    'databases',
    'cloudTechnologies',
    'devopsTools',
    'certifications',
    'education',
    'projects',
    'experience',
    'softSkills',
  ];

  for (const k of expectedKeys) {
    if (!(k in aiResponse)) {
      throw new Error(`Missing expected key in AI response: ${k}`);
    }
  }
  console.log('✓ All 11 required structured keys present.');

  // Verify Normalization: "JS" -> "JavaScript"
  console.log('\n--- 3. Verifying Skill Normalization ---');
  console.log('  Programming Languages:', aiResponse.programmingLanguages);
  if (!aiResponse.programmingLanguages.includes('JavaScript')) {
    throw new Error('FAIL: "JS" was not normalized to "JavaScript"');
  }
  if (aiResponse.programmingLanguages.includes('JS')) {
    throw new Error('FAIL: Raw alias "JS" should not be present in programmingLanguages');
  }
  console.log('✓ "JS" normalized to "JavaScript" successfully.');

  // Verify "K8s" -> "Kubernetes"
  console.log('  DevOps Tools:', aiResponse.devopsTools);
  if (!aiResponse.devopsTools.includes('Kubernetes')) {
    throw new Error('FAIL: "K8s" was not normalized to "Kubernetes"');
  }
  console.log('✓ "K8s" normalized to "Kubernetes" successfully.');

  // Verify "Postgres" -> "PostgreSQL"
  console.log('  Databases:', aiResponse.databases);
  if (!aiResponse.databases.includes('PostgreSQL')) {
    throw new Error('FAIL: "Postgres" was not normalized to "PostgreSQL"');
  }
  console.log('✓ "Postgres" normalized to "PostgreSQL" successfully.');

  // Verify Education extraction
  console.log('\n--- 4. Verifying Education & Certifications ---');
  console.log('  Education count:', aiResponse.education.length);
  console.log('  Education items:', JSON.stringify(aiResponse.education, null, 2));
  if (aiResponse.education.length === 0) {
    throw new Error('FAIL: No education entries extracted.');
  }

  // Verify Certifications extraction
  console.log('  Certifications count:', aiResponse.certifications.length);
  console.log('  Certifications:', JSON.stringify(aiResponse.certifications, null, 2));
  if (aiResponse.certifications.length === 0) {
    throw new Error('FAIL: No certifications extracted.');
  }

  // Step 4: Test MongoDB Persistence of structured result
  console.log('\n--- 5. Verifying MongoDB Persistence ---');
  const testDoc = await Resume.create({
    fileName: 'alex_morgan_nlp_test.pdf',
    fileType: 'application/pdf',
    extractedText: sampleText,
    structuredAnalysis: aiResponse,
    analysisStatus: 'completed',
  });
  console.log('Saved Resume doc with ID:', testDoc._id);

  const reloaded = await Resume.findById(testDoc._id);
  if (!reloaded.structuredAnalysis || !reloaded.structuredAnalysis.programmingLanguages) {
    throw new Error('MongoDB reload failed to return structuredAnalysis');
  }
  console.log('✓ Reloaded from MongoDB successfully.');
  console.log('  DB stored skills count:', reloaded.structuredAnalysis.skills.length);
  console.log('  DB stored languages:', reloaded.structuredAnalysis.programmingLanguages);
  console.log('  DB stored databases:', reloaded.structuredAnalysis.databases);

  // Clean up test document
  await Resume.findByIdAndDelete(testDoc._id);
  await mongoose.disconnect();

  console.log('\n======================================================');
  console.log('>>> ALL NLP RESUME ANALYSIS MODULE TESTS PASSED! <<<');
  console.log('======================================================');
}

runNLPModuleTests().catch(err => {
  console.error('\n❌ NLP TEST RUNNER FAILED:', err);
  process.exit(1);
});
