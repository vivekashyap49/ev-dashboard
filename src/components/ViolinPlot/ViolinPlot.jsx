import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./ViolinPlot.css";

export const ViolinPlot = ({
  data,
  width = 800,
  height = 500,
  title,
  subtitle,
  colors,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
}) => {
  const [distributions, setDistributions] = useState([]);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeDistributions();
  }, [data, width, height]);

  const computeDistributions = () => {
    const groups = Object.keys(data);
    const allValues = groups.flatMap((group) => data[group]);

    // Calculate global scale
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allValues), d3.max(allValues)])
      .range([height - margin.bottom, margin.top]);

    const xScale = d3
      .scaleBand()
      .domain(groups)
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Compute kernel density estimation for each group
    const violinDistributions = groups.map((group) => {
      const values = data[group];
      const kde = kernelDensityEstimator(
        kernelEpanechnikov(7),
        yScale.ticks(50)
      );
      const density = kde(values);

      // Calculate statistics
      const stats = {
        group,
        min: d3.min(values),
        max: d3.max(values),
        median: d3.median(values),
        q1: d3.quantile(values, 0.25),
        q3: d3.quantile(values, 0.75),
        mean: d3.mean(values),
      };

      // Scale density values
      const maxDensity = d3.max(density, (d) => d[1]);
      const xMax = xScale.bandwidth() / 2;
      const scaledDensity = density.map(([y, d]) => [
        y,
        (d / maxDensity) * xMax,
      ]);

      return {
        group,
        density: scaledDensity,
        statistics: stats,
        x: xScale(group),
      };
    });

    setDistributions(violinDistributions);
    setStatistics(violinDistributions.map((d) => d.statistics));
  };

  const kernelDensityEstimator = (kernel, X) => {
    return function (V) {
      return X.map((x) => [x, d3.mean(V, (v) => kernel(x - v))]);
    };
  };

  const kernelEpanechnikov = (k) => {
    return (v) => (Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0);
  };

  const createViolinPath = (distribution) => {
    const x = distribution.x;
    const bandwidth = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .bandwidth();

    return d3.line().curve(d3.curveBasis)([
      ...distribution.density.map(([y, d]) => [x + d, y]),
      ...distribution.density.reverse().map(([y, d]) => [x - d, y]),
    ]);
  };

  const renderBoxPlot = (stats, x) => {
    const bandwidth = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .bandwidth();

    const boxWidth = bandwidth * 0.2;

    return (
      <g className="box-plot">
        {/* Vertical line from min to max */}
        <line
          x1={x}
          y1={yScale(stats.min)}
          x2={x}
          y2={yScale(stats.max)}
          className="box-plot-line"
        />

        {/* Box from Q1 to Q3 */}
        <rect
          x={x - boxWidth / 2}
          y={yScale(stats.q3)}
          width={boxWidth}
          height={yScale(stats.q1) - yScale(stats.q3)}
          className="box-plot-box"
        />

        {/* Median line */}
        <line
          x1={x - boxWidth / 2}
          y1={yScale(stats.median)}
          x2={x + boxWidth / 2}
          y2={yScale(stats.median)}
          className="box-plot-median"
        />

        {/* Mean point */}
        <circle
          cx={x}
          cy={yScale(stats.mean)}
          r={3}
          className="box-plot-mean"
        />
      </g>
    );
  };

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(Object.values(data).flat()),
      d3.max(Object.values(data).flat()),
    ])
    .range([height - margin.bottom, margin.top]);

  return (
    <div className="violin-plot-container">
      <div className="violin-plot-header">
        <h3 className="violin-plot-title">{title}</h3>
        {subtitle && <p className="violin-plot-subtitle">{subtitle}</p>}
      </div>

      <div className="violin-plot-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="violin-plot-svg"
        >
          {/* Y-axis */}
          <g className="y-axis">
            {yScale.ticks(10).map((tick) => (
              <g
                key={tick}
                transform={`translate(${margin.left}, ${yScale(tick)})`}
              >
                <line
                  x2={width - margin.left - margin.right}
                  className="grid-line"
                />
                <text x="-10" dy="0.32em" className="axis-label">
                  {tick}
                </text>
              </g>
            ))}
          </g>

          {/* Violin plots */}
          {distributions.map((distribution, i) => (
            <g
              key={i}
              className={`violin-group ${
                hoveredGroup === distribution.group ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredGroup(distribution.group)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <path
                d={createViolinPath(distribution)}
                fill={colors[i % colors.length]}
                className="violin-path"
              />
              {renderBoxPlot(distribution.statistics, distribution.x)}
            </g>
          ))}

          {/* X-axis */}
          <g transform={`translate(0, ${height - margin.bottom})`}>
            {distributions.map((distribution, i) => (
              <text
                key={i}
                x={distribution.x}
                y={25}
                className="x-axis-label"
                textAnchor="middle"
              >
                {distribution.group}
              </text>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredGroup && (
          <div className="violin-plot-tooltip">
            <div className="tooltip-header">{hoveredGroup}</div>
            <div className="tooltip-content">
              {(() => {
                const stats = statistics.find((s) => s.group === hoveredGroup);
                return (
                  <>
                    <div className="stat-row">
                      <span>Mean:</span>
                      <span>{stats.mean.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Median:</span>
                      <span>{stats.median.toFixed(2)}</span>
                    </div>
                    <div className="stat-row">
                      <span>Q1-Q3:</span>
                      <span>
                        {stats.q1.toFixed(2)} - {stats.q3.toFixed(2)}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>Range:</span>
                      <span>
                        {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="violin-plot-legend">
        <div className="legend-item">
          <div className="legend-symbol box-plot-symbol" />
          <span className="legend-label">Box Plot (Q1, Median, Q3)</span>
        </div>
        <div className="legend-item">
          <div className="legend-symbol mean-symbol" />
          <span className="legend-label">Mean</span>
        </div>
        <div className="legend-item">
          <div className="legend-symbol density-symbol" />
          <span className="legend-label">Density Distribution</span>
        </div>
      </div>
    </div>
  );
};
