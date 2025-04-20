import React, { useState, useEffect } from "react";
import "./CircularProgress.css";

export const CircularProgress = ({
  data,
  size = 300,
  thickness = 20,
  gap = 4,
  title,
  subtitle,
  animate = true,
}) => {
  const [animatedValues, setAnimatedValues] = useState(
    data.map((item) => ({ ...item, currentValue: 0 }))
  );

  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animate) {
      const duration = 1000;
      const startTime = performance.now();

      const animateValues = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const newValues = data.map((item) => ({
          ...item,
          currentValue: item.value * progress,
        }));

        setAnimatedValues(newValues);

        if (progress < 1) {
          requestAnimationFrame(animateValues);
        }
      };

      requestAnimationFrame(animateValues);
    } else {
      setAnimatedValues(
        data.map((item) => ({ ...item, currentValue: item.value }))
      );
    }
  }, [data, animate]);

  const getSegmentPath = (startAngle, endAngle, radius) => {
    const start = {
      x: center + radius * Math.cos(startAngle),
      y: center + radius * Math.sin(startAngle),
    };
    const end = {
      x: center + radius * Math.cos(endAngle),
      y: center + radius * Math.sin(endAngle),
    };
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}
    `;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2; // Start at top

  return (
    <div className="circular-progress-container">
      <div className="circular-progress-header">
        <h3 className="circular-progress-title">{title}</h3>
        {subtitle && <p className="circular-progress-subtitle">{subtitle}</p>}
      </div>

      <div className="circular-progress-visualization">
        <svg width={size} height={size} className="circular-progress-svg">
          {/* Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="progress-background"
            strokeWidth={thickness}
          />

          {/* Progress Segments */}
          {animatedValues.map((item, index) => {
            const segmentAngle = (2 * Math.PI * item.currentValue) / total;
            const path = getSegmentPath(
              currentAngle,
              currentAngle + segmentAngle,
              radius
            );
            const segmentCenter = {
              x:
                center +
                (radius - thickness) *
                  Math.cos(currentAngle + segmentAngle / 2),
              y:
                center +
                (radius - thickness) *
                  Math.sin(currentAngle + segmentAngle / 2),
            };

            const segment = (
              <g key={index} className="progress-segment">
                <path
                  d={path}
                  stroke={item.color}
                  strokeWidth={thickness - gap}
                  className="segment-path"
                />
                {item.currentValue / total > 0.1 && (
                  <text
                    x={segmentCenter.x}
                    y={segmentCenter.y}
                    className="segment-label"
                    style={{ fill: item.color }}
                  >
                    {Math.round((item.currentValue / total) * 100)}%
                  </text>
                )}
              </g>
            );

            currentAngle += segmentAngle;
            return segment;
          })}

          {/* Center Content */}
          <text x={center} y={center - 10} className="total-label">
            Total
          </text>
          <text x={center} y={center + 20} className="total-value">
            {total.toLocaleString()}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="circular-progress-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            />
            <span className="legend-label">{item.label}</span>
            <span className="legend-value">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
