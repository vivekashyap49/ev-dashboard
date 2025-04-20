import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {useDarkMode} from "../context/DarkModeContext.jsx";

const MakeBarchart = ({ data }) => {

    const { darkMode } = useDarkMode();

    // process data to group by make
    const makeData = data.reduce((acc, vehicle) => {
        const make = vehicle.Make;
        acc[make] = (acc[make] || 0) + 1;
        return acc;
    }, {});

    // convert to array and sort
    const chartData = Object.entries(makeData)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">EVs by Manufacturer</h2>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                    >
                        <XAxis
                            dataKey="make"
                            angle={-50}
                            textAnchor="end"
                            tick={{ fontSize: 11, fill: darkMode ? '#e5e7eb' : '#374151' }}
                            interval={0}
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
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MakeBarchart;