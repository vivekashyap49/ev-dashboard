import React from 'react';
import TotalEVs from './TotalEVs';
import MakeBarchart from './MakeBarchart';
import ModelYearChart from './ModelYearChart';
import EVTypeChart from './EVTypeChart';
import CountyChart from './CountyChart';
import CityChart from './CityChart';
import RangeHistogram from './RangeHistogram';
import TrendsChart from './TrendsChart';
import PopularMakesChart from './PopularMakesChart';
import AvgRange from './AvgRange';
import CAFVEligibilityChart from './CAFVEligibilityChart';
import VehicleLocationMap from './VehicleLocationMap';

const Dashboard = ({ data }) => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 transition-colors duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                
                {/* row 1 */}
                <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                    <div className="mb-2">
                        <TotalEVs data={data} />
                    </div>
                    <div>
                        <AvgRange data={data} />
                    </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
                    <ModelYearChart data={data} />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
                    <EVTypeChart data={data} />
                </div>

                {/* row 2 */}

                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
                    <CAFVEligibilityChart data={data} />
                </div>

                <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 2xl:col-span-3">
                    <VehicleLocationMap data={data} />
                </div>

                {/* row 3 */}
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
                    <CountyChart data={data} />
                </div>

                <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-3">
                    <TrendsChart data={data} />
                </div>

                {/* row 4 */}
                <div className="sm:col-span-2 lg:col-span-2 xl:col-span-3 2xl:col-span-3">
                    <MakeBarchart data={data} />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 2xl:col-span-2">
                    <RangeHistogram data={data} />
                </div>

                {/* row 5 */}
                <div className="col-span-full">
                    <PopularMakesChart data={data} />
                </div>

                {/* row 6 */}
                <div className="col-span-full">
                    <CityChart data={data} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
