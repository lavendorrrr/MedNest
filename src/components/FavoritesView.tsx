import React from 'react';
import { Heart, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { SearchResultItem } from '../types';
import { PharmacyCard } from './PharmacyCard';

interface FavoritesViewProps {
  favoriteItems: SearchResultItem[];
  onSelectPharmacy: (item: SearchResultItem) => void;
  onToggleFavorite: (id: string) => void;
  onClearAll: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteItems,
  onSelectPharmacy,
  onToggleFavorite,
  onClearAll,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Saved Favorite Pharmacies</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quickly check stock levels and prices at your trusted local chemists.
          </p>
        </div>

        {favoriteItems.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Saved</span>
          </button>
        )}
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Saved Pharmacies Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When searching for medicines, tap the heart icon on any pharmacy card to save it here for fast one-tap access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item) => (
            <PharmacyCard
              key={item.pharmacy.id}
              item={item}
              onSelect={onSelectPharmacy}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

    </div>
  );
};
