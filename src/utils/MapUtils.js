import { useMapEvent } from "react-leaflet";

export const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

export const MouseMoveComponent = ({ onMouseMove }) => {
  useMapEvent('mousemove', (e) => {
    const { lat, lng } = e.latlng;
    onMouseMove({
      latlng: {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6))
      }
    });
  });
  return null;
};

export const SetViewOnClick = ({ animateRef }) => {
  const map = useMapEvent('click', (e) => {
    if (animateRef.current) {
      map.setView(e.latlng, 8, { animate: true });
    }
  });
  return null;
};