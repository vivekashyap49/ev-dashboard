import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {useDarkMode} from "../context/DarkModeContext.jsx";

const ModelYearChart = ({ data }) => {

    const { darkMode } = useDarkMode();
    // process data to group by model year
    const yearData = data.reduce((acc, vehicle) => {
        const year = vehicle["Model Year"];
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});

    // convert to array and sort by year
    const chartData = Object.entries(yearData)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">EVs by Model Year</h2>
            <div className="h-[19rem]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            tick={{ fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ModelYearChart;