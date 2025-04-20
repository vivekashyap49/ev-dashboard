import React, { useState, useEffect } from "react";
import "./ChordDiagram.css";

export const ChordDiagram = ({
  data,
  labels,
  colors,
  width = 600,
  height = 600,
  padding = 20,
  title,
  subtitle,
}) => {
  const [paths, setPaths] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [hoveredChord, setHoveredChord] = useState(null);

  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - padding;
  const innerRadius = radius * 0.9;

  useEffect(() => {
    calculateLayout();
  }, [data, labels]);

  const calculateLayout = () => {
    // Calculate total for each group
    const groupTotals = data.map((row) =>
      row.reduce((sum, val) => sum + val, 0)
    );
    const total = groupTotals.reduce((sum, val) => sum + val, 0);

    // Calculate angles for each group
    let startAngle = 0;
    const groupAngles = groupTotals.map((groupTotal, i) => {
      const angle = (2 * Math.PI * groupTotal) / total;
      const arc = {
        index: i,
        startAngle,
        endAngle: startAngle + angle,
        value: groupTotal,
      };
      startAngle += angle;
      return arc;
    });

    // Calculate chord paths
    const chordPaths = [];
    data.forEach((row, i) => {
      row.forEach((value, j) => {
        if (i !== j && value > 0) {
          const sourceArc = groupAngles[i];
          const targetArc = groupAngles[j];

          const sourceStartAngle =
            sourceArc.startAngle +
            (sourceArc.endAngle - sourceArc.startAngle) *
              (row.slice(0, j).reduce((sum, val) => sum + val, 0) /
                sourceArc.value);

          const sourceEndAngle =
            sourceStartAngle +
            (sourceArc.endAngle - sourceArc.startAngle) *
              (value / sourceArc.value);

          const targetStartAngle =
            targetArc.startAngle +
            (targetArc.endAngle - targetArc.startAngle) *
              (data[j].slice(0, i).reduce((sum, val) => sum + val, 0) /
                targetArc.value);

          const targetEndAngle =
            targetStartAngle +
            (targetArc.endAngle - targetArc.startAngle) *
              (value / targetArc.value);

          chordPaths.push({
            source: {
              index: i,
              startAngle: sourceStartAngle,
              endAngle: sourceEndAngle,
            },
            target: {
              index: j,
              startAngle: targetStartAngle,
              endAngle: targetEndAngle,
            },
            value,
          });
        }
      });
    });

    setArcs(groupAngles);
    setPaths(chordPaths);
  };

  const createArcPath = (startAngle, endAngle, radius) => {
    const start = {
      x: center.x + Math.cos(startAngle) * radius,
      y: center.y + Math.sin(startAngle) * radius,
    };
    const end = {
      x: center.x + Math.cos(endAngle) * radius,
      y: center.y + Math.sin(endAngle) * radius,
    };

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${start.x} ${start.y} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const createChordPath = (chord) => {
    const source = {
      start: {
        x: center.x + Math.cos(chord.source.startAngle) * innerRadius,
        y: center.y + Math.sin(chord.source.startAngle) * innerRadius,
      },
      end: {
        x: center.x + Math.cos(chord.source.endAngle) * innerRadius,
        y: center.y + Math.sin(chord.source.endAngle) * innerRadius,
      },
    };

    const target = {
      start: {
        x: center.x + Math.cos(chord.target.startAngle) * innerRadius,
        y: center.y + Math.sin(chord.target.startAngle) * innerRadius,
      },
      end: {
        x: center.x + Math.cos(chord.target.endAngle) * innerRadius,
        y: center.y + Math.sin(chord.target.endAngle) * innerRadius,
      },
    };

    return `M ${source.start.x} ${source.start.y}
            A ${innerRadius} ${innerRadius} 0 0 1 ${source.end.x} ${source.end.y}
            Q ${center.x} ${center.y} ${target.start.x} ${target.start.y}
            A ${innerRadius} ${innerRadius} 0 0 1 ${target.end.x} ${target.end.y}
            Q ${center.x} ${center.y} ${source.start.x} ${source.start.y}`;
  };

  const getLabelPosition = (angle) => {
    const labelRadius = radius + 10;
    return {
      x: center.x + Math.cos(angle) * labelRadius,
      y: center.y + Math.sin(angle) * labelRadius,
    };
  };

  return (
    <div className="chord-diagram-container">
      <div className="chord-diagram-header">
        <h3 className="chord-diagram-title">{title}</h3>
        {subtitle && <p className="chord-diagram-subtitle">{subtitle}</p>}
      </div>

      <div className="chord-diagram-visualization">
        <svg viewBox={`0 0 ${width} ${height}`} className="chord-diagram-svg">
          {/* Group Arcs */}
          {arcs.map((arc, i) => {
            const isHighlighted =
              hoveredGroup === i ||
              (hoveredChord &&
                (hoveredChord.source.index === i ||
                  hoveredChord.target.index === i));

            return (
              <g key={`arc-${i}`}>
                <path
                  d={createArcPath(arc.startAngle, arc.endAngle, radius)}
                  className={`group-arc ${isHighlighted ? "highlighted" : ""}`}
                  fill={colors[i]}
                  onMouseEnter={() => setHoveredGroup(i)}
                  onMouseLeave={() => setHoveredGroup(null)}
                />

                {/* Labels */}
                {(() => {
                  const angle = (arc.startAngle + arc.endAngle) / 2;
                  const pos = getLabelPosition(angle);
                  const transform = `rotate(${(angle * 180) / Math.PI - 90}, ${
                    pos.x
                  }, ${pos.y})`;

                  return (
                    <text
                      x={pos.x}
                      y={pos.y}
                      className="group-label"
                      transform={transform}
                      textAnchor={angle > Math.PI ? "end" : "start"}
                    >
                      {labels[i]}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Chord Paths */}
          {paths.map((chord, i) => {
            const isHighlighted =
              hoveredChord === chord ||
              hoveredGroup === chord.source.index ||
              hoveredGroup === chord.target.index;

            return (
              <path
                key={`chord-${i}`}
                d={createChordPath(chord)}
                className={`chord-path ${isHighlighted ? "highlighted" : ""}`}
                fill={colors[chord.source.index]}
                opacity={0.7}
                onMouseEnter={() => setHoveredChord(chord)}
                onMouseLeave={() => setHoveredChord(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredChord && (
          <div className="chord-tooltip">
            <div className="tooltip-header">
              {labels[hoveredChord.source.index]} →{" "}
              {labels[hoveredChord.target.index]}
            </div>
            <div className="tooltip-value">
              {hoveredChord.value.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="chord-legend">
        {labels.map((label, i) => (
          <div
            key={i}
            className={`legend-item ${hoveredGroup === i ? "highlighted" : ""}`}
            onMouseEnter={() => setHoveredGroup(i)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            <div
              className="legend-color"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
