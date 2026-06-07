import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const PLAN_PERMISSIONS = {
  free: {
    canGenerateImage: false,
    canUseSleepMode: false,
    canSeeWeeklySummary: false,
    maxDreams: 5
  },
  premium: {
    canGenerateImage: true,
    canUseSleepMode: true,
    canSeeWeeklySummary: true,
    maxDreams: 60
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

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getToken: () => localStorage.getItem('token'),
    updatePlanInfo,
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
