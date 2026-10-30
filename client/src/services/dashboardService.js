/**
 * dashboardService.js
 * 
 * Service layer abstraction for dashboard data retrieval and actions.
 * 
 * BACKEND INTEGRATION READY:
 * To switch from mock data to live backend endpoints:
 * 1. Set `USE_MOCK_DATA = false`
 * 2. Configure `apiClient` endpoints corresponding to your Express server.
 */

import mockDashboardData from '../data/mockDashboardData';
import { api } from '../api/client';

/**
 * Fetch candidate dashboard aggregate data
 * Integrates live MongoDB analyzed resume state with dashboard widgets
 * @returns {Promise<typeof mockDashboardData>}
 */
export async function getDashboardOverview() {
  try {
    const response = await api.getResumes();
    const resumes = response?.data || [];

    if (!resumes || resumes.length === 0) {
      // Return baseline structure if no resumes analyzed yet
      return { ...mockDashboardData };
    }

    const latest = resumes[0]; // Most recent resume in MongoDB

    const detectedSecs = latest.detectedSections || mockDashboardData.resumeStatus.detectedSections;
    const activeSectionsCount = Object.values(detectedSecs).filter(Boolean).length;
    const sectionsCoverage = Math.round((activeSectionsCount / Math.max(1, Object.keys(detectedSecs).length)) * 100);

    const overallScore = Math.round(latest.atsScore || 0);

    // Build history from saved scans
    const scoreHistory = resumes
      .slice(0, 5)
      .reverse()
      .map((r, i) => ({
        scan: `v${i + 1}.0`,
        score: Math.round(r.atsScore || 70),
        date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));

    const matchedSkills = latest.jobMatch?.matchedSkills || [];
    const missingSkillsList = latest.missingSkills || latest.jobMatch?.missingCriticalSkills || [];
    const totalRequired = matchedSkills.length + missingSkillsList.length || 10;
    const matchPercentage = Math.round(latest.jobMatch?.matchPercentage || ((matchedSkills.length / Math.max(1, totalRequired)) * 100));

    return {
      ...mockDashboardData,
      candidate: {
        ...mockDashboardData.candidate,
        name: latest.contactInfo?.name || latest.title || mockDashboardData.candidate.name,
        email: latest.contactInfo?.email || mockDashboardData.candidate.email,
        currentTitle: latest.targetRole || mockDashboardData.candidate.currentTitle,
      },
      resumeStatus: {
        ...mockDashboardData.resumeStatus,
        id: latest._id,
        fileName: latest.fileName || 'Uploaded_Resume.pdf',
        fileSize: latest.fileSize ? `${Math.round(latest.fileSize / 1024)} KB` : '248 KB',
        fileType: latest.fileType || 'application/pdf',
        lastScanned: new Date(latest.updatedAt || latest.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        scanTimestamp: latest.updatedAt || latest.createdAt,
        parseStatus: latest.analysisStatus === 'completed' ? 'ATS Indexed & Verified' : latest.analysisStatus,
        health: overallScore >= 75 ? 'Optimal' : overallScore >= 50 ? 'Moderate' : 'Needs Review',
        wordCount: latest.wordCount || 0,
        detectedSections: detectedSecs,
        sectionsCoverage,
        viewUrl: `/analyzer`,
      },
      resumeScore: {
        ...mockDashboardData.resumeScore,
        overallScore,
        grade: overallScore >= 80 ? 'Excellent' : overallScore >= 65 ? 'Good' : 'Needs Work',
        percentileRank: Math.min(99, Math.round(overallScore * 0.95)),
        status: overallScore >= 75 ? 'Strong Candidate' : 'Developing Candidate',
        summary: latest.strengths?.[0] || 'Resume verified with ATS structural and skill extraction.',
        breakdown: {
          keywords: {
            score: Math.round(latest.scoreBreakdown?.relevanceScore || 85),
            weight: 35,
            status: overallScore >= 75 ? 'Good' : 'Moderate',
            description: `Extracted ${latest.extractedSkills?.length || 0} skills & keywords`,
          },
          formatting: {
            score: Math.round(latest.scoreBreakdown?.formatScore || 90),
            weight: 20,
            status: 'Excellent',
            description: 'Standard single-column ATS structure',
          },
          contentImpact: {
            score: Math.round(latest.scoreBreakdown?.impactScore || 80),
            weight: 25,
            status: 'Strong',
            description: `${latest.metricsCount || 0} quantified metrics & ${latest.actionVerbsCount || 0} action verbs`,
          },
          relevance: {
            score: Math.round(latest.scoreBreakdown?.structureScore || 85),
            weight: 20,
            status: 'Strong',
            description: `${activeSectionsCount} key resume sections detected`,
          },
        },
        scoreHistory: scoreHistory.length > 0 ? scoreHistory : mockDashboardData.resumeScore.scoreHistory,
      },
      skillMatch: {
        ...mockDashboardData.skillMatch,
        overallPercentage: matchPercentage,
        matchedCount: matchedSkills.length || latest.extractedSkills?.length || 0,
        totalRequiredCount: totalRequired,
        skills: (latest.extractedSkills || []).slice(0, 12).map((s) => ({
          name: s.name,
          level: 'Proficient',
          verified: true,
          matchPercent: 95,
          category: s.category || 'Core',
        })),
      },
      missingSkills: missingSkillsList.map((skillName, idx) => ({
        id: `gap_${idx}`,
        name: skillName,
        priority: idx < 2 ? 'High' : 'Medium',
        difficulty: 'Moderate',
        estimatedWeeks: 2,
        marketGrowth: '+28%',
      })),
      targetRole: {
        ...mockDashboardData.targetRole,
        title: latest.targetRole || mockDashboardData.targetRole.title,
      },
    };
  } catch (error) {
    console.warn('[DashboardService] Live API fetch failed, using fallback data:', error.message);
    return { ...mockDashboardData };
  }
}

/**
 * Update target role preference
 * @param {string} targetRoleId 
 */
export async function updateTargetRole(targetRoleId) {
  if (USE_MOCK_DATA) {
    return { success: true, targetRoleId };
  }
  // return apiClient.patch('/users/target-role', { targetRoleId });
}

/**
 * Trigger re-scan of the current active resume
 * @param {string} resumeId 
 */
export async function triggerResumeRescan(resumeId) {
  if (USE_MOCK_DATA) {
    return { success: true, message: 'Resume re-scanned successfully' };
  }
  // return apiClient.post(`/resumes/${resumeId}/rescan`);
}

export default {
  getDashboardOverview,
  updateTargetRole,
  triggerResumeRescan,
};
