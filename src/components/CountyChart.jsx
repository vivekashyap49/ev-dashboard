import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';

const CountyChart = ({ data }) => {
    const { darkMode } = useDarkMode();

    // process data to group by county
    const countyData = data.reduce((acc, vehicle) => {
        const county = vehicle.County;
        acc[county] = (acc[county] || 0) + 1;
        return acc;
    }, {});

    // convert to array, sort by count (desc), and take top 10
    const chartData = Object.entries(countyData)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Top 10 Counties by EV Count</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                        <XAxis 
                            type="number" 
                            tick={{ fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <YAxis 
                            type="category" 
                            dataKey="county" 
                            tick={{ fontSize: 12, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <Tooltip
                            formatter={(value) => [value.toLocaleString(), 'Count']}
                            contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#fff',
                                color: darkMode ? '#e5e7eb' : '#000',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: darkMode 
                                    ? '0 2px 4px rgba(0,0,0,0.3)' 
                                    : '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar 
                            dataKey="count" 
                            fill="#3b82f6" 
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CountyChart;
