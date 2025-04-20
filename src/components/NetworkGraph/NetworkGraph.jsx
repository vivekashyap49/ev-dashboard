import React, { useEffect, useRef, useState } from "react";
import "./NetworkGraph.css";

export const NetworkGraph = ({
  nodes,
  links,
  width = 800,
  height = 600,
  title,
  subtitle,
  nodeColors = {},
  nodeSizes = {},
  animated = true,
}) => {
  const svgRef = useRef(null);
  const [simulation, setSimulation] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize force simulation
    const simulation = {
      nodes: [...nodes],
      links: [...links],
      tick: () => updatePositions(),
    };

    // Set initial positions
    simulation.nodes.forEach((node) => {
      node.x = Math.random() * width;
      node.y = Math.random() * height;
      node.vx = 0;
      node.vy = 0;
    });

    setSimulation(simulation);

    if (animated) {
      startAnimation();
    }

    return () => {
      if (animated) {
        stopAnimation();
      }
    };
  }, [nodes, links, width, height]);

  const startAnimation = () => {
    let animationFrameId;

    const animate = () => {
      if (simulation) {
        // Apply forces
        applyForces();
        // Update positions
        simulation.tick();
        // Request next frame
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  const applyForces = () => {
    if (!simulation) return;

    const k = Math.sqrt((width * height) / simulation.nodes.length);

    // Apply repulsive forces between nodes
    simulation.nodes.forEach((node1) => {
      simulation.nodes.forEach((node2) => {
        if (node1 !== node2) {
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const force = (k * k) / distance;
            node1.vx -= (dx * force) / distance;
            node1.vy -= (dy * force) / distance;
            node2.vx += (dx * force) / distance;
            node2.vy += (dy * force) / distance;
          }
        }
      });
    });

    // Apply attractive forces along links
    simulation.links.forEach((link) => {
      const source = simulation.nodes[link.source];
      const target = simulation.nodes[link.target];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const force = distance * 0.1;
        source.vx += (dx * force) / distance;
        source.vy += (dy * force) / distance;
        target.vx -= (dx * force) / distance;
        target.vy -= (dy * force) / distance;
      }
    });

    // Update velocities and positions
    simulation.nodes.forEach((node) => {
      node.vx *= 0.9;
      node.vy *= 0.9;
      node.x += node.vx;
      node.y += node.vy;

      // Keep nodes within bounds
      node.x = Math.max(30, Math.min(width - 30, node.x));
      node.y = Math.max(30, Math.min(height - 30, node.y));
    });
  };

  const updatePositions = () => {
    if (!svgRef.current || !simulation) return;

    const svg = svgRef.current;

    // Update links
    const links = svg.querySelectorAll(".network-link");
    simulation.links.forEach((link, i) => {
      const source = simulation.nodes[link.source];
      const target = simulation.nodes[link.target];
      links[i].setAttribute("x1", source.x);
      links[i].setAttribute("y1", source.y);
      links[i].setAttribute("x2", target.x);
      links[i].setAttribute("y2", target.y);
    });

    // Update nodes
    const nodes = svg.querySelectorAll(".network-node");
    simulation.nodes.forEach((node, i) => {
      nodes[i].setAttribute("transform", `translate(${node.x},${node.y})`);
    });
  };

  const handleNodeClick = (node, index) => {
    setSelectedNode(selectedNode === index ? null : index);
  };

  return (
    <div className="network-container">
      <div className="network-header">
        <h3 className="network-title">{title}</h3>
        {subtitle && <p className="network-subtitle">{subtitle}</p>}
      </div>

      <div className="network-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="network-svg"
        >
          {/* Links */}
          {simulation?.links.map((link, i) => (
            <line
              key={i}
              className={`network-link ${
                selectedNode !== null &&
                (link.source === selectedNode || link.target === selectedNode)
                  ? "highlighted"
                  : ""
              }`}
            />
          ))}

          {/* Nodes */}
          {simulation?.nodes.map((node, i) => (
            <g
              key={i}
              className={`network-node ${selectedNode === i ? "selected" : ""}`}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node, i)}
            >
              <circle
                r={nodeSizes[node.type] || 6}
                fill={nodeColors[node.type] || "#3b82f6"}
              />
              <text
                className="node-label"
                dy=".35em"
                y={nodeSizes[node.type] + 8 || 14}
              >
                {node.label}
              </text>

              {hoveredNode === i && (
                <g className="node-tooltip">
                  <rect
                    x="-60"
                    y="-45"
                    width="120"
                    height="35"
                    rx="4"
                    className="tooltip-bg"
                  />
                  <text
                    x="0"
                    y="-25"
                    className="tooltip-text"
                    textAnchor="middle"
                  >
                    <tspan x="0" dy="0">
                      {node.label}
                    </tspan>
                    <tspan x="0" dy="15">
                      {node.value?.toLocaleString() || ""}
                    </tspan>
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="network-legend">
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="legend-item">
            <div
              className="legend-color"
              style={{
                backgroundColor: color,
                width: nodeSizes[type] * 2 || 12,
                height: nodeSizes[type] * 2 || 12,
              }}
            />
            <span className="legend-label">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
