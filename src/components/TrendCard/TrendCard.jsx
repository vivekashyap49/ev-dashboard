import React from "react";
import "./TrendCard.css";

export const TrendCard = ({ title, value, trend, sparklineData }) => {
  const trendType = trend > 0 ? "positive" : trend < 0 ? "negative" : "neutral";

  return (
    <div className="trend-card">
      <div className="trend-header">
        <h3 className="trend-title">{title}</h3>
        <div className={`trend-indicator ${trendType}`}>
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
          {Math.abs(trend)}%
        </div>
      </div>

      <div className="trend-value">{value.toLocaleString()}</div>

      {sparklineData && (
        <div className="sparkline">
          <svg viewBox="0 0 100 30">
            <path
              d={generateSparkline(sparklineData)}
              className={`sparkline-path ${trendType}`}
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const generateSparkline = (data) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 30 - ((value - min) / range) * 25;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
};
