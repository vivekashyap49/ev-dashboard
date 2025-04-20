import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Dendrogram.css";

export const Dendrogram = ({
  data,
  width = 800,
  height = 600,
  title,
  subtitle,
  orientation = "horizontal",
  nodeColor = "#4a90e2",
  linkColor = "#9ecae1",
  margin = { top: 40, right: 120, bottom: 40, left: 120 },
}) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayout();
  }, [data, width, height, orientation]);

  const computeLayout = () => {
    // Create hierarchy
    const root = d3
      .hierarchy(data)
      .sort((a, b) => d3.ascending(a.data.name, b.data.name));

    // Create tree layout
    const tree =
      orientation === "horizontal"
        ? d3
            .tree()
            .size([
              height - margin.top - margin.bottom,
              width - margin.left - margin.right,
            ])
        : d3
            .tree()
            .size([
              width - margin.left - margin.right,
              height - margin.top - margin.bottom,
            ]);

    // Compute the layout
    const treeData = tree(root);

    // Extract nodes and links
    setNodes(
      treeData.descendants().map((node) => ({
        ...node,
        x: orientation === "horizontal" ? node.x : node.y,
        y: orientation === "horizontal" ? node.y : node.x,
      }))
    );

    setLinks(
      treeData.links().map((link) => ({
        ...link,
        source: {
          ...link.source,
          x: orientation === "horizontal" ? link.source.x : link.source.y,
          y: orientation === "horizontal" ? link.source.y : link.source.x,
        },
        target: {
          ...link.target,
          x: orientation === "horizontal" ? link.target.x : link.target.y,
          y: orientation === "horizontal" ? link.target.y : link.target.x,
        },
      }))
    );
  };

  const createLinkPath = (link) => {
    return d3
      .linkHorizontal()
      .x((d) => d.y + margin.left)
      .y((d) => d.x + margin.top)({
      source: link.source,
      target: link.target,
    });
  };

  const toggleNode = (node) => {
    if (node.children) {
      node._children = node.children;
      node.children = null;
    } else {
      node.children = node._children;
      node._children = null;
    }
    computeLayout();
  };

  const getNodeRadius = (node) => {
    return node.children || node._children ? 6 : 4;
  };

  const getNodeColor = (node) => {
    if (selectedNode === node) return "#ff7f0e";
    if (hoveredNode === node) return "#1f77b4";
    return node.children || node._children ? nodeColor : "#fff";
  };

  return (
    <div className="dendrogram-container">
      <div className="dendrogram-header">
        <h3 className="dendrogram-title">{title}</h3>
        {subtitle && <p className="dendrogram-subtitle">{subtitle}</p>}
      </div>

      <div className="dendrogram-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="dendrogram-svg"
        >
          {/* Links */}
          {links.map((link, i) => (
            <path
              key={`link-${i}`}
              d={createLinkPath(link)}
              className={`dendrogram-link ${
                hoveredNode === link.source || hoveredNode === link.target
                  ? "highlighted"
                  : ""
              }`}
              stroke={linkColor}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g
              key={`node-${i}`}
              transform={`translate(${node.y + margin.left},${
                node.x + margin.top
              })`}
              className="node-group"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                setSelectedNode(selectedNode === node ? null : node);
                if (node.children || node._children) {
                  toggleNode(node);
                }
              }}
            >
              <circle
                r={getNodeRadius(node)}
                className={`dendrogram-node ${
                  node.children || node._children ? "has-children" : ""
                } ${selectedNode === node ? "selected" : ""}`}
                fill={getNodeColor(node)}
              />

              <text
                dx={node.children ? -8 : 8}
                dy=".31em"
                className={`node-label ${node.children ? "has-children" : ""}`}
                textAnchor={node.children ? "end" : "start"}
              >
                {node.data.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <div className="dendrogram-tooltip">
            <div className="tooltip-header">{hoveredNode.data.name}</div>
            {hoveredNode.data.metadata && (
              <div className="tooltip-content">
                {Object.entries(hoveredNode.data.metadata).map(
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

      {/* Legend */}
      <div className="dendrogram-legend">
        <div className="legend-item">
          <div className="legend-symbol parent-node" />
          <span className="legend-label">Parent Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-symbol leaf-node" />
          <span className="legend-label">Leaf Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-symbol selected-node" />
          <span className="legend-label">Selected Node</span>
        </div>
      </div>
    </div>
  );
};
