import React, { useState, useEffect } from "react";
import "./Sunburst.css";

export const Sunburst = ({
  data,
  width = 600,
  height = 600,
  colors,
  title,
  subtitle,
}) => {
  const [paths, setPaths] = useState([]);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2;
  const minAngle = 0.005;

  useEffect(() => {
    calculateLayout(data);
  }, [data]);

  const calculateLayout = (
    node,
    startAngle = 0,
    parentRadius = 0,
    level = 0
  ) => {
    const newPaths = [];
    const angleRatio = (Math.PI * 2) / node.value;
    let currentAngle = startAngle;

    const processNode = (child, start) => {
      const angle = Math.max(child.value * angleRatio, minAngle);
      const path = {
        startAngle: start,
        endAngle: start + angle,
        innerRadius: level * (radius / 10),
        outerRadius: (level + 1) * (radius / 10),
        value: child.value,
        data: child,
        level,
      };

      newPaths.push(path);

      if (child.children) {
        calculateLayout(child, start, (level + 1) * (radius / 10), level + 1);
      }

      return angle;
    };

    if (node.children) {
      node.children.forEach((child) => {
        currentAngle += processNode(child, currentAngle);
      });
    }

    setPaths(newPaths);
  };

  const createArcPath = (path) => {
    const startAngle = path.startAngle - Math.PI / 2;
    const endAngle = path.endAngle - Math.PI / 2;

    const start = {
      x: center.x + Math.cos(startAngle) * path.innerRadius,
      y: center.y + Math.sin(startAngle) * path.innerRadius,
    };

    const end = {
      x: center.x + Math.cos(endAngle) * path.innerRadius,
      y: center.y + Math.sin(endAngle) * path.innerRadius,
    };

    const outerStart = {
      x: center.x + Math.cos(startAngle) * path.outerRadius,
      y: center.y + Math.sin(startAngle) * path.outerRadius,
    };

    const outerEnd = {
      x: center.x + Math.cos(endAngle) * path.outerRadius,
      y: center.y + Math.sin(endAngle) * path.outerRadius,
    };

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${path.innerRadius} ${path.innerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
      L ${outerEnd.x} ${outerEnd.y}
      A ${path.outerRadius} ${path.outerRadius} 0 ${largeArcFlag} 0 ${outerStart.x} ${outerStart.y}
      Z
    `;
  };

  const handlePathClick = (path) => {
    const newBreadcrumbs = [];
    let current = path.data;

    while (current) {
      newBreadcrumbs.unshift(current);
      current = current.parent;
    }

    setBreadcrumbs(newBreadcrumbs);
  };

  const getColor = (path) => {
    const baseColor = colors[path.level % colors.length];
    const hue = parseInt(baseColor.slice(1), 16);
    const shade = (path.startAngle / (Math.PI * 2)) * 20 - 10;

    return `hsl(${hue}, ${Math.max(0, Math.min(100, 70 + shade))}%, ${Math.max(
      0,
      Math.min(100, 50 + shade)
    )}%)`;
  };

  return (
    <div className="sunburst-container">
      <div className="sunburst-header">
        <h3 className="sunburst-title">{title}</h3>
        {subtitle && <p className="sunburst-subtitle">{subtitle}</p>}
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="sunburst-breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="breadcrumb-separator">/</span>}
              <span className="breadcrumb-item">{crumb.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="sunburst-visualization">
        <svg viewBox={`0 0 ${width} ${height}`} className="sunburst-svg">
          {paths.map((path, i) => (
            <path
              key={i}
              d={createArcPath(path)}
              className={`sunburst-path ${
                hoveredPath === path ? "highlighted" : ""
              }`}
              fill={getColor(path)}
              onClick={() => handlePathClick(path)}
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
            />
          ))}
        </svg>

        {/* Center Label */}
        {hoveredPath && (
          <div className="center-label">
            <div className="center-name">{hoveredPath.data.name}</div>
            <div className="center-value">
              {hoveredPath.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
