import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const CityChart = ({ data }) => {
    const { darkMode } = useDarkMode();
    // Process data to group by City
    const cityData = data.reduce((acc, vehicle) => {
        const city = vehicle.City;
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    // convert to array, sort by count (descending) top 10
    const chartData = Object.entries(cityData)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // calculate the maximum count for scaling the bars
    const maxCount = Math.max(...chartData.map(item => item.count));

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Top 10 Cities by EV Count</h2>
            <div className="overflow-auto max-h-64">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                City
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Distribution
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {chartData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {item.city}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {item.count.toLocaleString()}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                            {((item.count / maxCount) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CityChart;
