import React, { useState, useEffect } from "react";
import "./CalendarHeatmap.css";

export const CalendarHeatmap = ({
  data,
  colorScale,
  year,
  title,
  subtitle,
  valueFormat = (value) => value.toLocaleString(),
}) => {
  const [monthLayout, setMonthLayout] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    // Generate calendar layout
    const months = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    let currentDate = new Date(startDate);
    let currentMonth = [];
    let currentWeek = [];

    while (currentDate <= endDate) {
      if (currentDate.getDay() === 0 && currentWeek.length > 0) {
        currentMonth.push(currentWeek);
        currentWeek = [];
      }

      if (currentDate.getDate() === 1 && currentMonth.length > 0) {
        months.push({
          month: currentDate.getMonth() - 1,
          weeks: currentMonth,
        });
        currentMonth = [];
      }

      currentWeek.push({
        date: new Date(currentDate),
        value: data[currentDate.toISOString().split("T")[0]] || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      currentMonth.push(currentWeek);
    }
    if (currentMonth.length > 0) {
      months.push({
        month: 11,
        weeks: currentMonth,
      });
    }

    setMonthLayout(months);
  }, [data, year]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-heatmap-container">
      <div className="calendar-heatmap-header">
        <h3 className="calendar-heatmap-title">{title}</h3>
        {subtitle && <p className="calendar-heatmap-subtitle">{subtitle}</p>}
      </div>

      <div className="calendar-grid">
        {/* Day Labels */}
        <div className="day-labels">
          {dayNames.map((day) => (
            <div key={day} className="day-label">
              {day}
            </div>
          ))}
        </div>

        {/* Months */}
        <div className="months-container">
          {monthLayout.map((month, monthIndex) => (
            <div key={monthIndex} className="month">
              <div className="month-label">{monthNames[month.month]}</div>
              <div className="month-grid">
                {month.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="week">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="day-cell"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{
                          backgroundColor: colorScale(day.value),
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <span className="legend-label">Less</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="legend-cell"
              style={{
                backgroundColor: colorScale(i / 4),
              }}
            />
          ))}
          <span className="legend-label">More</span>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="calendar-tooltip"
            style={{
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y}px`,
            }}
          >
            <div className="tooltip-date">
              {hoveredDay.date.toLocaleDateString()}
            </div>
            <div className="tooltip-value">{valueFormat(hoveredDay.value)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
