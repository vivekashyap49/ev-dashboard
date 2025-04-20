import React, { useState, useEffect } from "react";
import "./ParallelCoordinates.css";

export const ParallelCoordinates = ({
  data,
  dimensions,
  width = 800,
  height = 400,
  title,
  subtitle,
  colors = {
    default: "#3b82f6",
    highlight: "#10b981",
    muted: "rgba(148, 163, 184, 0.2)",
  },
}) => {
  const [scales, setScales] = useState({});
  const [hoveredLine, setHoveredLine] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [brushExtents, setBrushExtents] = useState({});
  const padding = { top: 40, right: 40, bottom: 40, left: 40 };
  const axisWidth =
    (width - padding.left - padding.right) / (dimensions.length - 1);

  useEffect(() => {
    // Calculate scales for each dimension
    const newScales = {};
    dimensions.forEach((dim) => {
      const values = data.map((d) => d[dim.key]);
      newScales[dim.key] = {
        min: dim.type === "number" ? Math.min(...values) : 0,
        max: dim.type === "number" ? Math.max(...values) : values.length - 1,
        type: dim.type,
        categories: dim.type === "category" ? [...new Set(values)] : null,
      };
    });
    setScales(newScales);
  }, [data, dimensions]);

  const getY = (value, dimension) => {
    const scale = scales[dimension.key];
    if (!scale) return 0;

    const availableHeight = height - padding.top - padding.bottom;

    if (dimension.type === "number") {
      return (
        padding.top +
        availableHeight * (1 - (value - scale.min) / (scale.max - scale.min))
      );
    } else {
      const index = scale.categories.indexOf(value);
      return (
        padding.top + (index / (scale.categories.length - 1)) * availableHeight
      );
    }
  };

  const getPath = (item) => {
    return dimensions
      .map((dim, i) => {
        const x = padding.left + i * axisWidth;
        const y = getY(item[dim.key], dim);
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  };

  const handleMouseMove = (event, item) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Find closest dimension
    const dimensionIndex = Math.round((x - padding.left) / axisWidth);
    if (dimensionIndex >= 0 && dimensionIndex < dimensions.length) {
      setSelectedDimension(dimensions[dimensionIndex]);
    }

    setHoveredLine(item);
  };

  const handleBrush = (dimension, [start, end]) => {
    setBrushExtents((prev) => ({
      ...prev,
      [dimension.key]: [start, end],
    }));
  };

  const isLineFiltered = (item) => {
    return Object.entries(brushExtents).every(([key, [start, end]]) => {
      const value = item[key];
      const scale = scales[key];

      if (scale.type === "number") {
        return value >= start && value <= end;
      } else {
        const index = scale.categories.indexOf(value);
        return index >= start && index <= end;
      }
    });
  };

  return (
    <div className="parallel-coordinates-container">
      <div className="parallel-coordinates-header">
        <h3 className="parallel-coordinates-title">{title}</h3>
        {subtitle && (
          <p className="parallel-coordinates-subtitle">{subtitle}</p>
        )}
      </div>

      <div className="parallel-coordinates-visualization">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="parallel-coordinates-svg"
          onMouseLeave={() => {
            setHoveredLine(null);
            setSelectedDimension(null);
          }}
        >
          {/* Axes */}
          {dimensions.map((dim, i) => {
            const x = padding.left + i * axisWidth;
            return (
              <g key={dim.key} className="axis">
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  className="axis-line"
                />

                {/* Axis Labels */}
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  className="axis-label"
                  textAnchor="middle"
                >
                  {dim.label}
                </text>

                {/* Ticks */}
                {scales[dim.key]?.type === "number"
                  ? // Numeric ticks
                    Array.from({ length: 5 }).map((_, j) => {
                      const scale = scales[dim.key];
                      const value =
                        scale.min + (j / 4) * (scale.max - scale.min);
                      const y = getY(value, dim);
                      return (
                        <g key={j} className="tick">
                          <line
                            x1={x - 5}
                            y1={y}
                            x2={x + 5}
                            y2={y}
                            className="tick-line"
                          />
                          <text
                            x={x - 8}
                            y={y}
                            className="tick-label"
                            textAnchor="end"
                            alignmentBaseline="middle"
                          >
                            {value.toLocaleString()}
                          </text>
                        </g>
                      );
                    })
                  : // Categorical ticks
                    scales[dim.key]?.categories.map((category, j) => {
                      const y = getY(category, dim);
                      return (
                        <g key={category} className="tick">
                          <line
                            x1={x - 5}
                            y1={y}
                            x2={x + 5}
                            y2={y}
                            className="tick-line"
                          />
                          <text
                            x={x - 8}
                            y={y}
                            className="tick-label"
                            textAnchor="end"
                            alignmentBaseline="middle"
                          >
                            {category}
                          </text>
                        </g>
                      );
                    })}
              </g>
            );
          })}

          {/* Data Lines */}
          {data.map((item, i) => (
            <path
              key={i}
              d={getPath(item)}
              className={`data-line ${
                hoveredLine === item
                  ? "highlighted"
                  : !hoveredLine && isLineFiltered(item)
                  ? "active"
                  : "muted"
              }`}
              onMouseMove={(e) => handleMouseMove(e, item)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredLine && selectedDimension && (
          <div
            className="parallel-coordinates-tooltip"
            style={{
              left: `${
                padding.left + dimensions.indexOf(selectedDimension) * axisWidth
              }px`,
              top: `${getY(
                hoveredLine[selectedDimension.key],
                selectedDimension
              )}px`,
            }}
          >
            <div className="tooltip-dimension">{selectedDimension.label}</div>
            <div className="tooltip-value">
              {hoveredLine[selectedDimension.key].toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
