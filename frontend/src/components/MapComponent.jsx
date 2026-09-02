import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix Leaflet's default icon path issues in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to dynamically adjust map bounds to fit all markers
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function MapComponent({ places }) {
  const [coordinates, setCoordinates] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!places || places.length === 0) {
        setCoordinates([]);
        setRoutePath([]);
        return;
      }
      
      setLoading(true);
      const validPlaces = places.filter((p) => p && p.trim() !== "");
      
      try {
        const coordsPromises = validPlaces.map(async (place) => {
          const searchQuery = encodeURIComponent(`${place}, Chennai`);
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`
          );
          if (res.data && res.data.length > 0) {
            return {
              name: place,
              lat: parseFloat(res.data[0].lat),
              lon: parseFloat(res.data[0].lon),
            };
          }
          return null;
        });

        let results = await Promise.all(coordsPromises);
        results = results.filter((r) => r !== null);
        
        setCoordinates(results);

        // OSRM Routing
        if (results.length > 1) {
          const coordString = results.map(c => `${c.lon},${c.lat}`).join(';');
          const routeRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
          
          if (routeRes.data && routeRes.data.routes && routeRes.data.routes.length > 0) {
            const geojsonCoords = routeRes.data.routes[0].geometry.coordinates;
            // OSRM returns [lon, lat], Leaflet Polyline expects [lat, lon]
            const latLngs = geojsonCoords.map(coord => [coord[1], coord[0]]);
            setRoutePath(latLngs);
          }
        } else {
          setRoutePath([]);
        }
      } catch (err) {
        console.error("Error fetching coordinates/route:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCoordinates();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [places]);

  const defaultCenter = [13.0827, 80.2707];
  // Calculate bounds to include all points of the route, not just the markers
  const bounds = routePath.length > 0 ? routePath : coordinates.map((c) => [c.lat, c.lon]);

  return (
    <div className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
          <span className="text-indigo-600 font-semibold animate-pulse">Loading Map...</span>
        </div>
      )}
      <MapContainer
        center={coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lon] : defaultCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {coordinates.map((coord, index) => (
          <Marker key={index} position={[coord.lat, coord.lon]}>
            <Popup>
              <strong>{index === 0 ? "Start" : index === coordinates.length - 1 ? "End" : "Stop"}:</strong> {coord.name}
            </Popup>
          </Marker>
        ))}

        {coordinates.length > 1 && (
          <Polyline 
            positions={routePath.length > 0 ? routePath : coordinates.map((c) => [c.lat, c.lon])} 
            color="#4f46e5" 
            weight={routePath.length > 0 ? 5 : 4} 
            opacity={0.8}
            dashArray={routePath.length > 0 ? "" : "10, 10"} 
          />
        )}

        {bounds.length > 0 && <ChangeView bounds={bounds} />}
      </MapContainer>
    </div>
  );
}
