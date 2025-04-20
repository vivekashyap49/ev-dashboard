import React, { useState, useRef, useEffect } from "react";
import "./Timeline.css";

export const Timeline = ({ data, onRangeChange }) => {
  const [range, setRange] = useState({ start: 0, end: 100 });
  const [isDragging, setIsDragging] = useState(null);
  const timelineRef = useRef(null);

  const handleMouseDown = (handle) => (e) => {
    setIsDragging(handle);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;

    setRange((prev) => {
      const newRange = {
        ...prev,
        [isDragging]: Math.round(percentage),
      };

      // Ensure start is before end
      if (isDragging === "start" && newRange.start >= newRange.end) {
        newRange.start = newRange.end - 1;
      } else if (isDragging === "end" && newRange.end <= newRange.start) {
        newRange.end = newRange.start + 1;
      }

      onRangeChange?.(newRange);
      return newRange;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="timeline-container">
      <div className="timeline" ref={timelineRef}>
        <div
          className="timeline-range"
          style={{
            left: `${range.start}%`,
            right: `${100 - range.end}%`,
          }}
        />

        <div
          className="timeline-handle start"
          style={{ left: `${range.start}%` }}
          onMouseDown={handleMouseDown("start")}
        >
          <div className="handle-label">{formatValue(range.start)}</div>
        </div>

        <div
          className="timeline-handle end"
          style={{ left: `${range.end}%` }}
          onMouseDown={handleMouseDown("end")}
        >
          <div className="handle-label">{formatValue(range.end)}</div>
        </div>

        <div className="timeline-markers">
          {data.markers.map((marker, index) => (
            <div
              key={index}
              className="timeline-marker"
              style={{ left: `${marker.position}%` }}
            >
              <div className="marker-label">{marker.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const formatValue = (value) => `${value}%`;
