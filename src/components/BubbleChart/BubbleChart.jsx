import React, { useState } from "react";
import "./BubbleChart.css";

export const BubbleChart = ({
  data,
  xAxis,
  yAxis,
  sizeScale,
  colorScale,
  title,
  subtitle,
}) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);

  const xScale = (value) => {
    const padding = 40;
    const min = Math.min(...data.map((d) => d[xAxis.key]));
    const max = Math.max(...data.map((d) => d[xAxis.key]));
    return ((value - min) / (max - min)) * (800 - padding * 2) + padding;
  };

  const yScale = (value) => {
    const padding = 40;
    const min = Math.min(...data.map((d) => d[yAxis.key]));
    const max = Math.max(...data.map((d) => d[yAxis.key]));
    return (
      400 - (((value - min) / (max - min)) * (400 - padding * 2) + padding)
    );
  };

  const getBubbleSize = (value) => {
    const minSize = 10;
    const maxSize = 50;
    const min = Math.min(...data.map((d) => d[sizeScale.key]));
    const max = Math.max(...data.map((d) => d[sizeScale.key]));
    return ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
  };

  return (
    <div className="bubble-chart-container">
      <div className="bubble-chart-header">
        <h3 className="bubble-chart-title">{title}</h3>
        {subtitle && <p className="bubble-chart-subtitle">{subtitle}</p>}
      </div>

      <div className="bubble-chart-visualization">
        <svg viewBox="0 0 800 400" className="bubble-chart-svg">
          {/* Grid Lines */}
          <g className="grid-lines">
            {Array.from({ length: 10 }).map((_, i) => (
              <React.Fragment key={i}>
                <line
                  x1="40"
                  y1={40 + i * 35}
                  x2="760"
                  y2={40 + i * 35}
                  className="grid-line"
                />
                <line
                  x1={40 + i * 80}
                  y1="40"
                  x2={40 + i * 80}
                  y2="360"
                  className="grid-line"
                />
              </React.Fragment>
            ))}
          </g>

          {/* Axes */}
          <g className="axes">
            <line x1="40" y1="360" x2="760" y2="360" className="axis-line" />
            <line x1="40" y1="360" x2="40" y2="40" className="axis-line" />

            {/* X-Axis Labels */}
            {Array.from({ length: 6 }).map((_, i) => {
              const value = xAxis.min + (i * (xAxis.max - xAxis.min)) / 5;
              return (
                <text
                  key={i}
                  x={40 + i * 144}
                  y="380"
                  className="axis-label"
                  textAnchor="middle"
                >
                  {value.toLocaleString()}
                </text>
              );
            })}

            {/* Y-Axis Labels */}
            {Array.from({ length: 6 }).map((_, i) => {
              const value = yAxis.min + (i * (yAxis.max - yAxis.min)) / 5;
              return (
                <text
                  key={i}
                  x="30"
                  y={360 - i * 64}
                  className="axis-label"
                  textAnchor="end"
                  alignmentBaseline="middle"
                >
                  {value.toLocaleString()}
                </text>
              );
            })}
          </g>

          {/* Bubbles */}
          {data.map((item, index) => {
            const cx = xScale(item[xAxis.key]);
            const cy = yScale(item[yAxis.key]);
            const r = getBubbleSize(item[sizeScale.key]);
            const color = colorScale(item[colorScale.key]);

            return (
              <g key={index}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  className="bubble"
                  style={{
                    fill: color,
                    opacity: hoveredBubble === index ? 0.8 : 0.6,
                  }}
                  onMouseEnter={() => setHoveredBubble(index)}
                  onMouseLeave={() => setHoveredBubble(null)}
                />
                {hoveredBubble === index && (
                  <g className="bubble-tooltip">
                    <rect
                      x={cx + r + 5}
                      y={cy - 40}
                      width="120"
                      height="80"
                      rx="4"
                      className="tooltip-bg"
                    />
                    <text x={cx + r + 15} y={cy - 20} className="tooltip-text">
                      <tspan x={cx + r + 15} dy="0">
                        {item.label}
                      </tspan>
                      <tspan x={cx + r + 15} dy="20">{`${xAxis.label}: ${
                        item[xAxis.key]
                      }`}</tspan>
                      <tspan x={cx + r + 15} dy="20">{`${yAxis.label}: ${
                        item[yAxis.key]
                      }`}</tspan>
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="bubble-chart-legend">
        <div className="size-legend">
          <span className="legend-title">Size: {sizeScale.label}</span>
          <div className="size-indicators">
            {[0.25, 0.5, 1].map((scale, i) => (
              <div key={i} className="size-indicator">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={25 * scale}
                    className="legend-bubble"
                  />
                </svg>
                <span className="size-label">
                  {Math.round(sizeScale.max * scale).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
