import React from "react";
import "./Heatmap.css";

export const Heatmap = ({
  data,
  xLabels,
  yLabels,
  colorScale,
  title,
  subtitle,
}) => {
  const maxValue = Math.max(...data.flat());
  const cellSize = 100 / Math.max(xLabels.length, yLabels.length);

  const getColor = (value) => {
    const intensity = value / maxValue;
    return colorScale(intensity);
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3 className="heatmap-title">{title}</h3>
        {subtitle && <p className="heatmap-subtitle">{subtitle}</p>}
      </div>

      <div className="heatmap-visualization">
        <div className="heatmap-grid">
          {/* Y-axis Labels */}
          <div className="y-labels">
            {yLabels.map((label, i) => (
              <div key={i} className="y-label">
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap Cells */}
          <div className="heatmap-cells">
            {data.map((row, i) => (
              <div key={i} className="heatmap-row">
                {row.map((value, j) => (
                  <div
                    key={j}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: getColor(value),
                      width: `${cellSize}%`,
                      height: `${cellSize}%`,
                    }}
                    data-value={value}
                  >
                    <div className="cell-tooltip">
                      <strong>{value.toLocaleString()}</strong>
                      <div>{`${yLabels[i]} - ${xLabels[j]}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* X-axis Labels */}
          <div className="x-labels">
            {xLabels.map((label, i) => (
              <div key={i} className="x-label">
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <div className="legend-gradient">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="legend-color"
                style={{
                  backgroundColor: colorScale(i / 4),
                }}
              />
            ))}
          </div>
          <div className="legend-labels">
            <span>0</span>
            <span>{maxValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
