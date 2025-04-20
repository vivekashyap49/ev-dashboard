import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {useDarkMode} from "../context/DarkModeContext.jsx";

const RangeHistogram = ({ data }) => {

    const { darkMode } = useDarkMode();
    // filter out vehicles with no range data or range of 0
    const filteredData = data.filter(vehicle => {
        const range = parseInt(vehicle["Electric Range"]);
        return !isNaN(range) && range > 0;
    });

    // define range buckets (0-50, 51-100, 101-150, etc.)
    const bucketSize = 50;
    const maxRange = Math.max(...filteredData.map(vehicle => parseInt(vehicle["Electric Range"])));
    const numBuckets = Math.ceil(maxRange / bucketSize);
    
    // initialize buckets
    const rangeBuckets = Array(numBuckets).fill(0).map((_, i) => ({
        range: `${i * bucketSize + 1}-${(i + 1) * bucketSize}`,
        count: 0,
        minRange: i * bucketSize + 1,
        maxRange: (i + 1) * bucketSize
    }));

    // count vehicles in each range bucket
    filteredData.forEach(vehicle => {
        const range = parseInt(vehicle["Electric Range"]);
        const bucketIndex = Math.floor((range - 1) / bucketSize);
        if (bucketIndex >= 0 && bucketIndex < rangeBuckets.length) {
            rangeBuckets[bucketIndex].count++;
        }
    });

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">EVs by Electric Range (miles)</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={rangeBuckets}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                        <XAxis 
                            dataKey="range"
                            // tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            tick={{ fontSize: 11, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <Tooltip
                            formatter={(value) => [value.toLocaleString(), 'Count']}
                            labelFormatter={(label) => `Range: ${label} miles`}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar 
                            dataKey="count" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RangeHistogram;