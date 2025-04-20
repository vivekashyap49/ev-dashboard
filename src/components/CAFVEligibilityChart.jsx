import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CAFVEligibilityChart = ({ data }) => {
    const [chartData, setChartData] = useState([]);
    const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0'];

    useEffect(() => {
        if (data && data.length > 0) {
            // count vehicles by cafv eligibility
            const eligibilityCounts = data.reduce((acc, vehicle) => {
                const eligibility = vehicle["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] || "Unknown";
                acc[eligibility] = (acc[eligibility] || 0) + 1;
                return acc;
            }, {});

            // convert to array format for the chart
            const formattedData = Object.entries(eligibilityCounts).map(([name, value]) => ({
                name: name === "Clean Alternative Fuel Vehicle Eligible" ? "Eligible" : 
                      name === "Not Eligible" ? "Not Eligible" : name,
                value
            }));

            // sort by count (descending)
            formattedData.sort((a, b) => b.value - a.value);
            
            setChartData(formattedData);
        }
    }, [data]);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor="middle" 
                dominantBaseline="middle"
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                CAFV Eligibility Distribution
            </h2>
            <div className="h-80">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius="70%"
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value.toLocaleString(), 'Vehicles']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">loading data...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CAFVEligibilityChart;
