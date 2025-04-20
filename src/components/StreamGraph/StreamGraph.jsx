import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Streamgraph.css';

export const Streamgraph = ({
  data,
  width = 800,
  height = 400,
  title,
  subtitle,
  colors,
  margin = { top: 40, right: 40, bottom: 40, left: 60 }
}) => {
  const [layers, setLayers] = useState([]);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    computeLayers();
  }, [data, width, height]);

  const computeLayers = () => {
    // Transform data for stacking
    const keys = Object.keys(data[0]).filter(key => key !== 'date');
    const stackData = d3.stack()
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut)
      .keys(keys)(data);

    setLayers(stackData.map((layer, i) => ({
      key: layer.key,
      values: layer.map(d => ({
        date: d.data.date,
        y0: d[0],
        y1: d[1],
        value: d[1] - d[0]
      })),
      color: colors[i % colors.length]
    })));
  };

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(layers, layer => d3.min(layer.values, d => d.y0)),
      d3.max(layers, layer => d3.max(layer.values, d => d.y1))
    ])
    .range([height - margin.bottom, margin.top]);

  const area = d3.area()
    .x(d => xScale(d.date))
    .y0(d => yScale(d.y0))
    .y1(d => yScale(d.y1))
    .curve(d3.curveBasis);

  const getLayerOpacity = (layer) => {
    if (!selectedLayer && !hoveredLayer) return 0.7;
    if (layer === selectedLayer || layer === hoveredLayer) return 1;
    return 0.3;
  };

  return (
    <div className="streamgraph-container">
      <div className="streamgraph-header">
        <h3 className="streamgraph-title">{title}</h3>
        {subtitle && (
          <p className="streamgraph-subtitle">{subtitle}</p>
        )}
      </div>

      <div className="streamgraph-visualization">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="streamgraph-svg"
        >
          {/* Grid lines */}
          {xScale.ticks(5).map(tick => (
            <line
              key={tick.getTime()}
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={margin.top}
              y2={height - margin.bottom}
              className="grid-line"
            />
          ))}

          {/* Layers */}
          {layers.map((layer, i) => (
            <g
              key={i}
              className={`layer-group ${
                hoveredLayer === layer ? 'hovered' : ''
              } ${selectedLayer === layer ? 'selected' : ''}`}
              onMouseEnter={() => setHoveredLayer(layer)}
              onMouseLeave={() => setHoveredLayer(null)}
              onClick={() => setSelectedLayer(
                selectedLayer === layer ? null : layer
              )}
            >
              <path
                d={area(layer.values)}
                fill={layer.color}
                style={{ opacity: getLayerOpacity(layer) }}
                className="layer-path"
              />
            </g>
          ))}

          {/* X-axis */}
          <g transform={`translate(0,${height - margin.bottom})`}>
            {xScale.ticks(5).map(tick => (
              <g
                key={tick.getTime()}
                transform={`translate(${xScale(tick)},0)`}
              >
                <line y2={5} className="tick-line" />
                <text
                  y={20}
                  className="tick-label"
                  textAnchor="middle"
                >
                  {d3.timeFormat('%b %Y')(tick)}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredLayer && (
          <div className="streamgraph-tooltip">
            <div className="tooltip-header">
              {hoveredLayer.key}
            </div>
            <div className="tooltip-content">
              {hoveredLayer.values.map((value, i) => (
                <div key={i} className="value-row">
                  <span>{d3.timeFormat('%b %Y')(value.date)}:</span>
                  <span>{value.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="streamgraph-legend">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`legend-item ${
              hoveredLayer === layer ? 'hovered' : ''
            } ${selectedLayer === layer ? 'selected' : ''}`}
            onMouseEnter={() => setHoveredLayer(layer)}
            onMouseLeave={() => setHoveredLayer(null)}
            onClick={() => setSelectedLayer(
              selectedLayer === layer ? null : layer
            )}
          >
            <div
              className="legend-color"
              style={{ backgroundColor: layer.color }}
            />
            <span className="legend-label">{layer.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
