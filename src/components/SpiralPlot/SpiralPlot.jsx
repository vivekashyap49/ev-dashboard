import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./SpiralPlot.css";

export const SpiralPlot = ({
  data,
  width = 800,
  height = 800,
  title,
  subtitle,
  colors,
  cycles = 12, // Number of cycles (e.g., months in a year)
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
}) => {
  const [points, setPoints] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayout();
  }, [data, width, height, cycles]);

  const computeLayout = () => {
    const radius =
      Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ) / 2;

    // Create scales
    const valueScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([0, radius]);

    // Compute spiral points
    const computedPoints = data.map((d, i) => {
      const cycle = Math.floor(i / cycles);
      const angle = (i % cycles) * ((2 * Math.PI) / cycles);
      const spiralRadius = (cycle + 1) * (radius / (data.length / cycles));
      const scaledRadius = spiralRadius + valueScale(d.value);

      return {
        ...d,
        x: scaledRadius * Math.cos(angle),
        y: scaledRadius * Math.sin(angle),
        angle,
        radius: scaledRadius,
        cycle,
        cyclePosition: i % cycles,
      };
    });

    setPoints(computedPoints);
  };

  const createSpiral = () => {
    return d3
      .lineRadial()
      .angle((d) => d.angle)
      .radius((d) => d.radius)
      .curve(d3.curveCardinal.tension(0.5));
  };

  const getPointColor = (point) => {
    if (selectedCycle !== null && point.cycle !== selectedCycle) {
      return d3.color(colors[point.cyclePosition % colors.length]).darker(1);
    }
    return colors[point.cyclePosition % colors.length];
  };

  return (
    <div className="spiral-plot-container">
      <div className="spiral-plot-header">
        <h3 className="spiral-plot-title">{title}</h3>
        {subtitle && <p className="spiral-plot-subtitle">{subtitle}</p>}
      </div>

      <div className="spiral-plot-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="spiral-plot-svg"
        >
          <g transform={`translate(${width / 2},${height / 2})`}>
            {/* Background circles */}
            {d3.range(data.length / cycles).map((_, i) => (
              <circle
                key={`circle-${i}`}
                r={
                  (i + 1) *
                  (Math.min(width, height) / 2 / (data.length / cycles))
                }
                className="background-circle"
              />
            ))}

            {/* Radial grid lines */}
            {d3.range(cycles).map((_, i) => {
              const angle = (i * 2 * Math.PI) / cycles;
              const radius = Math.min(width, height) / 2 - margin.top;
              return (
                <line
                  key={`grid-${i}`}
                  x1={0}
                  y1={0}
                  x2={radius * Math.cos(angle)}
                  y2={radius * Math.sin(angle)}
                  className="grid-line"
                />
              );
            })}

            {/* Data points */}
            {points.map((point, i) => (
              <g
                key={i}
                transform={`translate(${point.x},${point.y})`}
                className={`point-group ${
                  hoveredPoint === point ? "hovered" : ""
                } ${selectedCycle === point.cycle ? "selected" : ""}`}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() =>
                  setSelectedCycle(
                    selectedCycle === point.cycle ? null : point.cycle
                  )
                }
              >
                <circle
                  r={4}
                  className="data-point"
                  fill={getPointColor(point)}
                />
              </g>
            ))}

            {/* Value path */}
            <path
              d={createSpiral()(points)}
              className="value-path"
              fill="none"
              stroke={colors[0]}
            />
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div className="spiral-plot-tooltip">
            <div className="tooltip-header">{hoveredPoint.label}</div>
            <div className="tooltip-content">
              <div className="value-row">
                <span>Value:</span>
                <span>{hoveredPoint.value.toLocaleString()}</span>
              </div>
              <div className="cycle-row">
                <span>Cycle:</span>
                <span>{hoveredPoint.cycle + 1}</span>
              </div>
              {hoveredPoint.metadata &&
                Object.entries(hoveredPoint.metadata).map(([key, value]) => (
                  <div key={key} className="metadata-row">
                    <span>{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="spiral-plot-legend">
        {d3.range(cycles).map((i) => (
          <div key={i} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="legend-label">{`Cycle Position ${i + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
