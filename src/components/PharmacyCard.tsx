import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Heart, Navigation, ExternalLink, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { SearchResultItem } from '../types';

interface PharmacyCardProps {
  item: SearchResultItem;
  onSelect: (item: SearchResultItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (pharmacyId: string) => void;
  searchedMedicineName?: string;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  item,
  onSelect,
  isFavorite,
  onToggleFavorite,
  searchedMedicineName,
}) => {
  const { pharmacy, distance_km, inventory_matches, lowest_price } = item;

  // Determine stock badge for primary match
  const matchItem = inventory_matches[0];
  const stockStatus = matchItem?.stock_status || 'out_of_stock';
  const price = matchItem?.price || lowest_price;

  const getStockBadge = () => {
    if (stockStatus === 'in_stock') {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>In Stock ({matchItem?.stock_quantity || 10}+)</span>
        </div>
      );
    }
    if (stockStatus === 'low_stock') {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Low Stock ({matchItem?.stock_quantity || 3} left)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Out of Stock</span>
      </div>
    );
  };

  const openGoogleMapsDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Card Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {pharmacy.name}
                </h3>
                {pharmacy.featured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                    24/7 Priority
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                <div className="flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{distance_km} km away</span>
                </div>
                <span>•</span>
                <span className="text-amber-600 font-bold">★ {pharmacy.rating}</span>
              </div>
            </div>

            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(pharmacy.id);
              }}
              className={`p-2 rounded-full transition-all shrink-0 ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save pharmacy'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-2 line-clamp-1">
            {pharmacy.address}
          </p>
        </div>

        {/* Medicine Search Match Highlight */}
        {matchItem && (
          <div className="px-4 sm:px-5 py-3 bg-emerald-50/70 border-b border-emerald-100/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Searched Item Result
              </div>
              <div className="text-sm font-bold text-slate-900">
                {matchItem.medicine?.name || searchedMedicineName}
                <span className="text-xs text-slate-500 font-normal ml-1">
                  ({matchItem.medicine?.dosage || matchItem.medicine?.generic_name})
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base font-extrabold text-emerald-900">
                ${price ? price.toFixed(2) : 'N/A'}
              </div>
              {getStockBadge()}
            </div>
          </div>
        )}

        {/* Pharmacy Hours & Medical Aids Badges */}
        <div className="p-4 sm:px-5 py-3 space-y-2.5">
          <div className="flex items-center text-xs text-slate-600 space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-800">{pharmacy.opening_hours.days}:</strong> {pharmacy.opening_hours.open} - {pharmacy.opening_hours.close}
            </span>
          </div>

          {pharmacy.medical_aids.length > 0 && (
            <div className="flex items-center text-xs space-x-1.5 overflow-hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {pharmacy.medical_aids.slice(0, 3).map((aid) => (
                  <span
                    key={aid}
                    className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                  >
                    {aid}
                  </span>
                ))}
                {pharmacy.medical_aids.length > 3 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 text-slate-500">
                    +{pharmacy.medical_aids.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 sm:px-5 sm:pb-4 pt-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={`tel:${pharmacy.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center space-x-1"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Call</span>
        </a>

        <button
          onClick={openGoogleMapsDirections}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center space-x-1"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          <span>Directions</span>
        </button>

        <button
          onClick={() => onSelect(item)}
          className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl shadow-sm transition-all flex items-center space-x-1"
        >
          <span>View Inventory</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
