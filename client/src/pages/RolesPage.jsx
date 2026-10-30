import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Code,
  Server,
  Brain,
  Cloud,
  Activity,
  Cpu,
  BarChart3,
  Terminal,
  Layout,
  DollarSign,
  Briefcase,
  X,
  Zap,
  Check,
  RotateCcw,
  BookOpen,
  Compass,
  Flame,
} from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Icon resolver helper for visual richness
const getRoleIcon = (name = '', category = '') => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (lowerName.includes('ai') || lowerName.includes('ml') || lowerName.includes('machine learning')) return Brain;
  if (lowerName.includes('data scientist')) return Brain;
  if (lowerName.includes('data analyst')) return BarChart3;
  if (lowerName.includes('cloud')) return Cloud;
  if (lowerName.includes('devops')) return Activity;
  if (lowerName.includes('java')) return Cpu;
  if (lowerName.includes('python')) return Terminal;
  if (lowerName.includes('frontend')) return Layout;
  if (lowerName.includes('backend')) return Server;
  if (lowerName.includes('mern') || lowerName.includes('full stack')) return Layers;
  if (lowerCat.includes('data')) return BarChart3;
  return Code;
};

export const RolesPage = () => {
  const navigate = useNavigate();
  const { user, updateUserTargetRole } = useAuth();

  // Roles state
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('demand'); // 'demand' | 'name' | 'skills'

  // Selection & Modal states
  const [activeRoleModal, setActiveRoleModal] = useState(null);
  const [settingRoleLoadingId, setSettingRoleLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Determine current active target role
  const currentTargetRoleName = user?.targetRole || localStorage.getItem('targetRole') || 'Full Stack Software Engineer';

  // Fetch roles from database API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getRoles();
        if (response.success && response.data) {
          setRoles(response.data);
        } else {
          setRoles([]);
        }
      } catch (err) {
        console.error('Failed to load roles from API:', err);
        setError(err.message || 'Failed to connect to roles service');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const cats = new Set(roles.map((r) => r.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [roles]);

  // Compute unique skills across all roles for quick filtering
  const allSkills = useMemo(() => {
    const skillSet = new Set();
    roles.forEach((r) => {
      (r.requiredSkills || []).forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).sort().slice(0, 24);
  }, [roles]);

  // Filtered & sorted roles
  const filteredRoles = useMemo(() => {
    return roles
      .filter((role) => {
        // Category filter
        if (selectedCategory !== 'All' && role.category !== selectedCategory) {
          return false;
        }

        // Skill tag filter
        if (selectedSkillFilter) {
          const hasSkill =
            role.requiredSkills?.some((s) => s.toLowerCase() === selectedSkillFilter.toLowerCase()) ||
            role.preferredSkills?.some((s) => s.toLowerCase() === selectedSkillFilter.toLowerCase());
          if (!hasSkill) return false;
        }

        // Search filter (name, description, category, skills)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = role.name?.toLowerCase().includes(q);
          const matchDesc = role.description?.toLowerCase().includes(q);
          const matchCat = role.category?.toLowerCase().includes(q);
          const matchReq = role.requiredSkills?.some((s) => s.toLowerCase().includes(q));
          const matchPref = role.preferredSkills?.some((s) => s.toLowerCase().includes(q));
          return matchName || matchDesc || matchCat || matchReq || matchPref;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'demand') {
          const demandScore = { 'Very High': 3, High: 2, Moderate: 1 };
          return (demandScore[b.marketDemand] || 2) - (demandScore[a.marketDemand] || 2);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'skills') {
          return (b.requiredSkills?.length || 0) - (a.requiredSkills?.length || 0);
        }
        return 0;
      });
  }, [roles, selectedCategory, selectedSkillFilter, searchTerm, sortBy]);

  // Handle setting role as target role & redirect to Skill Gap Analysis
  const handleSelectRole = async (role) => {
    try {
      setSettingRoleLoadingId(role._id || role.name);
      
      // Update via backend API and auth context
      await updateUserTargetRole(role.name, role._id);

      setNotification({
        type: 'success',
        message: `Target role updated to ${role.name}! Redirecting to Skill Gap Analysis...`,
      });

      // Small delay for smooth visual feedback before redirecting to Skill Gap Analysis
      setTimeout(() => {
        if (activeRoleModal) setActiveRoleModal(null);
        navigate('/skill-gap', {
          state: {
            role,
            targetRole: role.name,
            roleId: role._id,
            requiredSkills: role.requiredSkills || [],
            preferredSkills: role.preferredSkills || [],
          },
        });
      }, 700);
    } catch (err) {
      console.error('Error selecting target role:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update target role',
      });
      setSettingRoleLoadingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedSkillFilter('');
    setSortBy('demand');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <X className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-brand-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Career Benchmark Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Target Role Selection
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Select your desired career milestone from industry-benchmarked engineering and data roles. 
              Setting your target role personalizes your ATS scoring, evaluates skill gaps, and unlocks customized learning roadmaps.
            </p>
          </div>

          {/* Current Active Goal Pill */}
          <div className="shrink-0 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex flex-col gap-2 min-w-[260px]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Target Role
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white truncate" title={currentTargetRoleName}>
                {currentTargetRoleName}
              </span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Requirements stored and configured dynamically in database.
            </p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Panel */}
      <Card className="space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role title, description, or specific skill (e.g., Python, React, AWS, Docker)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="demand">Market Demand</option>
              <option value="name">Alphabetical (A - Z)</option>
              <option value="skills">Requirements Count</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-400" />
              <span>Filter by Category</span>
            </span>
            {(selectedCategory !== 'All' || selectedSkillFilter || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === 'All' ? roles.length : roles.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 border border-brand-500'
                      : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Skills Quick Filter Chips */}
        {allSkills.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Filter by Required Technology:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() =>
                    setSelectedSkillFilter(selectedSkillFilter === skill ? '' : skill)
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    selectedSkillFilter === skill
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-medium'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredRoles.length}</strong> of{' '}
          <strong className="text-slate-200">{roles.length}</strong> configurable roles
        </span>
        {selectedSkillFilter && (
          <span className="flex items-center gap-1.5 text-indigo-400">
            Filtering by skill: <strong className="text-white">{selectedSkillFilter}</strong>
            <button onClick={() => setSelectedSkillFilter('')} className="hover:text-rose-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4"
            >
              <div className="h-6 w-1/3 bg-slate-800 rounded-lg" />
              <div className="h-8 w-2/3 bg-slate-800 rounded-lg" />
              <div className="h-16 w-full bg-slate-800 rounded-lg" />
              <div className="h-24 w-full bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card className="text-center py-12 border-rose-500/30 bg-rose-500/5">
          <p className="text-sm text-rose-300 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRoles.length === 0 && (
        <Card className="text-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Matching Roles Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              We couldn't find any target roles matching your search criteria. Try modifying your search term or clearing the active filters.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={clearFilters}>
            Clear All Filters
          </Button>
        </Card>
      )}

      {/* Roles Cards Grid */}
      {!loading && !error && filteredRoles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const Icon = getRoleIcon(role.name, role.category);
            const isSelected = currentTargetRoleName?.toLowerCase() === role.name?.toLowerCase();
            const isSettingThisRole = settingRoleLoadingId === (role._id || role.name);

            return (
              <div
                key={role._id || role.name}
                className={`group rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900/90 border-2 border-brand-500 shadow-xl shadow-brand-500/15'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40'
                }`}
              >
                {/* Active indicator badge */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Current Target</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category & Demand Badge */}
                  <div className="flex items-center justify-between gap-2 pr-16">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-400 font-mono">
                      {role.category}
                    </span>
                    <Badge
                      variant={role.marketDemand === 'Very High' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {role.marketDemand || 'High'} Demand
                    </Badge>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{role.level || 'Mid - Senior'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400 font-medium font-mono text-[11px]">
                          {role.avgSalary || '$110k - $160k'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Required Skills Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>Core Required Skills ({role.requiredSkills?.length || 0})</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-hidden">
                      {(role.requiredSkills || []).slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-200 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {(role.requiredSkills?.length || 0) > 6 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400">
                          +{(role.requiredSkills?.length || 0) - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preferred Skills Section */}
                  {role.preferredSkills?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Preferred Additions</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                        {(role.preferredSkills || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {(role.preferredSkills?.length || 0) > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-500">
                            +{(role.preferredSkills?.length || 0) - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveRoleModal(role)}
                  >
                    View Details
                  </Button>

                  <Button
                    variant={isSelected ? 'success' : 'primary'}
                    size="sm"
                    className="flex-1 text-xs"
                    loading={isSettingThisRole}
                    icon={isSelected ? Check : ArrowRight}
                    onClick={() => handleSelectRole(role)}
                  >
                    {isSelected ? 'Analyze Gap' : 'Set as Target'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Deep-Dive Modal */}
      {activeRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close button */}
            <button
              onClick={() => setActiveRoleModal(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 pr-10">
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
                {React.createElement(getRoleIcon(activeRoleModal.name, activeRoleModal.category), {
                  className: 'w-7 h-7',
                })}
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
                  {activeRoleModal.category}
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">
                  {activeRoleModal.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <Badge variant="warning">{activeRoleModal.marketDemand || 'High'} Demand</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    {activeRoleModal.avgSalary || '$110,000 - $160,000'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    {activeRoleModal.level || 'Mid - Senior'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Overview */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Role Mission & Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeRoleModal.description}
              </p>
            </div>

            {/* Required Skills Matrix */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Mandatory Required Skills ({activeRoleModal.requiredSkills?.length || 0})</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Core prerequisites evaluated during technical ATS screening and hiring interviews.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(activeRoleModal.requiredSkills || []).map((skill) => (
                  <div
                    key={skill}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-brand-500/20 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-200 truncate">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Skills Matrix */}
            {activeRoleModal.preferredSkills?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preferred & High-Impact Skills ({activeRoleModal.preferredSkills?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(activeRoleModal.preferredSkills || []).map((skill) => (
                    <div
                      key={skill}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-2.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-xs text-slate-300 truncate">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => setActiveRoleModal(null)}
              >
                Close
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                loading={settingRoleLoadingId === (activeRoleModal._id || activeRoleModal.name)}
                onClick={() => handleSelectRole(activeRoleModal)}
              >
                Set as Target & Analyze Skill Gap
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
