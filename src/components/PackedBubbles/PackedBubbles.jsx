import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./PackedBubbles.css";

export const PackedBubbles = ({
  data,
  width = 800,
  height = 600,
  title,
  subtitle,
  colors,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
}) => {
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    initializeSimulation();
  }, [data, width, height]);

  const initializeSimulation = () => {
    // Create hierarchy and pack layout
    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const pack = d3
      .pack()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])
      .padding(3);

    const packedData = pack(root);

    // Create force simulation
    const sim = d3
      .forceSimulation(packedData.descendants())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "charge",
        d3.forceManyBody().strength((d) => d.r * -1)
      )
      .force(
        "collide",
        d3.forceCollide().radius((d) => d.r + 1)
      )
      .on("tick", () => {
        setNodes([...sim.nodes()]);
      });

    setSimulation(sim);
    setNodes(packedData.descendants());
  };

  const getNodeColor = (node) => {
    if (selectedNode) {
      if (node === selectedNode) return colors[node.depth];
      if (isRelated(node, selectedNode)) return colors[node.depth];
      return "#ddd";
    }
    return colors[node.depth];
  };

  const isRelated = (node1, node2) => {
    return (
      node1.ancestors().includes(node2) || node2.ancestors().includes(node1)
    );
  };

  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode === node ? null : node);

    if (simulation) {
      simulation.alpha(0.3).restart();
    }
  };

  const getNodeOpacity = (node) => {
    if (!selectedNode) return 1;
    return isRelated(node, selectedNode) ? 1 : 0.3;
  };

  return (
    <div className="packed-bubbles-container">
      <div className="packed-bubbles-header">
        <h3 className="packed-bubbles-title">{title}</h3>
        {subtitle && <p className="packed-bubbles-subtitle">{subtitle}</p>}
      </div>

      <div className="packed-bubbles-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="packed-bubbles-svg"
        >
          {/* Background grid */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeOpacity="0.1"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g
              key={i}
              transform={`translate(${node.x},${node.y})`}
              className={`bubble-group ${
                hoveredNode === node ? "hovered" : ""
              } ${selectedNode === node ? "selected" : ""}`}
              style={{ opacity: getNodeOpacity(node) }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
            >
              <circle r={node.r} className="bubble" fill={getNodeColor(node)} />

              {node.r > 20 && (
                <text className="bubble-label" textAnchor="middle" dy=".3em">
                  {node.data.name}
                </text>
              )}

              {hoveredNode === node && node.r > 30 && (
                <text className="bubble-value" textAnchor="middle" dy="1.5em">
                  {node.value.toLocaleString()}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div className="packed-bubbles-tooltip">
            <div className="tooltip-header">{hoveredNode.data.name}</div>
            <div className="tooltip-content">
              <div className="value-row">
                <span>Value:</span>
                <span>{hoveredNode.value.toLocaleString()}</span>
              </div>
              <div className="depth-row">
                <span>Level:</span>
                <span>{hoveredNode.depth}</span>
              </div>
              {hoveredNode.data.metadata &&
                Object.entries(hoveredNode.data.metadata).map(
                  ([key, value]) => (
                    <div key={key} className="metadata-row">
                      <span>{key}:</span>
                      <span>{value}</span>
                    </div>
                  )
                )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="packed-bubbles-legend">
        {colors.map((color, i) => (
          <div key={i} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }} />
            <span className="legend-label">Level {i}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="packed-bubbles-controls">
        <button
          className="control-button"
          onClick={() => {
            if (simulation) {
              simulation.alpha(0.3).restart();
            }
          }}
        >
          Restart Simulation
        </button>
        <button
          className="control-button"
          onClick={() => setSelectedNode(null)}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};
