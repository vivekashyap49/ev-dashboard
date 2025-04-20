import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';

const TotalEVs = ({ data }) => {
    const { darkMode } = useDarkMode();
    // count total number of EVs
    const totalCount = data.length ;

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Total Electric Vehicles</h2>
            <div className="flex justify-center items-center h-32">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</p>
            </div>
        </div>
    );
};

export default TotalEVs;
