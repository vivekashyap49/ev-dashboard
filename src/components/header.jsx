import React from "react";
import { useDarkMode } from "../context/DarkModeContext";

const Header = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="relative overflow-hidden">
      {/* Main Content */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg p-8 rounded-lg">
        {/* Header Content */}
        <div className="max-w-5xl mx-auto">
          {/* Top Section */}
          <div className="flex justify-between items-start mb-6">
            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {/* EV Icon */}
                <div className="bg-blue-500 dark:bg-blue-600 p-2.5 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Washington EV Insights
                </h1>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
                Comprehensive analysis of Washington's EV ecosystem, featuring
                detailed vehicle specifications, geographic trends, and adoption
                metrics across the state.
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Vehicle Data</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Specifications & Models
              </span>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span className="font-medium">Geographic Data</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Regional Distribution
              </span>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="font-medium">Adoption Metrics</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trends & Growth
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
