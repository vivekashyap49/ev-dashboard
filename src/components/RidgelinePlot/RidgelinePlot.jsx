import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./RidgelinePlot.css";

export const RidgelinePlot = ({
  data,
  width = 800,
  height = 500,
  title,
  subtitle,
  colors,
  overlap = 0.7,
  bandwidth = 20,
  margin = { top: 40, right: 40, bottom: 40, left: 100 },
}) => {
  const [distributions, setDistributions] = useState([]);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [xDomain, setXDomain] = useState([0, 0]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeDistributions();
  }, [data, width, height, overlap, bandwidth]);

  const computeDistributions = () => {
    // Find global x domain
    const allValues = Object.values(data).flat();
    const domain = d3.extent(allValues);
    setXDomain(domain);

    // Compute kernel density estimation for each group
    const groups = Object.keys(data);
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), 100);

    const distributions = groups.map((group, i) => {
      const values = data[group];
      const density = kde(values);

      // Scale density values
      const maxDensity = d3.max(density, (d) => d[1]);
      const scaledDensity = density.map(([x, y]) => [x, y / maxDensity]);

      return {
        group,
        density: scaledDensity,
        color: colors[i % colors.length],
        index: i,
      };
    });

    setDistributions(distributions);
  };

  const kernelDensityEstimator = (kernel, n) => {
    return function (sample) {
      const min = d3.min(sample);
      const max = d3.max(sample);
      const x = d3.range(n).map((i) => min + (i / (n - 1)) * (max - min));
      const density = x.map((x) => [x, d3.mean(sample, (v) => kernel(x - v))]);
      return density;
    };
  };

  const kernelEpanechnikov = (k) => {
    return (v) => (Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0);
  };

  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scalePoint()
    .domain(distributions.map((d) => d.group))
    .range([margin.top, height - margin.bottom]);

  const area = d3
    .area()
    .x((d) => xScale(d[0]))
    .y0((d) => yScale.step() * overlap)
    .y1((d) => d[1] * yScale.step() * overlap)
    .curve(d3.curveBasis);

  return (
    <div className="ridgeline-plot-container">
      <div className="ridgeline-plot-header">
        <h3 className="ridgeline-plot-title">{title}</h3>
        {subtitle && <p className="ridgeline-plot-subtitle">{subtitle}</p>}
      </div>

      <div className="ridgeline-plot-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="ridgeline-plot-svg"
        >
          {/* Distributions */}
          {distributions.map((dist, i) => (
            <g
              key={i}
              transform={`translate(0,${yScale(dist.group)})`}
              className={`distribution-group ${
                hoveredGroup === dist.group ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredGroup(dist.group)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <path
                d={area(dist.density)}
                fill={dist.color}
                className="distribution-path"
              />

              <text
                x={margin.left - 10}
                y={(yScale.step() * overlap) / 2}
                className="group-label"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {dist.group}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <g transform={`translate(0,${height - margin.bottom})`}>
            {xScale.ticks(5).map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)},0)`}>
                <line y2={5} className="tick-line" />
                <text y={20} className="tick-label" textAnchor="middle">
                  {tick}
                </text>
              </g>
            ))}
          </g>

          {/* Interaction overlay */}
          {distributions.map((dist, i) => (
            <rect
              key={i}
              x={margin.left}
              y={yScale(dist.group) - (yScale.step() * overlap) / 2}
              width={width - margin.left - margin.right}
              height={yScale.step() * overlap}
              className="interaction-overlay"
              onMouseEnter={() => setHoveredGroup(dist.group)}
              onMouseLeave={() => setHoveredGroup(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredGroup && (
          <div className="ridgeline-tooltip">
            <div className="tooltip-header">{hoveredGroup}</div>
            <div className="tooltip-content">
              {(() => {
                const values = data[hoveredGroup];
                return (
                  <>
                    <div className="stat-row">
                      <span>Mean:</span>
                      <span>{d3.mean(values).toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Median:</span>
                      <span>{d3.median(values).toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Count:</span>
                      <span>{values.length}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="ridgeline-legend">
        {distributions.map((dist, i) => (
          <div
            key={i}
            className={`legend-item ${
              hoveredGroup === dist.group ? "hovered" : ""
            }`}
            onMouseEnter={() => setHoveredGroup(dist.group)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            <div
              className="legend-color"
              style={{ backgroundColor: dist.color }}
            />
            <span className="legend-label">{dist.group}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
