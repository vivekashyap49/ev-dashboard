import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {useDarkMode} from "../context/DarkModeContext.jsx";

const TrendsChart = ({ data }) => {
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

    // calculate cumulative counts to show growth over time
    let cumulativeCount = 0;
    const cumulativeData = chartData.map(item => {
        cumulativeCount += item.count;
        return {
            year: item.year,
            count: item.count,
            cumulative: cumulativeCount
        };
    });

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">EV Trends Over Time</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={cumulativeData}
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
                            formatter={(value, name) => {
                                return [value.toLocaleString(), name === 'cumulative' ? 'Cumulative Count' : 'New Registrations'];
                            }}
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
                            name="New Registrations"
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            name="Cumulative"
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

export default TrendsChart;