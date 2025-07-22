import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, fetchUserProfile } from '@/store/slices/authSlice';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // If user is authenticated but we don't have user data, fetch it
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
      return;
    }

    // Check if user has required role
    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
        case 'caterer':
          navigate('/admin', { replace: true });
          break;
        case 'customer':
          navigate('/dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate, dispatch]);

  // Show loading while checking authentication
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If user doesn't have required role, don't render children (redirect will happen in useEffect)
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;
