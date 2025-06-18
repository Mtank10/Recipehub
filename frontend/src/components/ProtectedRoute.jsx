import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import PhoneAuthModal from './PhoneAuthModal';

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      name
      isOnboardingComplete
    }
  }
`;

const ProtectedRoute = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_CURRENT_USER, {
    skip: !isAuthenticated,
    errorPolicy: 'ignore'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setShowAuthModal(true);
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setShowAuthModal(true);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    // Redirect to onboarding if not completed
    if (!user.isOnboardingComplete) {
      navigate('/onboarding');
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    navigate('/');
  };

  if (showAuthModal) {
    return (
      <PhoneAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: 'var(--primary-green)' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold" style={{ color: 'var(--primary-green)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.getCurrentUser) {
    return (
      <PhoneAuthModal
        isOpen={true}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // Check if onboarding is complete
  if (!data.getCurrentUser.isOnboardingComplete) {
    navigate('/onboarding');
    return null;
  }

  return children;
};

export default ProtectedRoute;