import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';
import CareerGuidePage from './pages/CareerGuidePage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import RolesPage from './pages/RolesPage';
import SkillGapPage from './pages/SkillGapPage';
import CareerReadinessPage from './pages/CareerReadinessPage';
import RoadmapPage from './pages/RoadmapPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';

export function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  return (
    <AuthProvider>
      <Layout isBackendConnected={isBackendConnected}>
        <Routes>
          <Route
            path="/"
            element={<DashboardPage onStatusChange={setIsBackendConnected} />}
          />
          <Route
            path="/dashboard"
            element={<DashboardPage onStatusChange={setIsBackendConnected} />}
          />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/skill-gap-analysis" element={<SkillGapPage />} />
          <Route path="/skills/gap-analysis" element={<SkillGapPage />} />
          <Route path="/readiness" element={<CareerReadinessPage />} />
          <Route path="/career-readiness" element={<CareerReadinessPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/learning-roadmap" element={<RoadmapPage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/analysis" element={<ResumeAnalysisPage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/career-guide" element={<CareerGuidePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <AuthModal />
    </AuthProvider>
  );
}

export default App;
