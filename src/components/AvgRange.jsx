import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const AvgRange = ({ data }) => {
    const { darkMode } = useDarkMode();
    // calculate average electric range
    const filteredData = data.filter(vehicle => {
        const range = parseInt(vehicle["Electric Range"]);
        return !isNaN(range) && range > 0;
    });
    const totalRange = filteredData.reduce((sum, vehicle) => sum + parseInt(vehicle["Electric Range"]), 0);
    const avgRange = filteredData.length ? (totalRange / filteredData.length).toFixed(1) : 0;

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Average EV Range (miles)</h2>
        <div className="flex justify-center items-center h-32">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{avgRange}</p>
        </div>
    </div>
    );
};

export default AvgRange;
