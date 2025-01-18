import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Rectangle, useMapEvent, useMap,Popup,Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { POSITION_CLASSES, MouseMoveComponent,SetViewOnClick } from '../utils/MapUtils';

const BOUNDS_STYLE = { weight: 1 };
const redOptions = { color: 'red' }

function MinimapBounds({ parentMap, zoom }) {
  const minimap = useMap();
  const onClick = useCallback(
    (e) => {
      parentMap.setView(e.latlng, parentMap.getZoom());
    },
    [parentMap],
  );

  useMapEvent('click', onClick);

  const [bounds, setBounds] = useState(parentMap.getBounds());

  useEffect(() => {
    const onChange = () => {
      setBounds(parentMap.getBounds());
      minimap.setView(parentMap.getCenter(), zoom);
    };

    parentMap.on('move', onChange);
    parentMap.on('zoom', onChange);

    return () => {
      parentMap.off('move', onChange);
      parentMap.off('zoom', onChange);
    };
  }, [minimap, parentMap, zoom]);

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />;
}

function MinimapControl({ position, zoom }) {
  const parentMap = useMap();
  const mapZoom = zoom || 8;

  const minimap = useMemo(
    () => (
      <MapContainer
        className="h-36 w-36"
        center={parentMap.getCenter()}
        zoom={mapZoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
      </MapContainer>
    ),
    [parentMap, mapZoom],
  );

  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  );
}

const MapComponent = () => {
  const [mapTime, setMapTime] = useState("Biodiversity Map");
  const [selectedRadio, setSelectedRadio] = useState("raw");
  const animateRef = useRef(false);
  const [coordinates, setCoordinates] = useState(null);

  const handleMouseMove = (e) => {
    const { lat, lng } = e.latlng;
    setCoordinates({ lat, lng });
  };

  const handleMapChange = (e) => {
    setMapTime(e.target.value);
    setSelectedRadio("raw");
  };

  const handleRadioChange = (value) => {
    setSelectedRadio(value);
    setMapTime(value === "raw" ? "real time map" : "old map");
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer 
        center={[23.81, 86.44]} 
        zoom={15} 
        className="h-full w-full z-[1]"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[23.81, 86.44]}>
          <Tooltip direction="bottom" permanent>Gulf of Mexico</Tooltip>
        </Marker>
        <SetViewOnClick animateRef={animateRef} />
        <MinimapControl position="topright" />
        <MouseMoveComponent onMouseMove={handleMouseMove} />
        <Circle center={[23.82, 86.44]} pathOptions={redOptions} radius={200}>
          <Popup>Popup in CircleMarker</Popup>
        </Circle>
      </MapContainer>

      <select
        onChange={handleMapChange}
        value={mapTime}
        className="absolute top-3 left-14 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-md z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Biodiversity Hotspots">Biodiversity Hotspots</option>
        <option value="User Input">User Input</option>
      </select>

      <div className="absolute top-24 left-3 bg-white/80 border border-gray-300 rounded-md p-3 shadow-md z-10">
        <label className="flex items-center space-x-2 mb-2">
          <input 
            type="radio" 
            value="raw" 
            checked={selectedRadio === "raw"} 
            onChange={() => handleRadioChange("raw")}
            className="form-radio"
          />
          <span>Raw GIS Data</span>
        </label>
        <label className="flex items-center space-x-2">
          <input 
            type="radio" 
            value="processed" 
            checked={selectedRadio === "processed"} 
            onChange={() => handleRadioChange("processed")}
            className="form-radio"
          />
          <span>Processed GIS Data</span>
        </label>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-md z-10">
        {coordinates ? (
          <p className="text-sm">
            Latitude: {coordinates.lat}, Longitude: {coordinates.lng}
          </p>
        ) : (
          <p className="text-sm">Move the mouse over the map to get coordinates!</p>
        )}
      </div>
    </div>
  );
};

export default MapComponent;