import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ModernDashboard from './components/ModernDashboard';

const App = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleEnterDashboard = () => {
    setShowDashboard(true);
  };

  const handleBackToLanding = () => {
    setShowDashboard(false);
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      {showDashboard ? (
        <ModernDashboard 
          onBackToLanding={handleBackToLanding}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      ) : (
        <LandingPage 
          onEnterDashboard={handleEnterDashboard}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
    </div>
  );
};

export default App; 