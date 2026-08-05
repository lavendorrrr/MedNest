import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock, ShieldCheck, Search, Navigation, AlertCircle, CheckCircle2, XCircle, Heart } from 'lucide-react';
import { SearchResultItem, PharmacyMedicine } from '../types';

interface PharmacyDetailModalProps {
  selectedItem: SearchResultItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const PharmacyDetailModal: React.FC<PharmacyDetailModalProps> = ({
  selectedItem,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [inventoryList, setInventoryList] = useState<PharmacyMedicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [invFilter, setInvFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (!selectedItem) return;

    setLoading(true);
    fetch(`/api/pharmacies/${selectedItem.pharmacy.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.inventory) {
          setInventoryList(data.inventory);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedItem]);

  if (!selectedItem) return null;

  const { pharmacy, distance_km } = selectedItem;

  const filteredInventory = inventoryList.filter(item => {
    const medName = item.medicine?.name.toLowerCase() || '';
    const genericName = item.medicine?.generic_name.toLowerCase() || '';
    const matchesQuery = medName.includes(invFilter.toLowerCase()) || genericName.includes(invFilter.toLowerCase());
    const matchesCategory = !categoryFilter || item.medicine?.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-emerald-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between pr-8">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-700 text-emerald-200 mb-2 inline-block">
                Pharmacy Detail & Stock Catalog
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {pharmacy.name}
              </h2>
              <p className="text-xs text-emerald-200 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {pharmacy.address} • <strong className="ml-1 text-white">{distance_km} km away</strong>
              </p>
            </div>

            <button
              onClick={() => onToggleFavorite(pharmacy.id)}
              className={`p-2.5 rounded-2xl transition-all shrink-0 ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-800 text-emerald-200 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Quick Bar: Operating Hours & Phone */}
          <div className="mt-4 pt-4 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-100">
              <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
              <span><strong>{pharmacy.opening_hours.days}:</strong> {pharmacy.opening_hours.open} - {pharmacy.opening_hours.close}</span>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <a
                href={`tel:${pharmacy.phone}`}
                className="flex items-center space-x-1 text-emerald-200 hover:text-white underline font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{pharmacy.phone}</span>
              </a>

              <button
                onClick={openDirections}
                className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Accepted Medical Aid Schemes */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Accepted Medical Aid & Insurance Schemes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pharmacy.medical_aids.map(aid => (
              <span
                key={aid}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs"
              >
                {aid}
              </span>
            ))}
          </div>
        </div>

        {/* Medicine Inventory Catalog Search */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Stock Catalog ({inventoryList.length} items)
            </h3>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter stock..."
                  value={invFilter}
                  onChange={(e) => setInvFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">All Categories</option>
                <option value="Over-the-Counter">Over-the-Counter</option>
                <option value="Prescription">Prescription</option>
                <option value="Chronic Care">Chronic Care</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading pharmacy inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No medicines match your search filter in this pharmacy catalog.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              {filteredInventory.map((item) => (
                <div key={item.medicine_id} className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{item.medicine?.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.medicine?.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Generic: <strong className="text-slate-700">{item.medicine?.generic_name}</strong> {item.medicine?.dosage ? `• ${item.medicine.dosage}` : ''}
                    </div>
                    {item.medicine?.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.medicine.description}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <div className="text-base font-extrabold text-slate-900">
                      ${item.price.toFixed(2)}
                    </div>
                    
                    {item.stock_status === 'in_stock' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>In Stock ({item.stock_quantity})</span>
                      </span>
                    ) : item.stock_status === 'low_stock' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Low Stock ({item.stock_quantity})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Prices & stock quantities updated regularly by pharmacy staff.</span>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
