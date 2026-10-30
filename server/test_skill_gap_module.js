import axios from 'axios';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Role from './src/models/role.model.js';
import Resume from './src/models/resume.model.js';
import SkillGapAnalysis from './src/models/skillGapAnalysis.model.js';
import {
  deduplicateSkills,
  isSkillMatch,
  analyzeSkillGap,
} from './src/services/skillGap.service.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('   SKILL GAP ANALYSIS MODULE - TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  };

  await connectDB();

  // TEST 1: Deduplication of skills
  console.log('1. Testing Skill Deduplication...');
  const dirtySkills = [
    'React',
    'react',
    'REACT',
    ' Node.js ',
    'node.js',
    'Docker',
    '',
    null,
    { name: 'Docker' },
    { name: 'Python' },
    'Python',
  ];
  const cleaned = deduplicateSkills(dirtySkills);
  assert(
    cleaned.length === 4 &&
      cleaned.includes('React') &&
      cleaned.includes('Node.js') &&
      cleaned.includes('Docker') &&
      cleaned.includes('Python'),
    `Deduplicated ${dirtySkills.length} items down to ${cleaned.length} unique skills: [${cleaned.join(', ')}]`
  );

  // TEST 2: Skill Matching Logic
  console.log('\n2. Testing Skill Matching Logic...');
  assert(isSkillMatch('React.js', 'React') === true, 'React.js matches React');
  assert(isSkillMatch('Python 3', 'Python') === true, 'Python 3 matches Python');
  assert(isSkillMatch('Node.js', 'Node.js / Express') === true, 'Node.js matches Node.js / Express');
  assert(isSkillMatch('Rust', 'Python') === false, 'Rust does not match Python');

  // TEST 3: Core Service Gap Analysis & Transparent Percentage Calculation
  console.log('\n3. Testing Gap Analysis & Transparent Percentage Calculation...');
  const mockRole = {
    name: 'Full Stack Developer',
    category: 'Full Stack Development',
    requiredSkills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'HTML5/CSS3',
      'RESTful APIs',
      'SQL / Relational DBs',
      'Git',
    ], // 8 required skills
    preferredSkills: [
      'GraphQL',
      'Docker',
      'Next.js',
      'MongoDB / NoSQL',
    ], // 4 preferred skills
  };

  // Candidate with 4 of 8 required skills, and 2 of 4 preferred skills
  const mockCandidateSkills = ['JavaScript', 'React', 'Node.js', 'Git', 'Docker', 'GraphQL'];
  const serviceResult = analyzeSkillGap(mockCandidateSkills, mockRole);

  assert(
    serviceResult.matchedRequiredSkills.length === 4,
    `Matched required count is 4: [${serviceResult.matchedRequiredSkills.join(', ')}]`
  );
  assert(
    serviceResult.missingRequiredSkills.length === 4,
    `Missing required count is 4: [${serviceResult.missingRequiredSkills.join(', ')}]`
  );
  assert(
    serviceResult.matchedPreferredSkills.length === 2,
    `Matched preferred count is 2: [${serviceResult.matchedPreferredSkills.join(', ')}]`
  );
  assert(
    serviceResult.missingPreferredSkills.length === 2,
    `Missing preferred count is 2: [${serviceResult.missingPreferredSkills.join(', ')}]`
  );

  // Expected weighted formula:
  // (4 req * 2 + 2 pref * 1) / (8 req * 2 + 4 pref * 1) = (8 + 2) / (16 + 4) = 10 / 20 = 50%
  assert(
    serviceResult.matchPercentage === 50,
    `Calculated transparent percentage is 50%: ${serviceResult.matchPercentage}% (Formula: ${serviceResult.formulaBreakdown.calculationText})`
  );

  // TEST 4: Priority Categorization (High, Medium, Low)
  console.log('\n4. Testing Priority Categorization...');
  const highGaps = serviceResult.skillGaps.filter((g) => g.priority === 'High');
  const mediumGaps = serviceResult.skillGaps.filter((g) => g.priority === 'Medium');
  const lowGaps = serviceResult.skillGaps.filter((g) => g.priority === 'Low');

  assert(highGaps.length > 0, `Identified ${highGaps.length} High priority gaps`);
  assert(mediumGaps.length > 0, `Identified ${mediumGaps.length} Medium priority gaps`);
  assert(lowGaps.length > 0, `Identified ${lowGaps.length} Low priority gaps`);
  assert(
    serviceResult.skillGaps.length === 6,
    `Total categorized skill gaps equal missing required + missing preferred (4 + 2 = 6)`
  );

  // TEST 5: API End-to-End POST /api/skill-gap/analyze with Resume and Role
  console.log('\n5. Testing API POST /api/skill-gap/analyze & Database Persistence...');
  const dbRole = await Role.findOne({ name: 'Software Engineer' });
  assert(dbRole !== null, `Retrieved Role from MongoDB: ${dbRole?.name}`);

  const dbResume = await Resume.findOne({ 'extractedSkills.0': { $exists: true } });
  assert(dbResume !== null, `Retrieved Resume with skills from MongoDB: ${dbResume?.fileName}`);

  const postRes = await axios.post(`${API_URL}/skill-gap/analyze`, {
    roleId: dbRole._id,
    resumeId: dbResume._id,
    save: true,
  });

  assert(postRes.status === 200, `API response status is 200`);
  assert(postRes.data.success === true, `API response success is true`);
  const analysisData = postRes.data.data;
  assert(analysisData._id !== undefined, `Analysis persisted with MongoDB _id: ${analysisData._id}`);
  assert(
    analysisData.roleName === 'Software Engineer',
    `Persisted roleName is Software Engineer`
  );
  assert(
    typeof analysisData.matchPercentage === 'number',
    `Match percentage calculated: ${analysisData.matchPercentage}%`
  );
  assert(
    Array.isArray(analysisData.skillGaps),
    `Skill gaps array returned with ${analysisData.skillGaps.length} entries`
  );

  // TEST 6: API GET /api/skill-gap (Retrieve History)
  console.log('\n6. Testing API GET /api/skill-gap...');
  const listRes = await axios.get(`${API_URL}/skill-gap`);
  assert(listRes.status === 200, `GET /api/skill-gap responded with 200`);
  assert(Array.isArray(listRes.data.data), `Returned array of saved analyses`);
  assert(listRes.data.count >= 1, `Found ${listRes.data.count} saved analyses in database`);

  // TEST 7: API GET /api/skill-gap/:id
  console.log('\n7. Testing API GET /api/skill-gap/:id...');
  const singleRes = await axios.get(`${API_URL}/skill-gap/${analysisData._id}`);
  assert(singleRes.status === 200, `GET /api/skill-gap/:id responded with 200`);
  assert(
    singleRes.data.data._id === analysisData._id,
    `Retrieved matching analysis record ID: ${singleRes.data.data._id}`
  );

  // TEST 8: Edge Cases (Missing resume data, missing target role, duplicate skills)
  console.log('\n8. Testing Edge Cases...');

  // A) Missing resume data (empty skills)
  const emptySkillsRes = await axios.post(`${API_URL}/skill-gap/analyze`, {
    roleId: dbRole._id,
    skills: [],
    save: false,
  });
  assert(
    emptySkillsRes.status === 200 && emptySkillsRes.data.data.matchPercentage === 0,
    `Missing resume data handled gracefully: matchPercentage = 0%`
  );
  assert(
    emptySkillsRes.data.warning !== null,
    `Warning notice returned for empty resume skills: "${emptySkillsRes.data.warning?.slice(0, 40)}..."`
  );

  // B) Missing / Invalid target role
  try {
    await axios.post(`${API_URL}/skill-gap/analyze`, {
      roleId: new mongoose.Types.ObjectId(), // Non-existent role ID
      skills: ['Python'],
    });
    assert(false, 'Should have failed with 404 for invalid role');
  } catch (err) {
    assert(
      err.response?.status === 404 || err.response?.status === 200,
      `Non-existent role handled appropriately (HTTP ${err.response?.status || 'handled'})`
    );
  }

  // C) Duplicate skills in payload
  const duplicateSkillsRes = await axios.post(`${API_URL}/skill-gap/analyze`, {
    roleId: dbRole._id,
    skills: ['Python', 'python', 'PYTHON', 'Git', 'git', 'Git'],
    save: false,
  });
  assert(
    duplicateSkillsRes.data.data.extractedSkills.length === 2,
    `Duplicate skills sanitized: 6 inputs deduplicated to ${duplicateSkillsRes.data.data.extractedSkills.length} unique skills: [${duplicateSkillsRes.data.data.extractedSkills.join(', ')}]`
  );

  // TEST 9: Frontend Production Route Accessibility
  console.log('\n9. Testing Frontend Production Route Accessibility...');
  const frontendRes = await axios.get('http://127.0.0.1:5173/skill-gap');
  assert(frontendRes.status === 200, `Frontend /skill-gap route responded with HTTP 200`);

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error('Test Suite encountered error:', e);
  process.exit(1);
});
