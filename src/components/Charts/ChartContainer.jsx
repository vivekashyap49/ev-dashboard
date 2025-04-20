import React from "react";
import "./ChartContainer.css";

export const ChartContainer = ({ title, subtitle, children, actions }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title-group">
          <h3 className="chart-title">{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="chart-actions">{actions}</div>}
      </div>
      <div className="chart-content">{children}</div>
    </div>
  );
};
