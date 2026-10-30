import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ScanText,
  Compass,
  Cpu,
  Database,
  Layers,
  Settings,
  Github,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navLinks = [
    { to: '/dashboard', label: 'Candidate Dashboard', icon: LayoutDashboard },
    { to: '/roles', label: 'Target Roles', icon: Target, badge: 'Target' },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: Sparkles, badge: 'Insights' },
    { to: '/career-readiness', label: 'Career Readiness', icon: Award, badge: 'Score' },
    { to: '/roadmap', label: 'Learning Roadmap', icon: BookOpen, badge: 'Roadmap' },
    { to: '/resume-analysis', label: 'Resume Analysis', icon: ScanText, badge: 'Extraction' },
    { to: '/analyzer', label: 'Resume Analyzer', icon: FileText, badge: 'ATS Core' },
    { to: '/career-guide', label: 'Career Guidance', icon: Compass, badge: 'AI Engine' },
  ];

  const serviceBadges = [
    { name: 'Vite Frontend', port: '5173', status: 'active', color: 'emerald' },
    { name: 'Express API', port: '5000', status: 'active', color: 'indigo' },
    { name: 'FastAPI AI', port: '8000', status: 'active', color: 'cyan' },
    { name: 'MongoDB', port: '27017', status: 'active', color: 'emerald' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 h-full md:h-[calc(100vh-4rem)] w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-4 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Platform Modules
            </p>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Connected Microservices */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
              <span>Architecture Mesh</span>
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
            </p>
            <div className="space-y-1.5 px-1">
              {serviceBadges.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{svc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">:{svc.port}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800">
            <p className="text-xs font-semibold text-slate-200">Production Engine</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Intelligent ATS parsing, skills taxonomy & dynamic career roadmap generation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
