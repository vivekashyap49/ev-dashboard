import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';

const EVTypeChart = ({ data }) => {
    const { darkMode } = useDarkMode();

    // Process data to group by ev type
    const typeData = data.reduce((acc, vehicle) => {
        const type = vehicle["Electric Vehicle Type"];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    // convert to array format for the chart
    const chartData = Object.entries(typeData)
        .map(([type, count]) => ({ 
            name: type.replace(/ \([A-Z]+\)$/, ''), // remove abbreviation in parentheses
            value: count 
        }));

    // styling   
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">EV Types Breakdown</h2>
            <div className="h-[19rem]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
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
                        <Legend 
                            formatter={(value) => (
                                <span className="text-gray-700 dark:text-gray-200">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EVTypeChart;
