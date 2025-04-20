import React, { createContext, useState, useEffect, useContext } from 'react';

const NightModeContext = createContext();

const applyEyeFriendlyStyles = (isNightMode) => {
  const root = document.documentElement;
  
  if (isNightMode) {
    
    root.style.setProperty('--bg-primary', '#1A2027'); 
    root.style.setProperty('--bg-secondary', '#2A3038'); 
    root.style.setProperty('--text-primary', '#E0D8CB'); 
    root.style.setProperty('--text-secondary', '#B3A99F'); 
    root.style.setProperty('--accent-color', '#8ab4f8'); 
    
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.15)'); 
  } else {
    // Light mode 
    root.style.setProperty('--bg-primary', '#F5F5F0'); 
    root.style.setProperty('--bg-secondary', '#FFFFFF'); 
    root.style.setProperty('--text-primary', '#333333'); 
    root.style.setProperty('--text-secondary', '#555555');
    root.style.setProperty('--accent-color', '#4285F4'); 
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
  }
};

/**
 * Provider component that makes night mode state available to any child component.
 * Manages eye-friendly color scheme to reduce eye strain.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const DarkModeProvider = ({ children }) => {
  // Initialize night mode state from saved preference
  const [nightMode, setNightMode] = useState(() => {
    const savedMode = localStorage.getItem('nightMode');
    return savedMode === 'true';
  });

  // Apply eye-friendly theme and toggle Tailwind dark class when mode changes
  useEffect(() => {
    // Apply the custom CSS properties for eye strain reduction
    applyEyeFriendlyStyles(nightMode);
    
    // Toggle Tailwind dark mode class for compatibility with existing styles
    if (nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save user preference
    localStorage.setItem('nightMode', nightMode);
  }, [nightMode]);

  /**
   * Toggle between light and night mode
   */
  const toggleNightMode = () => {
    setNightMode(prevMode => !prevMode);
  };

  return (
    <NightModeContext.Provider value={{ 
      // Keep darkMode name for compatibility with existing components
      darkMode: nightMode, 
      // Provide both function names for flexibility
      toggleDarkMode: toggleNightMode,
      toggleNightMode
    }}>
      {children}
    </NightModeContext.Provider>
  );
};

/**
 * Custom hook that provides access to the night mode context.
 * Makes it easy for any component to use the eye-friendly dark mode.
 * 
 * @returns {Object} Object containing darkMode state and toggle functions
 */
/**
 * Custom hook that provides access to the night mode context.
 * Makes it easy for any component to use the eye-friendly dark mode.
 * 
 * @returns {Object} Object containing darkMode state and toggle functions
 */
export const useDarkMode = () => {
  const nightModeContext = useContext(NightModeContext);
  
  if (nightModeContext === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  
  return nightModeContext;
};

// Alias for useDarkMode for semantic clarity
export const useNightMode = useDarkMode;