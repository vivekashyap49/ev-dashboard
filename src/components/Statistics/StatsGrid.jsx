import React from "react";
import "./StatsGrid.css";

const StatCard = ({ label, value, trend, icon: Icon }) => {
  const trendClass =
    trend > 0 ? "positive" : trend < 0 ? "negative" : "neutral";

  return (
    <div className="stat-card">
      <div className="stat-header">
        {Icon && <Icon className="stat-icon" />}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        {trend !== undefined && (
          <span className={`stat-trend ${trendClass}`}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

export const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
