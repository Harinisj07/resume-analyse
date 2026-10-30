import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Hydrate user profile on mount if token exists
  useEffect(() => {
    const hydrateUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch {
        // Token expired or invalid
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    if (response.success && response.data) {
      const { user: userData, token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthModalOpen(false);
      return userData;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (name, email, password, role = 'candidate') => {
    const response = await api.register({ name, email, password, role });
    if (response.success && response.data) {
      const { user: userData, token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthModalOpen(false);
      return userData;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const updateUserTargetRole = async (targetRoleName, roleId = null) => {
    try {
      const response = await api.updateTargetRole({
        roleId,
        targetRole: targetRoleName,
      });

      if (user) {
        setUser((prev) => ({
          ...prev,
          targetRole: targetRoleName,
          targetRoleId: roleId || prev?.targetRoleId,
        }));
      } else {
        localStorage.setItem('targetRole', targetRoleName);
        if (roleId) localStorage.setItem('targetRoleId', roleId);
      }

      return response.data;
    } catch (error) {
      console.warn('Backend update failed, falling back to local state:', error);
      localStorage.setItem('targetRole', targetRoleName);
      if (roleId) localStorage.setItem('targetRoleId', roleId);
      if (user) {
        setUser((prev) => ({ ...prev, targetRole: targetRoleName }));
      }
      return { targetRole: targetRoleName, targetRoleId: roleId };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    updateUserTargetRole,
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
