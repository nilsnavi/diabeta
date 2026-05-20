import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has accepted legal documents
    const legalAccepted = localStorage.getItem('legal_consent_accepted');
    const onboardingCompleted = localStorage.getItem('onboarding_completed');

    // Simulate splash screen delay
    const timer = setTimeout(() => {
      if (!legalAccepted) {
        navigate('/legal-consent');
      } else if (!onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-5xl">💉</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">DiaBeta</h1>
          <p className="text-lg opacity-90">Диабет Ассистент</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Tagline */}
        <p className="mt-8 text-sm opacity-75 max-w-xs mx-auto">
          Ведите дневник диабета легко и удобно
        </p>
      </div>
    </div>
  );
};
