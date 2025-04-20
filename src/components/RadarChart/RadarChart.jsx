import React from "react";
import "./RadarChart.css";

export const RadarChart = ({
  data,
  categories,
  maxValue,
  colors = ["#3b82f6", "#10b981", "#f59e0b"],
  title,
  subtitle,
}) => {
  const angleStep = (Math.PI * 2) / categories.length;
  const center = { x: 100, y: 100 };
  const radius = 80;

  const getPoint = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (value / maxValue) * radius;
    return {
      x: center.x + distance * Math.cos(angle),
      y: center.y + distance * Math.sin(angle),
    };
  };

  const createPath = (values) => {
    return (
      values.reduce((path, value, index) => {
        const point = getPoint(value, index);
        return path + (index === 0 ? "M" : "L") + `${point.x},${point.y}`;
      }, "") + "Z"
    );
  };

  return (
    <div className="radar-container">
      <div className="radar-header">
        <h3 className="radar-title">{title}</h3>
        {subtitle && <p className="radar-subtitle">{subtitle}</p>}
      </div>

      <div className="radar-visualization">
        <svg viewBox="0 0 200 200" className="radar-svg">
          {/* Background Grid */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
            <polygon
              key={i}
              points={categories
                .map((_, index) => {
                  const point = getPoint(maxValue * scale, index);
                  return `${point.x},${point.y}`;
                })
                .join(" ")}
              className="radar-grid"
              style={{ opacity: 0.1 + i * 0.1 }}
            />
          ))}

          {/* Axis Lines */}
          {categories.map((_, index) => {
            const point = getPoint(maxValue, index);
            return (
              <line
                key={index}
                x1={center.x}
                y1={center.y}
                x2={point.x}
                y2={point.y}
                className="radar-axis"
              />
            );
          })}

          {/* Data Polygons */}
          {data.map((values, i) => (
            <g key={i}>
              <path
                d={createPath(values)}
                className="radar-area"
                style={{
                  fill: colors[i],
                  fillOpacity: 0.2,
                  stroke: colors[i],
                  strokeWidth: 2,
                }}
              />
              {values.map((value, j) => {
                const point = getPoint(value, j);
                return (
                  <circle
                    key={j}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    className="radar-point"
                    style={{ fill: colors[i] }}
                  />
                );
              })}
            </g>
          ))}

          {/* Category Labels */}
          {categories.map((category, index) => {
            const point = getPoint(maxValue * 1.2, index);
            return (
              <text
                key={index}
                x={point.x}
                y={point.y}
                className="radar-label"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {category}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="radar-legend">
        {data.map((values, i) => (
          <div key={i} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="legend-label">Series {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
