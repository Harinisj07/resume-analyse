/**
 * careerReadiness.service.js
 * Service for calculating the transparent Career Readiness Score (0-100),
 * identifying strengths, important skill gaps, and areas to improve.
 */

/**
 * Determine qualitative readiness tier
 */
export const getReadinessTier = (score = 0) => {
  if (score >= 85) return 'Highly Competitive';
  if (score >= 70) return 'Job Ready';
  if (score >= 50) return 'Approaching Ready';
  if (score >= 30) return 'Developing';
  return 'Needs Preparation';
};

/**
 * Calculate career readiness score and supporting details
 * @param {object} params
 * @param {object} params.gapAnalysis - Skill gap analysis output or model
 * @param {object} params.resumeDoc - Resume document from MongoDB (optional)
 * @param {object} params.roleDoc - Target Role document from MongoDB
 */
export const calculateReadiness = ({ gapAnalysis = {}, resumeDoc = null, roleDoc = {} }) => {
  const roleName = roleDoc.name || gapAnalysis.roleName || 'Target Role';

  // 1. Required Skills (Core Foundation) - Up to 60 Points
  const totalRequired =
    gapAnalysis.formulaBreakdown?.totalRequired ?? (roleDoc.requiredSkills?.length || 0);
  const matchedRequired = gapAnalysis.matchedRequiredSkills?.length || 0;

  const baseCoreScore =
    totalRequired > 0 ? Math.round((matchedRequired / totalRequired) * 60) : 60;

  // High-Priority Missing Skill Penalty (0 to 15 Points)
  // Missing critical required skills directly reduce readiness
  const highPriorityGaps = (gapAnalysis.skillGaps || []).filter(
    (gap) => gap.priority === 'High'
  );
  const highPriorityMissingCount = highPriorityGaps.length;
  const highPriorityPenalty = Math.min(15, highPriorityMissingCount * 3);

  const coreSkillsScore = Math.max(0, baseCoreScore - highPriorityPenalty);

  // 2. Preferred Skills (Bonus Differentiation) - Up to 20 Points
  const totalPreferred =
    gapAnalysis.formulaBreakdown?.totalPreferred ?? (roleDoc.preferredSkills?.length || 0);
  const matchedPreferred = gapAnalysis.matchedPreferredSkills?.length || 0;

  const preferredSkillsScore =
    totalPreferred > 0 ? Math.round((matchedPreferred / totalPreferred) * 20) : 20;

  // 3. Resume Content & Structural Alignment - Up to 20 Points
  let resumeReadinessScore = 0;
  let atsScoreValue = 0;

  if (resumeDoc) {
    if (typeof resumeDoc.atsScore === 'number' && resumeDoc.atsScore > 0) {
      atsScoreValue = resumeDoc.atsScore;
      resumeReadinessScore = Math.round((atsScoreValue / 100) * 20);
    } else {
      // Evaluate based on detected standard sections if ATS score is not yet computed
      const sections = resumeDoc.detectedSections || {};
      let sectionPoints = 0;
      if (sections.summary) sectionPoints += 4;
      if (sections.experience) sectionPoints += 4;
      if (sections.education) sectionPoints += 4;
      if (sections.skills) sectionPoints += 4;
      if (sections.projects || sections.certifications) sectionPoints += 4;
      resumeReadinessScore = sectionPoints || 10;
      atsScoreValue = sectionPoints * 5;
    }
  }

  // 4. Composite Readiness Score Clamped to 0 - 100
  const rawSum = coreSkillsScore + preferredSkillsScore + resumeReadinessScore;
  const readinessScore = Math.max(0, Math.min(100, Math.round(rawSum)));
  const readinessTier = getReadinessTier(readinessScore);

  // 5. Strengths Identification
  const strengths = [];

  if (matchedRequired > 0) {
    strengths.push(
      `Verified ${matchedRequired} of ${totalRequired} mandatory required skills for ${roleName}.`
    );
  }
  if (totalRequired > 0 && matchedRequired / totalRequired >= 0.7) {
    strengths.push(
      `Strong core qualification match (${Math.round((matchedRequired / totalRequired) * 100)}% of required skills present).`
    );
  }
  if (matchedPreferred > 0) {
    const samplePref = (gapAnalysis.matchedPreferredSkills || []).slice(0, 3).join(', ');
    strengths.push(
      `Demonstrates ${matchedPreferred} preferred competency additions (${samplePref}).`
    );
  }
  if (resumeDoc && atsScoreValue >= 70) {
    strengths.push(
      `Resume document demonstrates high ATS structural compatibility (${atsScoreValue}/100).`
    );
  }
  if (resumeDoc?.detectedSections?.experience && resumeDoc?.detectedSections?.projects) {
    strengths.push('Resume features clearly indexed professional experience and project history.');
  }
  if (strengths.length === 0) {
    strengths.push('Baseline profile initialized and ready for progressive qualification.');
  }

  // 6. Important Skill Gaps Identification
  const criticalGaps = [];
  highPriorityGaps.forEach((g) => {
    criticalGaps.push(`${g.skill} (High Priority Required)`);
  });

  const mediumGaps = (gapAnalysis.skillGaps || []).filter((gap) => gap.priority === 'Medium');
  mediumGaps.slice(0, 3).forEach((g) => {
    criticalGaps.push(`${g.skill} (Medium Priority)`);
  });

  // 7. Actionable Areas to Improve
  const areasToImprove = [];

  if (highPriorityMissingCount > 0) {
    const topMissing = highPriorityGaps.slice(0, 2).map((g) => g.skill).join(' and ');
    areasToImprove.push(
      `Acquire foundational skills in ${topMissing} to meet the baseline technical threshold for ${roleName}.`
    );
  }
  if (gapAnalysis.missingPreferredSkills?.length > 0) {
    const topPref = gapAnalysis.missingPreferredSkills.slice(0, 2).join(' or ');
    areasToImprove.push(
      `Add preferred competencies such as ${topPref} to distinguish your profile from other candidates.`
    );
  }
  if (!resumeDoc) {
    areasToImprove.push(
      'Upload a complete resume to evaluate document structure, action verbs, and ATS formatting.'
    );
  } else if (atsScoreValue < 70) {
    areasToImprove.push(
      'Optimize resume ATS formatting, add quantified metrics, and align keywords with standard job descriptions.'
    );
  }
  if (areasToImprove.length === 0) {
    areasToImprove.push(
      'Maintain continuous skill maintenance and build portfolio demonstrations of your end-to-end expertise.'
    );
  }

  // 8. Documented Formula Explanation
  const formulaExplanation = `Career Readiness Score = Core Skills (${coreSkillsScore}/60 pts) + Preferred Skills (${preferredSkillsScore}/20 pts) + Resume Structural Preparedness (${resumeReadinessScore}/20 pts) - High-Priority Gap Deduction (${highPriorityPenalty} pts). Total: ${readinessScore}/100.`;

  return {
    readinessScore,
    readinessTier,
    scoreBreakdown: {
      coreSkillsScore,
      preferredSkillsScore,
      resumeReadinessScore,
      highPriorityPenalty,
      matchedRequiredCount: matchedRequired,
      totalRequiredCount: totalRequired,
      matchedPreferredCount: matchedPreferred,
      totalPreferredCount: totalPreferred,
      atsScore: atsScoreValue,
    },
    strengths,
    criticalGaps,
    areasToImprove,
    formulaExplanation,
  };
};

export default {
  getReadinessTier,
  calculateReadiness,
};
