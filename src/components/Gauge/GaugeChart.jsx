import React from "react";
import "./GaugeChart.css";

export const GaugeChart = ({
  value,
  min = 0,
  max = 100,
  title,
  subtitle,
  thresholds = [
    { value: 33, color: "#ef4444" },
    { value: 66, color: "#f59e0b" },
    { value: 100, color: "#10b981" },
  ],
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage * 180) / 100;

  const getColor = (value) => {
    const threshold = thresholds.find((t) => value <= t.value);
    return threshold
      ? threshold.color
      : thresholds[thresholds.length - 1].color;
  };

  return (
    <div className="gauge-container">
      <div className="gauge-header">
        <h3 className="gauge-title">{title}</h3>
        {subtitle && <p className="gauge-subtitle">{subtitle}</p>}
      </div>

      <div className="gauge-visualization">
        <svg viewBox="0 0 200 100" className="gauge-svg">
          {/* Background Arc */}
          <path d="M20 90 A 60 60 0 0 1 180 90" className="gauge-background" />

          {/* Value Arc */}
          <path
            d={`M20 90 A 60 60 0 ${rotation > 90 ? 1 : 0} 1 ${
              20 + 160 * (rotation / 180)
            } ${90 - Math.sin((rotation * Math.PI) / 180) * 60}`}
            className="gauge-value"
            style={{ stroke: getColor(percentage) }}
          />

          {/* Ticks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tickRotation = i * 18 - 90;
            const isMajor = i % 2 === 0;
            return (
              <line
                key={i}
                x1={
                  100 +
                  (isMajor ? 48 : 52) * Math.cos((tickRotation * Math.PI) / 180)
                }
                y1={
                  90 +
                  (isMajor ? 48 : 52) * Math.sin((tickRotation * Math.PI) / 180)
                }
                x2={100 + 60 * Math.cos((tickRotation * Math.PI) / 180)}
                y2={90 + 60 * Math.sin((tickRotation * Math.PI) / 180)}
                className={`gauge-tick ${isMajor ? "major" : "minor"}`}
              />
            );
          })}

          {/* Value Label */}
          <text x="100" y="70" className="gauge-label">
            {value.toLocaleString()}
          </text>
          <text x="100" y="85" className="gauge-sublabel">
            {max.toLocaleString()}
          </text>
        </svg>
      </div>

      {/* Threshold Legend */}
      <div className="gauge-legend">
        {thresholds.map((threshold, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: threshold.color }}
            />
            <span className="legend-label">
              {index === 0
                ? `0-${threshold.value}`
                : `${thresholds[index - 1].value}-${threshold.value}`}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
