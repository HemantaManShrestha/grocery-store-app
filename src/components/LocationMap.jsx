
import { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function DraggableMarker({ position, setPosition, onDragEnd }) {
    const markerRef = useRef(null)
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos)
                    if (onDragEnd) onDragEnd(newPos);
                }
            },
        }),
        [onDragEnd, setPosition],
    )

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    )
}

// Component to recenter map when position changes programmatically
function SetViewOnClick({ coords }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
}

const LocationMap = ({ position, setPosition, onLocationSelect, readOnly = false }) => {
    // Default to Kathmandu if no position
    const center = position || { lat: 27.7172, lng: 85.3240 };

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={!readOnly}
                dragging={!readOnly}
                touchZoom={!readOnly}
                doubleClickZoom={!readOnly}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                    position={center}
                    setPosition={!readOnly ? setPosition : () => { }}
                    onDragEnd={!readOnly ? onLocationSelect : () => { }}
                />
                {!readOnly && <SetViewOnClick coords={center} />}
            </MapContainer>

            {!readOnly && (
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur text-xs p-2 rounded-lg shadow-md z-[1000] text-center text-gray-600 pointer-events-none">
                    Drag the marker to pinpoint your exact delivery location.
                </div>
            )}
        </div>
    );
};

export default LocationMap;
