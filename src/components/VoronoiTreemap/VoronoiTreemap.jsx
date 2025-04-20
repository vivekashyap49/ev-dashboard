import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./VoronoiTreemap.css";

export const VoronoiTreemap = ({
  data,
  width = 800,
  height = 600,
  colors,
  title,
  subtitle,
  padding = 2,
}) => {
  const [cells, setCells] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [zoomedNode, setZoomedNode] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayout();
  }, [data, width, height]);

  const computeLayout = () => {
    // Prepare data hierarchy
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // Create polygon for the container
    const polygon = createRegularPolygon(
      width / 2,
      height / 2,
      Math.min(width, height) / 2,
      6
    );

    // Compute the treemap layout
    const treemap = d3
      .treemap()
      .size([width, height])
      .padding(padding)
      .round(true);

    treemap(root);

    // Convert treemap to Voronoi cells
    const voronoiCells = root.descendants().map((node) => ({
      x: node.x0 + (node.x1 - node.x0) / 2,
      y: node.y0 + (node.y1 - node.y0) / 2,
      width: node.x1 - node.x0,
      height: node.y1 - node.y0,
      data: node.data,
      value: node.value,
      depth: node.depth,
      parent: node.parent,
      children: node.children,
    }));

    setCells(voronoiCells);
  };

  const createRegularPolygon = (centerX, centerY, radius, sides) => {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
      ]);
    }
    return points;
  };

  const getCellPath = (cell) => {
    const x0 = cell.x - cell.width / 2;
    const x1 = cell.x + cell.width / 2;
    const y0 = cell.y - cell.height / 2;
    const y1 = cell.y + cell.height / 2;

    return `M ${x0} ${y0}
            L ${x1} ${y0}
            L ${x1} ${y1}
            L ${x0} ${y1}
            Z`;
  };

  const getColor = (cell) => {
    const baseColor = colors[cell.depth % colors.length];
    const brightness = 100 - cell.depth * 10;
    return d3.color(baseColor).brighter(brightness / 100);
  };

  const handleCellClick = (cell) => {
    if (cell.children) {
      setZoomedNode(zoomedNode === cell ? null : cell);
    }
  };

  const getTransform = (cell) => {
    if (!zoomedNode) return "";

    const scale = Math.min(
      width / (zoomedNode.width || 1),
      height / (zoomedNode.height || 1)
    );

    const translateX = width / 2 - zoomedNode.x * scale;
    const translateY = height / 2 - zoomedNode.y * scale;

    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  return (
    <div className="voronoi-treemap-container">
      <div className="voronoi-treemap-header">
        <h3 className="voronoi-treemap-title">{title}</h3>
        {subtitle && <p className="voronoi-treemap-subtitle">{subtitle}</p>}
      </div>

      <div className="voronoi-treemap-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="voronoi-treemap-svg"
        >
          <g style={{ transform: getTransform() }}>
            {cells.map((cell, i) => (
              <g key={i} className="cell-group">
                <path
                  d={getCellPath(cell)}
                  className={`voronoi-cell ${
                    hoveredCell === cell ? "hovered" : ""
                  }`}
                  fill={getColor(cell)}
                  onClick={() => handleCellClick(cell)}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                />
                {cell.width > 50 && cell.height > 30 && (
                  <text
                    x={cell.x}
                    y={cell.y}
                    className="cell-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {cell.data.name}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>

        {hoveredCell && (
          <div
            className="voronoi-tooltip"
            style={{
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y}px`,
            }}
          >
            <div className="tooltip-header">{hoveredCell.data.name}</div>
            <div className="tooltip-value">
              {hoveredCell.value.toLocaleString()}
            </div>
            {hoveredCell.data.metadata && (
              <div className="tooltip-metadata">
                {Object.entries(hoveredCell.data.metadata).map(
                  ([key, value]) => (
                    <div key={key} className="metadata-row">
                      <span className="metadata-key">{key}:</span>
                      <span className="metadata-value">{value}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="voronoi-treemap-legend">
        {Array.from(new Set(cells.map((cell) => cell.depth))).map((depth) => (
          <div key={depth} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: colors[depth % colors.length] }}
            />
            <span className="legend-label">Level {depth + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
