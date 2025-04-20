import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix for the default marker icon issue in react leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const VehicleLocationMap = ({ data }) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (data && data.length > 0) {
      // process only a subset of data points to prevent browser performance issues
      // sample up to 200 data points with location information
      const sampleSize = 200;
      const processedData = [];
      
      // filter and process data
      let count = 0;
      for (let i = 0; i < data.length && count < sampleSize; i++) {
        const item = data[i];
        if (item["Vehicle Location"]) {
          try {
            // parse POINT(-122.30839 47.610365) format
            const locMatch = item["Vehicle Location"].match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
            if (locMatch && locMatch.length === 3) {
              const lng = parseFloat(locMatch[1]);
              const lat = parseFloat(locMatch[2]);
              
              if (!isNaN(lat) && !isNaN(lng)) {
                processedData.push({
                  id: item["DOL Vehicle ID"] || count,
                  position: [lat, lng], // leaflet  [lat, lng] format
                  make: item.Make,
                  model: item.Model,
                  year: item["Model Year"],
                  type: item["Electric Vehicle Type"],
                  city: item.City,
                  county: item.County
                });
                count++;
              }
            }
          } catch (err) {
            console.error("Error parsing location data:", err);
          }
        }
      }
      
      setMapData(processedData);
      setLoading(false);
    }
  }, [data]);

  // default center position ws
  const defaultCenter = [47.7511, -120.7401];
  const zoom = 7;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Vehicle Locations</h2>
        <div className="flex justify-center items-center h-80">
          <p className="text-gray-500 dark:text-gray-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Vehicle Locations</h2>
      <div className="h-80">
        <MapContainer 
          center={defaultCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapData.map((vehicle) => (
            <Marker key={vehicle.id} position={vehicle.position}>
              <Popup>
                <div>
                  <p><strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong></p>
                  <p>Type: {vehicle.type}</p>
                  <p>Location: {vehicle.city}, {vehicle.county}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default VehicleLocationMap;
