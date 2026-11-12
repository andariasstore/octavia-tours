import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, RotateCcw } from 'lucide-react';

export interface AttractionLocation {
  name: string;
  description: string;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DestinationAttractionsMapProps {
  destinationId: string;
  destinationName: string;
  center: { lat: number; lng: number };
  defaultZoom: number;
  attractions: AttractionLocation[];
  selectedIndex: number | null;
  onSelectAttraction: (index: number | null) => void;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createPinIcon(index: number, isSelected: boolean): L.DivIcon {
  const bg = isSelected ? '#D97706' : '#136F99';
  const border = isSelected ? '#92400E' : '#0B2545';
  const scale = isSelected ? 'scale(1.16)' : 'scale(1)';
  const shadow = isSelected
    ? '0 4px 12px rgba(217, 119, 6, 0.45)'
    : '0 3px 8px rgba(11, 37, 69, 0.35)';

  return L.divIcon({
    className: 'asriva-leaflet-pin',
    iconSize: [30, 38],
    iconAnchor: [15, 36],
    popupAnchor: [0, -34],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:${scale};transform-origin:bottom center;transition:transform 0.18s ease;">
        <div style="width:28px;height:28px;border-radius:9999px;background:${bg};border:2.5px solid ${border};color:#FFFFFF;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:${shadow};font-family:inherit;">
          ${index + 1}
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${border};margin-top:-1px;"></div>
      </div>
    `,
  });
}

function createPopupContent(index: number, attraction: AttractionLocation): string {
  return `
    <div style="min-width:170px;max-width:210px;font-family:inherit;color:#0f172a;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:9999px;background:#0B2545;color:#ffffff;font-size:10px;font-weight:700;flex-shrink:0;">
          ${index + 1}
        </span>
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.03em;color:#136F99;">
          ${escapeHtml(attraction.category)}
        </span>
      </div>
      <div style="font-size:12px;font-weight:800;color:#0f172a;line-height:1.3;">
        ${escapeHtml(attraction.name)}
      </div>
      <p style="font-size:11px;color:#475569;margin:4px 0 0;line-height:1.45;">
        ${escapeHtml(attraction.description)}
      </p>
      <div style="margin-top:6px;padding-top:4px;border-top:1px solid #e2e8f0;font-size:10px;font-family:monospace;color:#64748b;">
        ${attraction.coordinates.lat.toFixed(4)}, ${attraction.coordinates.lng.toFixed(4)}
      </div>
    </div>
  `;
}

export const DestinationAttractionsMap: React.FC<DestinationAttractionsMapProps> = ({
  destinationId,
  destinationName,
  center,
  defaultZoom,
  attractions,
  selectedIndex,
  onSelectAttraction,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const onSelectRef = useRef(onSelectAttraction);
  const [fitSignal, setFitSignal] = useState(0);

  useEffect(() => {
    onSelectRef.current = onSelectAttraction;
  }, [onSelectAttraction]);

  // Initialize Leaflet map and OpenStreetMap layer (no API key required)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom: defaultZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const createdMarkers = attractions.map((attr, idx) => {
      const marker = L.marker([attr.coordinates.lat, attr.coordinates.lng], {
        icon: createPinIcon(idx, false),
        title: attr.name,
        zIndexOffset: 10 + idx,
      }).addTo(map);

      marker.bindPopup(createPopupContent(idx, attr), {
        maxWidth: 230,
        closeButton: true,
      });

      marker.on('click', () => {
        onSelectRef.current(idx);
      });

      return marker;
    });

    if (attractions.length > 1) {
      const bounds = L.latLngBounds(
        attractions.map((a) => [a.coordinates.lat, a.coordinates.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    }

    mapRef.current = map;
    markersRef.current = createdMarkers;

    return () => {
      markersRef.current = [];
      mapRef.current = null;
      map.remove();
    };
  }, [destinationId, attractions, center.lat, center.lng, defaultZoom]);

  // Sync marker icon styles, popup, and camera when selectedIndex changes
  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || markers.length === 0) return;

    markers.forEach((marker, idx) => {
      const isSelected = selectedIndex === idx;
      marker.setIcon(createPinIcon(idx, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 10 + idx);
    });

    if (selectedIndex === null) {
      map.closePopup();
      return;
    }

    const selectedAttr = attractions[selectedIndex];
    const selectedMarker = markers[selectedIndex];
    if (!selectedAttr || !selectedMarker) return;

    const targetZoom = Math.max(map.getZoom(), 11);
    map.flyTo([selectedAttr.coordinates.lat, selectedAttr.coordinates.lng], targetZoom, {
      duration: 0.55,
    });
    selectedMarker.openPopup();
  }, [selectedIndex, attractions]);

  // Fit all attraction markers when user clicks "Lihat Semua"
  useEffect(() => {
    if (fitSignal === 0) return;
    const map = mapRef.current;
    if (!map) return;

    map.closePopup();
    if (attractions.length > 1) {
      const bounds = L.latLngBounds(
        attractions.map((a) => [a.coordinates.lat, a.coordinates.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13, animate: true });
    } else {
      map.flyTo([center.lat, center.lng], defaultZoom, { duration: 0.5 });
    }
  }, [fitSignal, attractions, center.lat, center.lng, defaultZoom]);

  const handleResetView = () => {
    onSelectAttraction(null);
    setFitSignal((s) => s + 1);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
      {/* Map Toolbar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Compass className="w-3.5 h-3.5 text-[#136F99] shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 truncate">
            {attractions.length} Titik Atraksi • {destinationName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetView}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-[#0B2545] hover:bg-slate-100 transition shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Lihat Semua</span>
        </button>
      </div>

      {/* Interactive OpenStreetMap Canvas (Leaflet) */}
      <div className="relative h-[280px] w-full isolate z-0 bg-slate-100">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Quick Attraction Pin Chips */}
      <div className="px-3 py-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
        {attractions.map((attr, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectAttraction(isSelected ? null : idx)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition shrink-0 ${
                isSelected
                  ? 'bg-[#0B2545] text-white border-[#0B2545]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#136F99]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center ${
                  isSelected ? 'bg-[#D97706] text-white' : 'bg-[#E7F3F8] text-[#136F99]'
                }`}
              >
                {idx + 1}
              </span>
              <span className="max-w-[140px] truncate">{attr.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DestinationAttractionsMap;
