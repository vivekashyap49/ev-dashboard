import React, { useState, useEffect } from "react";
import "./SankeyDiagram.css";

export const SankeyDiagram = ({
  data,
  width = 800,
  height = 400,
  nodePadding = 10,
  title,
  subtitle,
}) => {
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    // Calculate node positions and link paths
    const nodes = [
      ...new Set([...data.map((d) => d.source), ...data.map((d) => d.target)]),
    ].map((id) => ({ id }));

    const links = data.map((d) => ({
      source: nodes.findIndex((n) => n.id === d.source),
      target: nodes.findIndex((n) => n.id === d.target),
      value: d.value,
    }));

    // Calculate node values
    nodes.forEach((node) => {
      node.sourceLinks = links.filter((l) => l.source === nodes.indexOf(node));
      node.targetLinks = links.filter((l) => l.target === nodes.indexOf(node));
      node.value = Math.max(
        node.sourceLinks.reduce((sum, l) => sum + l.value, 0),
        node.targetLinks.reduce((sum, l) => sum + l.value, 0)
      );
    });

    // Assign x coordinates (columns)
    const columns = [];
    let remaining = [...nodes];
    while (remaining.length) {
      const column = remaining.filter((node) =>
        node.targetLinks.every((link) => nodes[link.source].x !== undefined)
      );
      column.forEach((node) => {
        node.x = columns.length;
        remaining = remaining.filter((n) => n !== node);
      });
      columns.push(column);
    }

    // Assign y coordinates
    columns.forEach((column) => {
      const columnHeight = height - nodePadding * (column.length - 1);
      let y = 0;
      column
        .sort((a, b) => b.value - a.value)
        .forEach((node) => {
          node.y = y;
          node.height =
            (node.value / column.reduce((sum, n) => sum + n.value, 0)) *
            columnHeight;
          y += node.height + nodePadding;
        });
    });

    // Calculate link paths
    links.forEach((link) => {
      const sourceNode = nodes[link.source];
      const targetNode = nodes[link.target];

      link.path = `
        M ${sourceNode.x * (width / (columns.length - 1))} ${
        sourceNode.y + sourceNode.height / 2
      }
        C ${(sourceNode.x + 0.5) * (width / (columns.length - 1))} ${
        sourceNode.y + sourceNode.height / 2
      },
          ${(targetNode.x - 0.5) * (width / (columns.length - 1))} ${
        targetNode.y + targetNode.height / 2
      },
          ${targetNode.x * (width / (columns.length - 1))} ${
        targetNode.y + targetNode.height / 2
      }
      `;
    });

    setLayout({ nodes, links, columns });
  }, [data, width, height, nodePadding]);

  if (!layout) return null;

  return (
    <div className="sankey-container">
      <div className="sankey-header">
        <h3 className="sankey-title">{title}</h3>
        {subtitle && <p className="sankey-subtitle">{subtitle}</p>}
      </div>

      <div className="sankey-visualization">
        <svg viewBox={`0 0 ${width} ${height}`} className="sankey-svg">
          {/* Links */}
          <g className="links">
            {layout.links.map((link, i) => (
              <path
                key={i}
                d={link.path}
                className="sankey-link"
                style={{
                  strokeWidth: Math.max(1, link.value),
                  opacity: 0.4,
                }}
              />
            ))}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {layout.nodes.map((node, i) => (
              <g
                key={i}
                transform={`translate(${
                  node.x * (width / (layout.columns.length - 1))
                },${node.y})`}
                className="sankey-node"
              >
                <rect width="20" height={node.height} className="node-rect" />
                <text
                  x={node.x < layout.columns.length / 2 ? 25 : -5}
                  y={node.height / 2}
                  textAnchor={
                    node.x < layout.columns.length / 2 ? "start" : "end"
                  }
                  alignmentBaseline="middle"
                  className="node-label"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
