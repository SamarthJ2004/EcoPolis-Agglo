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
  const [search,setSearch]=useState("");
  const [mapTime, setMapTime] = useState("Biodiversity Map");
  const [selectedRadio, setSelectedRadio] = useState("raw");
  const animateRef = useRef(false);
  const [coordinates, setCoordinates] = useState("");
  const [lat,setLat]=useState(23.81)
  const [lon,setLon]=useState(86.44)

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

  const searchLocation=async ()=>{
    const token=import.meta.env.VITE_APP_GEOCODING_API_KEY
    console.log(token)
    const response= await fetch (`https://geocode.maps.co/search?q=${search}&api_key=${token}`,{
      method: 'GET',
          
         
    })
    const data = await response.json();
    const lon=data[0].lon;
    const lat=data[0].lat
    setLat(lat)
    setLon(lon)
  }
  const MapUpdater = ({ lat, lon }) => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
      map.setView([lat, lon], map.getZoom()); // Update the map view to the new coordinates
    }, [lat, lon, map]);

    return null; // This component doesn't render anything
  };
  return (
    <div className="relative w-full h-screen">
  <MapContainer
    center={[lat, lon]}
    zoom={15}
    className="h-full w-full z-0"
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <Marker position={[lat, lon]}>
      <Tooltip direction="bottom" permanent>{search}</Tooltip>
    </Marker>
    <MapUpdater lat={lat} lon={lon} /> 
    <SetViewOnClick animateRef={animateRef} />
    <MinimapControl position="topright" />
    <MouseMoveComponent onMouseMove={(e) => handleMouseMove(e.target.value)} />
    <Circle center={[lat, lon]} pathOptions={redOptions} radius={200}>
      {/* <Popup></Popup> */}
    </Circle>
  </MapContainer>

  {/* Search Input */}
  <div className="absolute top-2 left-14 w-[210px] h-[50px] z-20 flex items-center justify-center bg-gradient-to-b from-[#257548] to-[#25f1ad] rounded-full overflow-hidden shadow-md cursor-pointer">
  <input
    type="text"
    name="text"
    id="input"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    placeholder="Search your location"
    className="w-[200px] h-[40px] border-none outline-none caret-orange-500 bg-white rounded-full pl-4 tracking-wide text-[13.4px] text-neutral-900"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        searchLocation(); // Call the search function when Enter is pressed
      }
    }}
  />
</div>


  {/* Biodiversity Hotspot Dropdown */}
  <select
    onChange={handleMapChange}
    value={mapTime}
    className="absolute top-16 left-14 p-2 text-sm bg-white border border-gray-300 rounded-md shadow-md z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Biodiversity Hotspots">Biodiversity Hotspots</option>
    <option value="User Input">User Input</option>
  </select>

  {/* GIS Data Selection */}
  <div className="absolute top-28 left-3 bg-white/80 border border-gray-300 rounded-md p-3 shadow-md z-10">
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

  {/* Coordinate Display */}
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