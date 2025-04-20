import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { tokens } from "../../styles/tokens";
import { MetricBadge } from "./MetricBadge";
import "./Header.css";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="dashboard-header">
      <div className="header-content">
        {/* Main Title Section */}
        <div className="title-section">
          <div className="brand-mark">
            <svg
              className="brand-icon"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              {/* Custom original icon - abstract EV symbol */}
              <path
                d="M16 4L8 12M16 4L24 12M16 4V20M8 28H24"
                stroke={
                  isDark ? tokens.colors.brand[300] : tokens.colors.brand[600]
                }
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="brand-title">EV Analytics</h1>
          </div>

          <p className="brand-description">
            Comprehensive analysis of Washington's EV ecosystem, featuring
            detailed vehicle specifications, geographic trends, and adoption
            metrics across the state.
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="metrics-grid">
          <MetricBadge
            label="Data Coverage"
            value="Washington"
            icon={
              <path
                d="M12 14l9-5-9-5-9 5 9 5z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            }
          />
          <MetricBadge
            label="Last Updated"
            value="Real-time"
            icon={
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            }
          />
          <MetricBadge
            label="Data Points"
            value="Comprehensive"
            icon={
              <path
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            }
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
          {isDark ? (
            <svg className="theme-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.828-7.172L18.343 6m-12.686 0l1.171-1.172M5.657 18.343l1.172-1.171m12.686 0l-1.172-1.172" />
            </svg>
          ) : (
            <svg className="theme-icon" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
