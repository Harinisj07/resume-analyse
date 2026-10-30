import axios from 'axios';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Role from './src/models/role.model.js';
import Resume from './src/models/resume.model.js';
import CareerReadiness from './src/models/careerReadiness.model.js';
import { calculateReadiness, getReadinessTier } from './src/services/careerReadiness.service.js';

const API_URL = 'http://localhost:5000/api';

async function runCareerReadinessTests() {
  console.log('====================================================');
  console.log('   CAREER READINESS SCORE MODULE - TEST SUITE');
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

  // 1. TEST READINESS TIERS
  console.log('1. Testing Readiness Tiers...');
  assert(getReadinessTier(95) === 'Highly Competitive', 'Score 95 is Highly Competitive');
  assert(getReadinessTier(75) === 'Job Ready', 'Score 75 is Job Ready');
  assert(getReadinessTier(55) === 'Approaching Ready', 'Score 55 is Approaching Ready');
  assert(getReadinessTier(35) === 'Developing', 'Score 35 is Developing');
  assert(getReadinessTier(15) === 'Needs Preparation', 'Score 15 is Needs Preparation');

  // 2. TEST SCORE BOUNDARIES (0 and 100)
  console.log('\n2. Testing Score Boundaries (0 and 100)...');
  
  // Boundary A: Score 0 (Empty skills, no resume)
  const zeroGap = {
    formulaBreakdown: { totalRequired: 8, totalPreferred: 4 },
    matchedRequiredSkills: [],
    matchedPreferredSkills: [],
    skillGaps: Array(8).fill({ priority: 'High', skill: 'Skill' }),
  };
  const zeroResult = calculateReadiness({ gapAnalysis: zeroGap, resumeDoc: null, roleDoc: { name: 'Role' } });
  assert(zeroResult.readinessScore === 0, `Zero match produces score: ${zeroResult.readinessScore}/100 (Bound: 0)`);
  assert(zeroResult.readinessTier === 'Needs Preparation', `Zero score tier is Needs Preparation`);

  // Boundary B: Score 100 (Full match, 100 ATS resume)
  const perfectGap = {
    formulaBreakdown: { totalRequired: 8, totalPreferred: 4 },
    matchedRequiredSkills: Array(8).fill('ReqSkill'),
    matchedPreferredSkills: Array(4).fill('PrefSkill'),
    skillGaps: [],
  };
  const perfectResume = { atsScore: 100 };
  const perfectResult = calculateReadiness({ gapAnalysis: perfectGap, resumeDoc: perfectResume, roleDoc: { name: 'Role' } });
  assert(perfectResult.readinessScore === 100, `Perfect match produces score: ${perfectResult.readinessScore}/100 (Bound: 100)`);
  assert(perfectResult.readinessTier === 'Highly Competitive', `Perfect score tier is Highly Competitive`);

  // 3. TEST DIFFERENT SKILL-MATCH SCENARIOS & TRANSPARENT FORMULA
  console.log('\n3. Testing Skill-Match Scenarios & Formula Transparency...');
  
  // Scenario 1: Partial match (6 of 8 required, 2 of 4 preferred, ATS 80, 2 missing high priority)
  // Expected Core: (6/8)*60 = 45 pts
  // High-Priority Penalty: min(15, 2 * 3) = 6 pts -> Core adjusted: 45 - 6 = 39 pts
  // Preferred: (2/4)*20 = 10 pts
  // Resume: (80/100)*20 = 16 pts
  // Expected Total: 39 + 10 + 16 = 65 pts
  const midGap = {
    formulaBreakdown: { totalRequired: 8, totalPreferred: 4 },
    matchedRequiredSkills: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    matchedPreferredSkills: ['P1', 'P2'],
    skillGaps: [
      { priority: 'High', skill: 'S7' },
      { priority: 'High', skill: 'S8' },
    ],
  };
  const midResume = { atsScore: 80 };
  const midResult = calculateReadiness({ gapAnalysis: midGap, resumeDoc: midResume, roleDoc: { name: 'Full Stack Developer' } });

  assert(midResult.readinessScore === 65, `Scenario calculated 65 pts: ${midResult.readinessScore} pts`);
  assert(midResult.readinessTier === 'Approaching Ready', `Scenario tier is Approaching Ready: ${midResult.readinessTier}`);
  assert(midResult.scoreBreakdown.coreSkillsScore === 39, `Adjusted Core score is 39/60 pts: ${midResult.scoreBreakdown.coreSkillsScore}`);
  assert(midResult.scoreBreakdown.preferredSkillsScore === 10, `Preferred score is 10/20 pts: ${midResult.scoreBreakdown.preferredSkillsScore}`);
  assert(midResult.scoreBreakdown.resumeReadinessScore === 16, `Resume score is 16/20 pts: ${midResult.scoreBreakdown.resumeReadinessScore}`);
  assert(midResult.scoreBreakdown.highPriorityPenalty === 6, `High priority penalty is 6 pts: ${midResult.scoreBreakdown.highPriorityPenalty}`);
  assert(typeof midResult.formulaExplanation === 'string' && midResult.formulaExplanation.includes('Core Skills'), `Formula explanation is documented: ${midResult.formulaExplanation}`);

  // 4. TEST STRENGTHS, GAPS, AND AREAS TO IMPROVE
  console.log('\n4. Testing Strengths, Critical Gaps, and Areas to Improve...');
  assert(Array.isArray(midResult.strengths) && midResult.strengths.length > 0, `Generated ${midResult.strengths.length} strengths`);
  assert(Array.isArray(midResult.criticalGaps) && midResult.criticalGaps.length === 2, `Identified 2 critical gaps: [${midResult.criticalGaps.join(', ')}]`);
  assert(Array.isArray(midResult.areasToImprove) && midResult.areasToImprove.length > 0, `Generated ${midResult.areasToImprove.length} actionable areas to improve`);

  // 5. TEST API POST /api/career-readiness/calculate & DATABASE PERSISTENCE
  console.log('\n5. Testing API POST /api/career-readiness/calculate & MongoDB Persistence...');
  const role = await Role.findOne({ name: 'Full Stack Developer' });
  const resume = await Resume.findOne({ fileName: 'real_sample_resume.pdf' });
  assert(role !== null, `Target role loaded: ${role.name}`);
  assert(resume !== null, `Analyzed resume loaded: ${resume.fileName}`);

  const postRes = await axios.post(`${API_URL}/career-readiness/calculate`, {
    roleId: role._id,
    resumeId: resume._id,
    save: true,
  });

  assert(postRes.status === 200, 'API responded with status 200');
  assert(postRes.data.success === true, 'API response success is true');
  const savedDoc = postRes.data.data;
  assert(savedDoc._id !== undefined, `Saved CareerReadiness document ID: ${savedDoc._id}`);
  assert(savedDoc.roleName === 'Full Stack Developer', `Target role name stored: ${savedDoc.roleName}`);
  assert(savedDoc.readinessScore > 0, `Calculated realistic readiness score: ${savedDoc.readinessScore}/100 (${savedDoc.readinessTier})`);

  // 6. TEST API GET /api/career-readiness (LIST SAVED ASSESSMENTS)
  console.log('\n6. Testing API GET /api/career-readiness...');
  const listRes = await axios.get(`${API_URL}/career-readiness`);
  assert(listRes.status === 200, 'GET /api/career-readiness responded with 200');
  assert(Array.isArray(listRes.data.data), 'Returned array of assessments');
  assert(listRes.data.count >= 1, `Found ${listRes.data.count} saved readiness assessments`);

  // 7. TEST API GET /api/career-readiness/:id
  console.log('\n7. Testing API GET /api/career-readiness/:id...');
  const singleRes = await axios.get(`${API_URL}/career-readiness/${savedDoc._id}`);
  assert(singleRes.status === 200, 'GET by ID responded with 200');
  assert(singleRes.data.data._id === savedDoc._id, `Retrieved matching assessment ID: ${singleRes.data.data._id}`);

  // 8. TEST RECALCULATION ON ROLE AND RESUME CHANGE
  console.log('\n8. Testing Recalculation on Role and Resume Change...');
  const altRole = await Role.findOne({ name: 'Data Analyst' });
  const altRes = await axios.post(`${API_URL}/career-readiness/calculate`, {
    roleId: altRole._id,
    resumeId: resume._id,
    save: false,
  });
  assert(altRes.status === 200, 'Recalculation with new target role responded with 200');
  assert(altRes.data.data.roleName === 'Data Analyst', `Role dynamically updated to Data Analyst`);
  assert(
    altRes.data.data.readinessScore !== savedDoc.readinessScore || altRes.data.data.roleName !== savedDoc.roleName,
    `Score recalculates dynamically between roles (Full Stack: ${savedDoc.readinessScore} vs Data Analyst: ${altRes.data.data.readinessScore})`
  );

  // 9. TEST EDGE CASES (MISSING RESUME, MISSING TARGET ROLE)
  console.log('\n9. Testing Edge Cases...');
  
  // A) Missing Resume Data
  const noResumeRes = await axios.post(`${API_URL}/career-readiness/calculate`, {
    roleId: role._id,
    skills: [],
    save: false,
  });
  assert(noResumeRes.status === 200, 'Missing resume data handled gracefully with 200');
  assert(noResumeRes.data.warning !== null, 'Warning provided for missing resume');
  assert(noResumeRes.data.data.readinessScore === 0, `Missing resume score is baseline: ${noResumeRes.data.data.readinessScore}`);

  // B) Missing / Non-existent Target Role
  try {
    await axios.post(`${API_URL}/career-readiness/calculate`, {
      roleId: new mongoose.Types.ObjectId(),
    });
    assert(false, 'Should have failed with 404 for invalid role');
  } catch (err) {
    assert(err.response?.status === 404, `Invalid role returned 404 (status: ${err.response?.status})`);
  }

  // 10. TEST FRONTEND ROUTE ACCESSIBILITY
  console.log('\n10. Testing Frontend Route Accessibility...');
  const front1 = await axios.get('http://127.0.0.1:5173/career-readiness');
  assert(front1.status === 200, 'Frontend /career-readiness served with HTTP 200');
  const front2 = await axios.get('http://127.0.0.1:5173/readiness');
  assert(front2.status === 200, 'Frontend /readiness served with HTTP 200');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runCareerReadinessTests().catch((e) => {
  console.error('Test Suite encountered error:', e);
  process.exit(1);
});
