import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./ParallelSets.css";

export const ParallelSets = ({
  data,
  dimensions,
  width = 900,
  height = 500,
  colors,
  title,
  subtitle,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
}) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !dimensions) return;
    computeLayout();
  }, [data, dimensions, width, height]);

  const computeLayout = () => {
    // Create dimension scale
    const xScale = d3
      .scalePoint()
      .domain(dimensions)
      .range([margin.left, width - margin.right]);

    // Process data for each dimension
    const dimensionNodes = dimensions
      .map((dim, i) => {
        const values = {};
        data.forEach((d) => {
          const val = d[dim];
          values[val] = (values[val] || 0) + 1;
        });

        // Calculate y positions
        let y = margin.top;
        const nodes = Object.entries(values).map(([key, value]) => {
          const node = {
            name: key,
            value,
            dimension: dim,
            dimensionIndex: i,
            x: xScale(dim),
            y,
            height:
              (value / data.length) * (height - margin.top - margin.bottom),
          };
          y += node.height;
          return node;
        });

        return nodes;
      })
      .flat();

    // Create links between dimensions
    const dimensionLinks = [];
    for (let i = 0; i < dimensions.length - 1; i++) {
      const dim1 = dimensions[i];
      const dim2 = dimensions[i + 1];

      const links = {};
      data.forEach((d) => {
        const key = `${d[dim1]}-${d[dim2]}`;
        links[key] = (links[key] || 0) + 1;
      });

      Object.entries(links).forEach(([key, value]) => {
        const [source, target] = key.split("-");
        const sourceNode = dimensionNodes.find(
          (n) => n.name === source && n.dimension === dim1
        );
        const targetNode = dimensionNodes.find(
          (n) => n.name === target && n.dimension === dim2
        );

        dimensionLinks.push({
          source: sourceNode,
          target: targetNode,
          value,
          sourceY: 0, // Will be calculated
          targetY: 0, // Will be calculated
          height: (value / data.length) * (height - margin.top - margin.bottom),
        });
      });
    }

    // Calculate vertical positions for links
    dimensions.forEach((dim, i) => {
      const dimNodes = dimensionNodes.filter((n) => n.dimension === dim);
      const dimLinks = dimensionLinks.filter(
        (l) => l.source.dimension === dim || l.target.dimension === dim
      );

      dimNodes.forEach((node) => {
        let y = node.y;

        // Source links
        const sourceLinks = dimLinks.filter((l) => l.source === node);
        sourceLinks.forEach((link) => {
          link.sourceY = y;
          y += link.height;
        });

        // Target links
        const targetLinks = dimLinks.filter((l) => l.target === node);
        y = node.y;
        targetLinks.forEach((link) => {
          link.targetY = y;
          y += link.height;
        });
      });
    });

    setNodes(dimensionNodes);
    setLinks(dimensionLinks);
  };

  const createLinkPath = (link) => {
    const x0 = link.source.x;
    const x1 = link.target.x;
    const xi = d3.interpolateNumber(x0, x1);
    const x2 = xi(0.33);
    const x3 = xi(0.66);

    return `M${x0},${link.sourceY}
            C${x2},${link.sourceY}
             ${x3},${link.targetY}
             ${x1},${link.targetY}
            L${x1},${link.targetY + link.height}
            C${x3},${link.targetY + link.height}
             ${x2},${link.sourceY + link.height}
             ${x0},${link.sourceY + link.height}
            Z`;
  };

  const getNodeColor = (node) => {
    return colors[node.dimensionIndex % colors.length];
  };

  const getLinkColor = (link) => {
    const color = d3.color(getNodeColor(link.source));
    return color.darker(0.5);
  };

  return (
    <div className="parallel-sets-container">
      <div className="parallel-sets-header">
        <h3 className="parallel-sets-title">{title}</h3>
        {subtitle && <p className="parallel-sets-subtitle">{subtitle}</p>}
      </div>

      <div className="parallel-sets-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="parallel-sets-svg"
        >
          {/* Links */}
          {links.map((link, i) => (
            <path
              key={i}
              d={createLinkPath(link)}
              className={`parallel-sets-link ${
                hoveredLink === link ? "hovered" : ""
              } ${
                hoveredNode &&
                (link.source === hoveredNode || link.target === hoveredNode)
                  ? "highlighted"
                  : ""
              }`}
              fill={getLinkColor(link)}
              onMouseEnter={() => setHoveredLink(link)}
              onMouseLeave={() => setHoveredLink(null)}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g
              key={i}
              transform={`translate(${node.x},${node.y})`}
              className={`parallel-sets-node ${
                hoveredNode === node ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                width={20}
                height={node.height}
                x={-10}
                className="node-rect"
                fill={getNodeColor(node)}
              />
              <text
                x={node.dimensionIndex === 0 ? -15 : 15}
                y={node.height / 2}
                className="node-label"
                textAnchor={node.dimensionIndex === 0 ? "end" : "start"}
              >
                {node.name}
              </text>
            </g>
          ))}

          {/* Dimension Labels */}
          {dimensions.map((dim, i) => (
            <text
              key={dim}
              x={nodes.find((n) => n.dimension === dim).x}
              y={margin.top - 20}
              className="dimension-label"
              textAnchor="middle"
            >
              {dim}
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {(hoveredNode || hoveredLink) && (
          <div className="parallel-sets-tooltip">
            {hoveredNode ? (
              <>
                <div className="tooltip-header">
                  {hoveredNode.dimension}: {hoveredNode.name}
                </div>
                <div className="tooltip-content">
                  Count: {hoveredNode.value}
                  <br />
                  Percentage:{" "}
                  {((hoveredNode.value / data.length) * 100).toFixed(1)}%
                </div>
              </>
            ) : (
              <>
                <div className="tooltip-header">
                  {hoveredLink.source.name} → {hoveredLink.target.name}
                </div>
                <div className="tooltip-content">
                  Count: {hoveredLink.value}
                  <br />
                  Percentage:{" "}
                  {((hoveredLink.value / data.length) * 100).toFixed(1)}%
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
