import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  LogIn,
  LogOut,
  User,
  Shield,
  ChevronDown,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onToggleSidebar, isBackendConnected = false }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              ResumeAI{' '}
              <span className="text-xs font-normal text-brand-400 px-1.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20">
                Platform
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Personalized Career Intelligence</p>
          </div>
        </div>
      </div>

      {/* Right Navigation / Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2">
          <Badge variant={isBackendConnected ? 'success' : 'warning'} dot={true}>
            {isBackendConnected ? 'All Systems Online' : 'Connecting Services...'}
          </Badge>
        </div>

        {/* User Authentication Control */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              icon={LogIn}
              onClick={() => openAuthModal('login')}
            >
              Sign In
            </Button>
          </div>
        ) : (
          <div className="relative pl-2 border-l border-slate-800" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-brand-400 capitalize leading-tight">
                  {user?.role || 'Member'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* User Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-xl shadow-slate-950/50 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {user?.role || 'candidate'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Saved Resumes</span>
                </button>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
