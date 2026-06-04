import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequirePlan({ children, plans }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userPlan = user?.plan || 'free';

  if (!plans.includes(userPlan)) {
    return <Navigate to="/pricing" replace />;
  }

  return children;
}
