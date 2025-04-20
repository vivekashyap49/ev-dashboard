import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./PolarArea.css";

export const PolarArea = ({
  data,
  width = 800,
  height = 800,
  title,
  subtitle,
  colors,
  innerRadius = 50,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
}) => {
  const [segments, setSegments] = useState([]);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayout();
  }, [data, width, height]);

  const computeLayout = () => {
    const radius =
      Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ) / 2;

    // Create scale for radius
    const radiusScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([innerRadius, radius]);

    // Create scale for angles
    const angleScale = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI]);

    // Compute segments
    const computedSegments = data.map((d, i) => {
      const startAngle = angleScale(i);
      const endAngle = angleScale(i + 1);
      const outerRadius = radiusScale(d.value);

      return {
        ...d,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius,
        color: colors[i % colors.length],
      };
    });

    setSegments(computedSegments);
  };

  const createArcPath = (segment) => {
    const arc = d3
      .arc()
      .innerRadius(segment.innerRadius)
      .outerRadius(segment.outerRadius)
      .startAngle(segment.startAngle)
      .endAngle(segment.endAngle)
      .padAngle(0.02)
      .padRadius(innerRadius);

    return arc();
  };

  const createAxisPath = (segment) => {
    const angle = (segment.startAngle + segment.endAngle) / 2;
    const radius = segment.outerRadius + 20;

    return `M 0 0 L ${radius * Math.cos(angle)} ${radius * Math.sin(angle)}`;
  };

  const getSegmentTransform = () => {
    return `translate(${width / 2}, ${height / 2})`;
  };

  const getLabelPosition = (segment) => {
    const angle = (segment.startAngle + segment.endAngle) / 2;
    const radius = segment.outerRadius + 30;

    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  };

  return (
    <div className="polar-area-container">
      <div className="polar-area-header">
        <h3 className="polar-area-title">{title}</h3>
        {subtitle && <p className="polar-area-subtitle">{subtitle}</p>}
      </div>

      <div className="polar-area-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="polar-area-svg"
        >
          <g transform={getSegmentTransform()}>
            {/* Grid circles */}
            {d3.range(4).map((i) => (
              <circle
                key={`grid-${i}`}
                r={innerRadius + (i + 1) * ((width / 2 - innerRadius) / 4)}
                className="grid-circle"
                fill="none"
              />
            ))}

            {/* Segments */}
            {segments.map((segment, i) => (
              <g
                key={i}
                className={`segment-group ${
                  hoveredSegment === segment ? "hovered" : ""
                } ${selectedSegment === segment ? "selected" : ""}`}
                onMouseEnter={() => setHoveredSegment(segment)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() =>
                  setSelectedSegment(
                    selectedSegment === segment ? null : segment
                  )
                }
              >
                <path
                  d={createArcPath(segment)}
                  fill={segment.color}
                  className="segment-path"
                />

                {/* Axis line */}
                <path d={createAxisPath(segment)} className="axis-line" />

                {/* Label */}
                <g
                  transform={`translate(${getLabelPosition(segment).x},
                                      ${getLabelPosition(segment).y})`}
                >
                  <text
                    className="segment-label"
                    textAnchor={
                      getLabelPosition(segment).x > 0 ? "start" : "end"
                    }
                    dy=".35em"
                  >
                    {segment.label}
                  </text>
                </g>
              </g>
            ))}

            {/* Center circle */}
            <circle r={innerRadius} className="center-circle" />
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredSegment && (
          <div className="polar-area-tooltip">
            <div className="tooltip-header">{hoveredSegment.label}</div>
            <div className="tooltip-content">
              <div className="value-row">
                <span>Value:</span>
                <span>{hoveredSegment.value.toLocaleString()}</span>
              </div>
              {hoveredSegment.metadata &&
                Object.entries(hoveredSegment.metadata).map(([key, value]) => (
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
      <div className="polar-area-legend">
        {segments.map((segment, i) => (
          <div
            key={i}
            className={`legend-item ${
              hoveredSegment === segment ? "hovered" : ""
            } ${selectedSegment === segment ? "selected" : ""}`}
            onMouseEnter={() => setHoveredSegment(segment)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() =>
              setSelectedSegment(selectedSegment === segment ? null : segment)
            }
          >
            <div
              className="legend-color"
              style={{ backgroundColor: segment.color }}
            />
            <div className="legend-content">
              <span className="legend-label">{segment.label}</span>
              <span className="legend-value">
                {segment.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
