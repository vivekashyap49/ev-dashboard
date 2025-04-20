import React from "react";
import { tokens } from "../../styles/tokens";
import "./MetricBadge.css";

export const MetricBadge = ({ label, value, icon }) => {
  return (
    <div className="metric-badge">
      <div className="metric-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {icon}
        </svg>
      </div>
      <div className="metric-content">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
      </div>
    </div>
  );
};
