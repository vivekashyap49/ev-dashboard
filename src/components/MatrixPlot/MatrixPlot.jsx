import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./MatrixPlot.css";

export const MatrixPlot = ({
  data,
  width = 800,
  height = 800,
  title,
  subtitle,
  colors = {
    positive: ["#f7fbff", "#2171b5"],
    negative: ["#fff5f0", "#cb181d"],
  },
  margin = { top: 60, right: 60, bottom: 60, left: 60 },
}) => {
  const [matrix, setMatrix] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeMatrix();
  }, [data, width, height]);

  const computeMatrix = () => {
    const variables = Object.keys(data[0]);
    const correlationMatrix = [];

    // Compute correlations between all variable pairs
    variables.forEach((var1, i) => {
      correlationMatrix[i] = [];
      variables.forEach((var2, j) => {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = computeCorrelation(
            data.map((d) => d[var1]),
            data.map((d) => d[var2])
          );
        }
      });
    });

    setMatrix(
      variables.map((variable, i) => ({
        variable,
        correlations: variables.map((v, j) => ({
          variable: v,
          correlation: correlationMatrix[i][j],
        })),
      }))
    );
  };

  const computeCorrelation = (x, y) => {
    const n = x.length;
    if (n === 0) return 0;

    // Check if data is numeric
    if (typeof x[0] === "number" && typeof y[0] === "number") {
      const xMean = d3.mean(x);
      const yMean = d3.mean(y);

      const numerator = d3.sum(x.map((xi, i) => (xi - xMean) * (y[i] - yMean)));
      const denominator = Math.sqrt(
        d3.sum(x.map((xi) => Math.pow(xi - xMean, 2))) *
          d3.sum(y.map((yi) => Math.pow(yi - yMean, 2)))
      );

      return denominator === 0 ? 0 : numerator / denominator;
    } else {
      // For categorical data, compute Cramer's V
      return computeCramersV(x, y);
    }
  };

  const computeCramersV = (x, y) => {
    const contingencyTable = new Map();
    const xCategories = new Set(x);
    const yCategories = new Set(y);

    x.forEach((xi, i) => {
      const key = `${xi}-${y[i]}`;
      contingencyTable.set(key, (contingencyTable.get(key) || 0) + 1);
    });

    // Compute chi-square statistic
    let chiSquare = 0;
    xCategories.forEach((xCat) => {
      yCategories.forEach((yCat) => {
        const observed = contingencyTable.get(`${xCat}-${yCat}`) || 0;
        const expected =
          (x.filter((xi) => xi === xCat).length *
            y.filter((yi) => yi === yCat).length) /
          x.length;

        if (expected > 0) {
          chiSquare += Math.pow(observed - expected, 2) / expected;
        }
      });
    });

    const minDimension = Math.min(xCategories.size, yCategories.size);
    return Math.sqrt(chiSquare / (x.length * (minDimension - 1)));
  };

  const getCellColor = (correlation) => {
    const scale =
      correlation >= 0
        ? d3.scaleLinear().domain([0, 1]).range(colors.positive)
        : d3
            .scaleLinear()
            .domain([-1, 0])
            .range(colors.negative.slice().reverse());

    return scale(correlation);
  };

  const cellSize = Math.min(
    (width - margin.left - margin.right) / matrix.length,
    (height - margin.top - margin.bottom) / matrix.length
  );

  return (
    <div className="matrix-plot-container">
      <div className="matrix-plot-header">
        <h3 className="matrix-plot-title">{title}</h3>
        {subtitle && <p className="matrix-plot-subtitle">{subtitle}</p>}
      </div>

      <div className="matrix-plot-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="matrix-plot-svg"
        >
          {/* Column Labels */}
          {matrix.map((row, i) => (
            <text
              key={`col-${i}`}
              x={margin.left + (i + 0.5) * cellSize}
              y={margin.top - 10}
              transform={`rotate(-45 ${margin.left + (i + 0.5) * cellSize} ${
                margin.top - 10
              })`}
              className={`matrix-label ${
                selectedVariable === row.variable ? "selected" : ""
              }`}
              onClick={() =>
                setSelectedVariable(
                  selectedVariable === row.variable ? null : row.variable
                )
              }
            >
              {row.variable}
            </text>
          ))}

          {/* Row Labels */}
          {matrix.map((row, i) => (
            <text
              key={`row-${i}`}
              x={margin.left - 10}
              y={margin.top + (i + 0.5) * cellSize}
              className={`matrix-label ${
                selectedVariable === row.variable ? "selected" : ""
              }`}
              textAnchor="end"
              dominantBaseline="middle"
              onClick={() =>
                setSelectedVariable(
                  selectedVariable === row.variable ? null : row.variable
                )
              }
            >
              {row.variable}
            </text>
          ))}

          {/* Matrix Cells */}
          {matrix.map((row, i) => (
            <g key={`row-${i}`}>
              {row.correlations.map((cell, j) => {
                const isHighlighted =
                  selectedVariable === row.variable ||
                  selectedVariable === cell.variable;

                return (
                  <g
                    key={`cell-${i}-${j}`}
                    transform={`translate(${margin.left + j * cellSize},${
                      margin.top + i * cellSize
                    })`}
                    className="matrix-cell-group"
                    onMouseEnter={() => setHoveredCell({ row, cell })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <rect
                      width={cellSize}
                      height={cellSize}
                      className={`matrix-cell ${
                        isHighlighted ? "highlighted" : ""
                      }`}
                      fill={getCellColor(cell.correlation)}
                    />
                    <text
                      x={cellSize / 2}
                      y={cellSize / 2}
                      className="cell-value"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {cell.correlation.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="matrix-plot-tooltip">
            <div className="tooltip-header">
              {hoveredCell.row.variable} × {hoveredCell.cell.variable}
            </div>
            <div className="tooltip-content">
              Correlation: {hoveredCell.cell.correlation.toFixed(3)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="matrix-plot-legend">
        <div className="legend-gradient">
          <div
            className="gradient negative"
            style={{
              background: `linear-gradient(to right, ${colors.negative.join(
                ","
              )})`,
            }}
          />
          <div
            className="gradient positive"
            style={{
              background: `linear-gradient(to right, ${colors.positive.join(
                ","
              )})`,
            }}
          />
        </div>
        <div className="legend-labels">
          <span>-1</span>
          <span>0</span>
          <span>1</span>
        </div>
      </div>
    </div>
  );
};
