/**
 * skillGap.service.js
 * Core comparison, prioritization, and transparent percentage calculation logic
 * for the Skill Gap Analysis Module.
 */

/**
 * Clean and deduplicate an array of skill inputs (strings or objects with name).
 * @param {Array<string|object>} skills
 * @returns {Array<string>}
 */
export const deduplicateSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];

  const seen = new Set();
  const result = [];

  for (const item of skills) {
    let name = '';
    if (typeof item === 'string') {
      name = item.trim();
    } else if (item && typeof item === 'object' && item.name) {
      name = String(item.name).trim();
    }

    if (!name) continue;

    const lower = name.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(name);
    }
  }

  return result;
};

/**
 * Normalized string for fuzzy matching (removes punctuation, spaces, converts to lowercase)
 */
export const normalizeSkillName = (str = '') => {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Common skill aliases map for robust, transparent matching without inventing skills
 */
const ALIASES = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  react: 'react',
  reactjs: 'react',
  node: 'nodejs',
  nodejs: 'nodejs',
  express: 'expressjs',
  expressjs: 'expressjs',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  py: 'python',
  python: 'python',
  python3: 'python',
  html: 'html5',
  html5: 'html5',
  css: 'css3',
  css3: 'css3',
  aws: 'aws',
  gcp: 'gcp',
};

/**
 * Check if candidate skill matches a role requirement
 */
export const isSkillMatch = (candidateSkill, targetSkill) => {
  const cNorm = normalizeSkillName(candidateSkill);
  const tNorm = normalizeSkillName(targetSkill);

  if (!cNorm || !tNorm) return false;

  // Exact normalized match
  if (cNorm === tNorm) return true;

  // Check alias map
  const cAlias = ALIASES[cNorm] || cNorm;
  const tAlias = ALIASES[tNorm] || tNorm;
  if (cAlias === tAlias) return true;

  // Substring containment for versioned / compound skills
  // e.g., 'python 3' matches 'python', 'html5 semantic markup' matches 'html5'
  if (cNorm.length >= 3 && tNorm.length >= 3) {
    if (cNorm.includes(tNorm) || tNorm.includes(cNorm)) {
      return true;
    }
  }

  return false;
};

/**
 * Perform skill comparison against role requirements
 * @param {Array<string>} rawExtractedSkills
 * @param {object} role (with requiredSkills, preferredSkills, name, category)
 */
export const analyzeSkillGap = (rawExtractedSkills = [], role = {}) => {
  const extractedSkills = deduplicateSkills(rawExtractedSkills);
  const requiredSkills = deduplicateSkills(role.requiredSkills || []);
  const preferredSkills = deduplicateSkills(role.preferredSkills || []);

  const matchedSkillsSet = new Set();
  const matchedRequiredSkills = [];
  const missingRequiredSkills = [];

  // 1. Evaluate Required Skills
  for (const reqSkill of requiredSkills) {
    const matched = extractedSkills.find((candSkill) => isSkillMatch(candSkill, reqSkill));
    if (matched) {
      matchedRequiredSkills.push(reqSkill);
      matchedSkillsSet.add(matched);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  }

  // 2. Evaluate Preferred Skills
  const matchedPreferredSkills = [];
  const missingPreferredSkills = [];

  for (const prefSkill of preferredSkills) {
    const matched = extractedSkills.find((candSkill) => isSkillMatch(candSkill, prefSkill));
    if (matched) {
      matchedPreferredSkills.push(prefSkill);
      matchedSkillsSet.add(matched);
    } else {
      missingPreferredSkills.push(prefSkill);
    }
  }

  const matchedSkills = Array.from(matchedSkillsSet);

  // 3. Categorize Skill Gaps as High, Medium, or Low priority based on role requirements
  const skillGaps = [];

  // Required skills are core prerequisites:
  // Top 60% of missing required skills are High Priority; remaining required skills are Medium Priority
  const totalMissingReq = missingRequiredSkills.length;
  const highThreshold = Math.ceil(totalMissingReq * 0.6);

  missingRequiredSkills.forEach((skill, idx) => {
    const isHigh = idx < highThreshold;
    skillGaps.push({
      skill,
      type: 'required',
      priority: isHigh ? 'High' : 'Medium',
      reason: isHigh
        ? 'Mandatory core requirement for role baseline qualifications'
        : 'Required functional competency for job responsibilities',
    });
  });

  // Preferred skills are value-add differentiators:
  // First 40% are Medium Priority; remaining are Low Priority
  const totalMissingPref = missingPreferredSkills.length;
  const medPrefThreshold = Math.ceil(totalMissingPref * 0.4);

  missingPreferredSkills.forEach((skill, idx) => {
    const isMedium = idx < medPrefThreshold;
    skillGaps.push({
      skill,
      type: 'preferred',
      priority: isMedium ? 'Medium' : 'Low',
      reason: isMedium
        ? 'Preferred capability that provides competitive advantage'
        : 'Optional supplementary skill for extended scope',
    });
  });

  // 4. Calculate transparent skill-match percentage
  const totalRequiredCount = requiredSkills.length;
  const matchedRequiredCount = matchedRequiredSkills.length;
  const totalPreferredCount = preferredSkills.length;
  const matchedPreferredCount = matchedPreferredSkills.length;

  const requiredMatchPercentage =
    totalRequiredCount > 0 ? Math.round((matchedRequiredCount / totalRequiredCount) * 100) : 100;

  const preferredMatchPercentage =
    totalPreferredCount > 0 ? Math.round((matchedPreferredCount / totalPreferredCount) * 100) : 100;

  // Transparent calculation: Required skills carry 2x weight, Preferred carry 1x weight
  const weightedNumerator = matchedRequiredCount * 2 + matchedPreferredCount * 1;
  const weightedDenominator = totalRequiredCount * 2 + totalPreferredCount * 1;

  const matchPercentage =
    weightedDenominator > 0 ? Math.round((weightedNumerator / weightedDenominator) * 100) : 0;

  const formulaBreakdown = {
    totalRequired: totalRequiredCount,
    matchedRequired: matchedRequiredCount,
    totalPreferred: totalPreferredCount,
    matchedPreferred: matchedPreferredCount,
    calculationFormula:
      '((matchedRequired * 2 + matchedPreferred) / (totalRequired * 2 + totalPreferred)) * 100',
    calculationText: `((${matchedRequiredCount} × 2) + (${matchedPreferredCount} × 1)) / ((${totalRequiredCount} × 2) + (${totalPreferredCount} × 1)) = ${matchPercentage}%`,
  };

  return {
    extractedSkills,
    matchedSkills,
    matchedRequiredSkills,
    matchedPreferredSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    skillGaps,
    matchPercentage,
    requiredMatchPercentage,
    preferredMatchPercentage,
    formulaBreakdown,
  };
};

export default {
  deduplicateSkills,
  normalizeSkillName,
  isSkillMatch,
  analyzeSkillGap,
};
