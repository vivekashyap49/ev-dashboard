import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {useDarkMode} from "../context/DarkModeContext.jsx";

const PopularMakesChart = ({ data }) => {
    const { darkMode } = useDarkMode();

    // Group data by Make and Model Year
    const makeYearData = data.reduce((acc, vehicle) => {
        const make = vehicle.Make;
        const year = vehicle["Model Year"];
        
        if (!acc[make]) {
            acc[make] = {};
        }
        
        acc[make][year] = (acc[make][year] || 0) + 1;
        return acc;
    }, {});
    
    // Get top 5 makes by total count
    const makeCount = Object.entries(makeYearData)
        .map(([make, years]) => ({
            make,
            count: Object.values(years).reduce((sum, count) => sum + count, 0)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    const topMakes = makeCount.map(item => item.make);
    
    // get all years from the data
    const allYears = [...new Set(data.map(vehicle => vehicle["Model Year"]))].sort();
    
    // prepare data for the chart
    const chartData = allYears.map(year => {
        const yearData = { year };
        
        topMakes.forEach(make => {
            yearData[make] = makeYearData[make]?.[year] || 0;
        });
        
        return yearData;
    });
    
    // styling   
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Popular Makes Over the Years</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="year"
                            tick={{ fontSize: 11, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: darkMode ? '#e5e7eb' : '#374151' }}
                        />
                        <Tooltip
                            formatter={(value, name) => [value.toLocaleString(), name]}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        {topMakes.map((make, index) => (
                            <Line
                                key={make}
                                type="monotone"
                                dataKey={make}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PopularMakesChart;