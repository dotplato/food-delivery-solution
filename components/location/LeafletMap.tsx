"use client";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L, { LeafletMouseEvent } from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: '/images/pin.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const DEFAULT_POSITION: [number, number] = [37.7749, -122.4194];

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 17, { animate: true });
    }
  }, [position, map]);

  useMapEvents({
    click(e: LeafletMouseEvent) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      icon={customIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latlng = marker.getLatLng();
          setPosition([latlng.lat, latlng.lng]);
        },
      }}
    />
  ) : null;
}

export default function LeafletMap({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  return (
    <MapContainer
      center={position || DEFAULT_POSITION}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
} 