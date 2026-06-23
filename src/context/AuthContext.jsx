import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const PLAN_PERMISSIONS = {
  free: {
    canGenerateImage: false,
    canUseSleepMode: false,
    canSeeWeeklySummary: false,
    canDeleteDream: false,
    canDeleteEmotion: false,
    canUseCorrelations: false,
    canUseNotifications: true,
    canUseNumerology: false,
    maxDreams: 1,
    maxInterpretationsPerDay: 1,
    maxEmotionAnalysesPerDay: 3
  },
  premium: {
    canGenerateImage: true,
    canUseSleepMode: true,
    canSeeWeeklySummary: true,
    canDeleteDream: true,
    canDeleteEmotion: true,
    canUseCorrelations: true,
    canUseNotifications: true,
    canUseNumerology: true,
    maxDreams: 3,
    maxInterpretationsPerDay: Infinity,
    maxEmotionAnalysesPerDay: Infinity
  }
};

export function getUserPermissions(plan) {
  return PLAN_PERMISSIONS[plan] || PLAN_PERMISSIONS.free;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          const permissions = getUserPermissions(parsedUser.plan);
          setUser({ ...parsedUser, ...permissions });
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token, userData) => {
    const permissions = getUserPermissions(userData.plan);
    const userWithPermissions = { ...userData, ...permissions };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithPermissions));
    setUser(userWithPermissions);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updatePlanInfo = useCallback((planInfo) => {
    if (user) {
      const updatedUser = { ...user, ...planInfo };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.plan) {
        const permissions = getUserPermissions(data.plan);
        const userWithPermissions = { ...data, ...permissions };
        localStorage.setItem('user', JSON.stringify(userWithPermissions));
        setUser(userWithPermissions);
        return userWithPermissions;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getToken: () => localStorage.getItem('token'),
    updatePlanInfo,
    refreshUser,
    getUserPermissions: (plan) => getUserPermissions(plan)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
