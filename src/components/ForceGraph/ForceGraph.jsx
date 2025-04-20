import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./ForceGraph.css";

export const ForceGraph = ({
  data,
  width = 800,
  height = 600,
  title,
  subtitle,
  nodeColors,
  linkColors,
  strengthFactor = 1,
}) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    initializeSimulation();
  }, [data, width, height]);

  const initializeSimulation = () => {
    // Create force simulation
    const sim = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance((d) => (100 / (d.weight || 1)) * strengthFactor)
      )
      .force("charge", d3.forceManyBody().strength(-100 * strengthFactor))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (d.size || 30) + 5)
      );

    // Update node positions on tick
    sim.on("tick", () => {
      setNodes([...sim.nodes()]);
      setLinks([...data.links]);
    });

    setSimulation(sim);
    setNodes(data.nodes);
    setLinks(data.links);
  };

  const getLinkPath = (link) => {
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);

    // Calculate offset for curved lines when there are multiple links
    const parallel = links.filter(
      (l) =>
        (l.source.id === link.source.id && l.target.id === link.target.id) ||
        (l.source.id === link.target.id && l.target.id === link.source.id)
    );

    if (parallel.length > 1) {
      const index = parallel.indexOf(link);
      const offset = (index - (parallel.length - 1) / 2) * 20;
      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;

      return `M ${link.source.x} ${link.source.y}
              Q ${midX + offset} ${midY + offset}
              ${link.target.x} ${link.target.y}`;
    }

    return `M ${link.source.x} ${link.source.y}
            L ${link.target.x} ${link.target.y}`;
  };

  const handleNodeDrag = (event, node) => {
    if (!simulation) return;

    node.fx = event.x;
    node.fy = event.y;
    simulation.alpha(0.3).restart();
  };

  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode === node ? null : node);

    if (simulation) {
      simulation.alpha(0.3).restart();
    }
  };

  const getNodeColor = (node) => {
    if (selectedNode) {
      const isConnected = links.some(
        (link) =>
          (link.source.id === selectedNode.id && link.target.id === node.id) ||
          (link.target.id === selectedNode.id && link.source.id === node.id)
      );
      return isConnected ? nodeColors[node.group] : "#ddd";
    }
    return nodeColors[node.group];
  };

  const getLinkColor = (link) => {
    if (selectedNode) {
      return link.source.id === selectedNode.id ||
        link.target.id === selectedNode.id
        ? linkColors[link.type]
        : "#eee";
    }
    return linkColors[link.type];
  };

  return (
    <div className="force-graph-container">
      <div className="force-graph-header">
        <h3 className="force-graph-title">{title}</h3>
        {subtitle && <p className="force-graph-subtitle">{subtitle}</p>}
      </div>

      <div className="force-graph-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="force-graph-svg"
        >
          {/* Links */}
          {links.map((link, i) => (
            <path
              key={`link-${i}`}
              d={getLinkPath(link)}
              className={`graph-link ${
                selectedNode &&
                (link.source.id === selectedNode.id ||
                  link.target.id === selectedNode.id)
                  ? "highlighted"
                  : ""
              }`}
              stroke={getLinkColor(link)}
              strokeWidth={link.weight || 1}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g
              key={`node-${i}`}
              transform={`translate(${node.x},${node.y})`}
              className="node-group"
            >
              <circle
                r={node.size || 30}
                className={`graph-node ${
                  hoveredNode === node ? "hovered" : ""
                } ${selectedNode === node ? "selected" : ""}`}
                fill={getNodeColor(node)}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              />
              {(node.size > 20 || hoveredNode === node) && (
                <text className="node-label" textAnchor="middle" dy=".35em">
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div
            className="force-graph-tooltip"
            style={{
              left: hoveredNode.x,
              top: hoveredNode.y,
            }}
          >
            <div className="tooltip-header">{hoveredNode.label}</div>
            {hoveredNode.metadata && (
              <div className="tooltip-metadata">
                {Object.entries(hoveredNode.metadata).map(([key, value]) => (
                  <div key={key} className="metadata-row">
                    <span className="metadata-key">{key}:</span>
                    <span className="metadata-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="force-graph-legend">
        <div className="legend-section">
          <h4 className="legend-title">Node Types</h4>
          <div className="legend-items">
            {Object.entries(nodeColors).map(([group, color]) => (
              <div key={group} className="legend-item">
                <div
                  className="legend-color node-color"
                  style={{ backgroundColor: color }}
                />
                <span className="legend-label">{group}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="legend-section">
          <h4 className="legend-title">Link Types</h4>
          <div className="legend-items">
            {Object.entries(linkColors).map(([type, color]) => (
              <div key={type} className="legend-item">
                <div
                  className="legend-color link-color"
                  style={{ backgroundColor: color }}
                />
                <span className="legend-label">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
