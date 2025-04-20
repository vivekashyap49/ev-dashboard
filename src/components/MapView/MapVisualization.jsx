import React, { useEffect, useRef } from "react";
import "./MapVisualization.css";

export const MapVisualization = ({ data, regionData, colorScale }) => {
  const mapRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const showTooltip = (event, region) => {
      const tooltip = tooltipRef.current;
      const regionData = data[region.id] || { count: 0 };

      tooltip.innerHTML = `
        <div class="tooltip-content">
          <h4>${region.name}</h4>
          <div class="tooltip-stat">
            <span>Total EVs:</span>
            <span class="tooltip-value">${regionData.count.toLocaleString()}</span>
          </div>
          <div class="tooltip-stat">
            <span>Market Share:</span>
            <span class="tooltip-value">${regionData.percentage}%</span>
          </div>
        </div>
      `;

      tooltip.style.display = "block";
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
    };

    const hideTooltip = () => {
      tooltipRef.current.style.display = "none";
    };

    // Add event listeners for regions
    const regions = mapRef.current.querySelectorAll(".region");
    regions.forEach((region) => {
      region.addEventListener("mouseenter", (e) =>
        showTooltip(e, region.dataset)
      );
      region.addEventListener("mouseleave", hideTooltip);
    });

    return () => {
      regions.forEach((region) => {
        region.removeEventListener("mouseenter", showTooltip);
        region.removeEventListener("mouseleave", hideTooltip);
      });
    };
  }, [data]);

  return (
    <div className="map-container">
      <div className="map-wrapper" ref={mapRef}>
        <svg className="map" viewBox="0 0 800 600">
          {regionData.map((region) => (
            <path
              key={region.id}
              d={region.path}
              className="region"
              fill={colorScale(data[region.id]?.count || 0)}
              data-id={region.id}
              data-name={region.name}
            />
          ))}
        </svg>
      </div>
      <div className="map-tooltip" ref={tooltipRef} />

      <div className="map-legend">
        <div className="legend-title">EV Density</div>
        <div className="legend-scale">
          {colorScale.domain().map((value, i) => (
            <div key={i} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: colorScale(value) }}
              />
              <span>{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
