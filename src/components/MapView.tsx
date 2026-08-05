import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { SearchResultItem, UserLocation } from '../types';

interface MapViewProps {
  results: SearchResultItem[];
  userLocation: UserLocation;
  onSelectPharmacy: (item: SearchResultItem) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  results,
  userLocation,
  onSelectPharmacy,
}) => {
  const [selectedPin, setSelectedPin] = useState<SearchResultItem | null>(results[0] || null);

  // Normalize map layout coordinates around user center
  const centerLat = userLocation.latitude;
  const centerLng = userLocation.longitude;

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 relative min-h-[480px] flex flex-col justify-between">
      
      {/* Map Graphic Header Controls */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-white shadow-lg flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Live Interactive Pharmacy Map ({results.length} nearby)</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-semibold text-slate-300">
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> In Stock</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Low Stock</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Out of Stock</span>
      </div>

      {/* Simulated Vector / Grid Canvas Map Area */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 overflow-hidden flex items-center justify-center">
        
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Radar Ring around User Center */}
        <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute w-96 h-96 border border-emerald-500/10 rounded-full pointer-events-none"></div>

        {/* USER LOCATION PIN */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
          style={{
            top: '50%',
            left: '50%',
          }}
        >
          <div className="bg-sky-500 text-white p-2 rounded-full shadow-lg ring-4 ring-sky-500/30">
            <MapPin className="w-5 h-5 fill-white stroke-sky-700" />
          </div>
          <span className="bg-sky-950 text-sky-200 text-[10px] font-extrabold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-sky-800">
            YOU ARE HERE ({userLocation.name.split(' ')[0]})
          </span>
        </div>

        {/* PHARMACY PINS */}
        {results.map((item, idx) => {
          const { pharmacy, inventory_matches } = item;
          const matchItem = inventory_matches[0];
          const stockStatus = matchItem?.stock_status || 'out_of_stock';

          // Position pin offset relative to user center
          const deltaLat = (pharmacy.latitude - centerLat) * 3200;
          const deltaLng = (pharmacy.longitude - centerLng) * 3200;

          const topPercent = Math.min(Math.max(50 - deltaLat, 10), 90);
          const leftPercent = Math.min(Math.max(50 + deltaLng, 10), 90);

          const pinColor =
            stockStatus === 'in_stock'
              ? 'bg-emerald-500 ring-emerald-500/40 text-emerald-950'
              : stockStatus === 'low_stock'
              ? 'bg-amber-500 ring-amber-500/40 text-amber-950'
              : 'bg-rose-500 ring-rose-500/40 text-rose-950';

          const isSelected = selectedPin?.pharmacy.id === pharmacy.id;

          return (
            <div
              key={pharmacy.id}
              onClick={() => setSelectedPin(item)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform duration-200 hover:scale-110"
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
              }}
            >
              <div
                className={`p-2.5 rounded-2xl shadow-xl ring-4 font-bold ${pinColor} ${
                  isSelected ? 'scale-125 ring-8 ring-white/60 shadow-2xl z-30' : ''
                }`}
              >
                <MapPin className="w-4 h-4 fill-current stroke-slate-900" />
              </div>

              <div
                className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white text-slate-950 border-emerald-500'
                    : 'bg-slate-900 text-slate-200 border-slate-700/80 group-hover:bg-slate-800'
                }`}
              >
                {pharmacy.name.split(' ')[0]} ({item.distance_km}km)
              </div>
            </div>
          );
        })}

      </div>

      {/* Selected Pharmacy Floating Popup Banner */}
      {selectedPin && (
        <div className="bg-slate-900/95 backdrop-blur-md p-4 border-t border-slate-800 text-white z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-base font-bold text-white">{selectedPin.pharmacy.name}</h4>
              <span className="text-xs text-emerald-400 font-semibold">{selectedPin.distance_km} km away</span>
            </div>
            <p className="text-xs text-slate-400">{selectedPin.pharmacy.address}</p>
            
            {selectedPin.inventory_matches[0] && (
              <div className="text-xs text-emerald-300 mt-1 font-semibold">
                Price: ${selectedPin.inventory_matches[0].price.toFixed(2)} • Status:{' '}
                <span className="capitalize">{selectedPin.inventory_matches[0].stock_status.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPin.pharmacy.latitude},${selectedPin.pharmacy.longitude}`;
                window.open(url, '_blank');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center space-x-1"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Directions</span>
            </button>

            <button
              onClick={() => onSelectPharmacy(selectedPin)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center space-x-1"
            >
              <span>Full Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
