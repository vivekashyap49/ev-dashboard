import React from "react";
import "./FilterBar.css";

export const FilterBar = ({ filters, onChange }) => {
  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <div key={filter.id} className="filter-group">
          <label className="filter-label">{filter.label}</label>
          {filter.type === "select" && (
            <select
              className="filter-select"
              value={filter.value}
              onChange={(e) => onChange(filter.id, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {filter.type === "range" && (
            <div className="filter-range">
              <input
                type="number"
                className="filter-input"
                value={filter.value.min}
                onChange={(e) =>
                  onChange(filter.id, {
                    ...filter.value,
                    min: e.target.value,
                  })
                }
                placeholder="Min"
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                className="filter-input"
                value={filter.value.max}
                onChange={(e) =>
                  onChange(filter.id, {
                    ...filter.value,
                    max: e.target.value,
                  })
                }
                placeholder="Max"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
