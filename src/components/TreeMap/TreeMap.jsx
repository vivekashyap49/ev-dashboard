import React, { useState } from "react";
import "./TreeMap.css";

export const TreeMap = ({
  data,
  width = 800,
  height = 400,
  colorScale,
  title,
  subtitle,
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Calculate layout
  const calculateLayout = (node, x0, y0, x1, y1) => {
    const children = node.children || [];
    const total = children.reduce((sum, child) => sum + child.value, 0);

    let currentX = x0;
    let currentY = y0;

    const processedChildren = children.map((child) => {
      const ratio = child.value / total;
      const width = x1 - x0;
      const height = y1 - y0;
      const area = width * height;

      let childWidth, childHeight;
      if (width > height) {
        childWidth = width * ratio;
        childHeight = area / childWidth;
      } else {
        childHeight = height * ratio;
        childWidth = area / childHeight;
      }

      const childData = {
        ...child,
        x0: currentX,
        y0: currentY,
        x1: currentX + childWidth,
        y1: currentY + childHeight,
      };

      if (width > height) {
        currentX += childWidth;
      } else {
        currentY += childHeight;
      }

      return childData;
    });

    return {
      ...node,
      children: processedChildren,
    };
  };

  const layout = calculateLayout(data, 0, 0, width, height);

  return (
    <div className="treemap-container">
      <div className="treemap-header">
        <h3 className="treemap-title">{title}</h3>
        {subtitle && <p className="treemap-subtitle">{subtitle}</p>}
      </div>

      <div className="treemap-visualization">
        <svg width={width} height={height} className="treemap-svg">
          {layout.children.map((cell, index) => {
            const isHovered = hoveredCell === index;
            const cellWidth = cell.x1 - cell.x0;
            const cellHeight = cell.y1 - cell.y0;

            return (
              <g
                key={index}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                className="treemap-cell"
              >
                <rect
                  x={cell.x0}
                  y={cell.y0}
                  width={cellWidth}
                  height={cellHeight}
                  fill={colorScale(cell.value)}
                  className={`cell-rect ${isHovered ? "hovered" : ""}`}
                />

                {cellWidth > 60 && cellHeight > 30 && (
                  <g>
                    <text
                      x={cell.x0 + cellWidth / 2}
                      y={cell.y0 + cellHeight / 2 - 8}
                      className="cell-label"
                      textAnchor="middle"
                    >
                      {cell.name}
                    </text>
                    <text
                      x={cell.x0 + cellWidth / 2}
                      y={cell.y0 + cellHeight / 2 + 8}
                      className="cell-value"
                      textAnchor="middle"
                    >
                      {cell.value.toLocaleString()}
                    </text>
                  </g>
                )}

                {isHovered && (
                  <g className="cell-tooltip">
                    <rect
                      x={cell.x0 + cellWidth / 2 - 60}
                      y={cell.y0 - 40}
                      width="120"
                      height="35"
                      rx="4"
                      className="tooltip-bg"
                    />
                    <text
                      x={cell.x0 + cellWidth / 2}
                      y={cell.y0 - 20}
                      className="tooltip-text"
                      textAnchor="middle"
                    >
                      <tspan x={cell.x0 + cellWidth / 2} dy="0">
                        {cell.name}
                      </tspan>
                      <tspan x={cell.x0 + cellWidth / 2} dy="15">
                        {cell.value.toLocaleString()}
                      </tspan>
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="treemap-legend">
        <div className="value-scale">
          <span className="scale-label">Value Range:</span>
          <div className="scale-gradient">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="gradient-stop"
                style={{
                  backgroundColor: colorScale((i / 4) * layout.value),
                }}
              />
            ))}
          </div>
          <div className="scale-labels">
            <span>0</span>
            <span>{layout.value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
