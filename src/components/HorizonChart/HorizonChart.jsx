import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./HorizonChart.css";

export const HorizonChart = ({
  data,
  width = 800,
  height = 400,
  title,
  subtitle,
  bands = 3,
  colors = {
    positive: ["#f7fbff", "#6baed6", "#2171b5"],
    negative: ["#fff5f0", "#fb6a4a", "#cb181d"],
  },
  margin = { top: 40, right: 40, bottom: 40, left: 60 },
}) => {
  const [layers, setLayers] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [domain, setDomain] = useState([0, 0]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayers();
  }, [data, width, height, bands]);

  const computeLayers = () => {
    // Find data extent
    const extent = d3.extent(data.values);
    const max = Math.max(Math.abs(extent[0]), Math.abs(extent[1]));
    setDomain([-max, max]);

    // Create band ranges
    const bandSize = max / bands;
    const bandRanges = Array.from({ length: bands }, (_, i) => ({
      min: i * bandSize,
      max: (i + 1) * bandSize,
    }));

    // Create layers for positive and negative values
    const positiveLayers = bandRanges.map((range) => ({
      values: data.values.map((v) =>
        v > range.min ? Math.min(v - range.min, bandSize) : 0
      ),
      range,
    }));

    const negativeLayers = bandRanges.map((range) => ({
      values: data.values.map((v) =>
        v < -range.min ? Math.min(-v - range.min, bandSize) : 0
      ),
      range,
    }));

    setLayers({
      positive: positiveLayers,
      negative: negativeLayers,
    });
  };

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data.timestamps))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, domain[1] / bands])
    .range([height / (2 * bands), 0]);

  const area = d3
    .area()
    .x((d, i) => xScale(data.timestamps[i]))
    .y0(height / (2 * bands))
    .y1((d) => yScale(d));

  return (
    <div className="horizon-chart-container">
      <div className="horizon-chart-header">
        <h3 className="horizon-chart-title">{title}</h3>
        {subtitle && <p className="horizon-chart-subtitle">{subtitle}</p>}
      </div>

      <div className="horizon-chart-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="horizon-chart-svg"
        >
          {/* Positive Layers */}
          {layers.positive?.map((layer, i) => (
            <g
              key={`positive-${i}`}
              transform={`translate(0,${i * (height / bands)})`}
            >
              <path
                d={area(layer.values)}
                className="horizon-layer"
                fill={colors.positive[i]}
                opacity={0.7}
              />
            </g>
          ))}

          {/* Negative Layers */}
          {layers.negative?.map((layer, i) => (
            <g
              key={`negative-${i}`}
              transform={`translate(0,${(i + bands) * (height / bands)})`}
            >
              <path
                d={area(layer.values)}
                className="horizon-layer"
                fill={colors.negative[i]}
                opacity={0.7}
              />
            </g>
          ))}

          {/* Axis */}
          <g transform={`translate(0,${height / 2})`}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              className="horizon-axis"
            />
          </g>

          {/* Interaction Layer */}
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            className="interaction-layer"
            onMouseMove={(e) => {
              const [x, y] = d3.pointer(e);
              const date = xScale.invert(x);
              const index = d3.bisector((d) => d).left(data.timestamps, date);
              setHoveredPoint({
                date,
                value: data.values[index],
                x,
                y,
              });
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          />

          {/* Time Axis */}
          {xScale.ticks(5).map((tick) => (
            <g
              key={tick.getTime()}
              transform={`translate(${xScale(tick)},${height - margin.bottom})`}
            >
              <line y2={5} className="tick-line" />
              <text y={20} className="tick-label" textAnchor="middle">
                {d3.timeFormat("%b %d")(tick)}
              </text>
            </g>
          ))}

          {/* Value Axis */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick}>
              <text
                x={margin.left - 10}
                y={height / 2 - yScale(tick)}
                className="tick-label"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {tick}
              </text>
              <text
                x={margin.left - 10}
                y={height / 2 + yScale(tick)}
                className="tick-label"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {-tick}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="horizon-chart-tooltip"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y,
            }}
          >
            <div className="tooltip-header">
              {d3.timeFormat("%B %d, %Y")(hoveredPoint.date)}
            </div>
            <div className="tooltip-content">
              Value: {hoveredPoint.value.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="horizon-chart-legend">
        <div className="legend-section">
          <span className="legend-title">Positive Values</span>
          <div className="legend-bands">
            {colors.positive.map((color, i) => (
              <div
                key={`positive-${i}`}
                className="legend-band"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="legend-section">
          <span className="legend-title">Negative Values</span>
          <div className="legend-bands">
            {colors.negative.map((color, i) => (
              <div
                key={`negative-${i}`}
                className="legend-band"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
