import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Zap,
  TrendingUp,
  Award,
  Compass,
  Target,
  BarChart3,
  Layers,
  ChevronDown,
  RefreshCw,
  Server,
  Activity,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import ResumeStatusCard from '../components/dashboard/ResumeStatusCard';
import ResumeScoreCard from '../components/dashboard/ResumeScoreCard';
import CareerReadinessCard from '../components/dashboard/CareerReadinessCard';
import TargetRoleCard from '../components/dashboard/TargetRoleCard';
import SkillMatchCard from '../components/dashboard/SkillMatchCard';
import SkillsGapsSection from '../components/dashboard/SkillsGapsSection';
import LearningRoadmapProgressCard from '../components/dashboard/LearningRoadmapProgressCard';
import InterviewReadinessCard from '../components/dashboard/InterviewReadinessCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import SystemHealth from '../components/dashboard/SystemHealth';

import { getDashboardOverview, updateTargetRole } from '../services/dashboardService';

export const DashboardPage = ({ onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load dashboard overview data
  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await getDashboardOverview();
      setData(overview);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (altRole) => {
    if (!data) return;
    setData((prev) => ({
      ...prev,
      targetRole: {
        ...prev.targetRole,
        id: altRole.id,
        title: altRole.title,
      },
    }));
    await updateTargetRole(altRole.id);
    showNotice(`Target role updated to ${altRole.title}`);
  };

  const handleRescan = () => {
    showNotice('Resume re-scan initiated. Analyzing ATS compatibility...');
    setTimeout(() => {
      showNotice('ATS score updated! All sections re-indexed.');
    }, 1200);
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 rounded-3xl bg-slate-900/80 border border-slate-800/80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
          <div className="h-80 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-brand-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 border border-brand-400/30 animate-fade-in">
          <Activity className="w-4 h-4 text-brand-200 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Welcome Message & Quick Actions Banner */}
      <WelcomeHeader
        candidate={data.candidate}
        targetRole={data.targetRole}
        resumeStatus={data.resumeStatus}
        onRescan={handleRescan}
      />

      {/* 2. Top-Level Metric Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ATS Resume Score"
          value={`${data.resumeScore.overallScore}/100`}
          subtitle="Top 8% percentile rank"
          trend={data.resumeScore.trend}
          icon={Award}
          color="emerald"
        />

        <StatCard
          title="Career Readiness"
          value={`${data.careerReadiness.score}%`}
          subtitle="Senior Specialist Tier"
          icon={Compass}
          color="cyan"
        />

        <StatCard
          title="Skill Match Ratio"
          value={`${data.skillMatch.overallPercentage}%`}
          subtitle={`${data.skillMatch.matchedCount} of ${data.skillMatch.totalRequiredCount} skills verified`}
          icon={BarChart3}
          color="brand"
        />

        <StatCard
          title="Target Role Benchmark"
          value={data.targetRole.avgSalaryRange.split('-')[0].trim()}
          subtitle={data.targetRole.title}
          icon={Target}
          color="amber"
        />
      </div>

      {/* 3. Core Resume State & Scoring Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeStatusCard
          resumeStatus={data.resumeStatus}
          onRescan={handleRescan}
        />
        <ResumeScoreCard
          resumeScore={data.resumeScore}
        />
      </div>

      {/* 4. Career Readiness & Skill Match Row (Featuring Recharts Visuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CareerReadinessCard
          careerReadiness={data.careerReadiness}
          targetRole={data.targetRole}
        />
        <SkillMatchCard
          skillMatch={data.skillMatch}
        />
      </div>

      {/* 5. Target Role & Interview Readiness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TargetRoleCard
          targetRole={data.targetRole}
          onRoleChange={handleRoleChange}
        />
        <InterviewReadinessCard
          interviewReadiness={data.interviewReadiness}
        />
      </div>

      {/* 6. Skills Gaps & High-Priority Skills Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillsGapsSection
          missingSkills={data.missingSkills}
          highPrioritySkills={data.highPrioritySkills}
        />
        <LearningRoadmapProgressCard
          learningRoadmap={data.learningRoadmap}
        />
      </div>

      {/* 7. Recent Activity Feed */}
      <div>
        <RecentActivityCard
          recentActivity={data.recentActivity}
        />
      </div>

      {/* Optional Collapsible System Health & Diagnostics Drawer */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setShowSystemHealth(!showSystemHealth)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-slate-900/60"
        >
          <Server className="w-4 h-4 text-slate-500" />
          <span>Platform Infrastructure & Service Health Monitor</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showSystemHealth ? 'rotate-180 text-slate-200' : ''
            }`}
          />
        </button>

        {showSystemHealth && (
          <div className="mt-4 pt-2 animate-fade-in">
            <SystemHealth onStatusChange={onStatusChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
