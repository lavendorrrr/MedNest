import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchHeader } from './components/SearchHeader';
import { PharmacyCard } from './components/PharmacyCard';
import { MapView } from './components/MapView';
import { PharmacyDetailModal } from './components/PharmacyDetailModal';
import { FavoritesView } from './components/FavoritesView';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { AdminPortal } from './components/AdminPortal';
import { OutbreakRadar } from './components/OutbreakRadar';
import { TechSpecsView } from './components/TechSpecsView';
import { AiSymptomModal } from './components/AiSymptomModal';
import { SearchResponse, SearchResultItem, UserLocation } from './types';
import { LOCATION_PRESETS } from './data/locations';
import { searchMedicinesApi, logSearchTelemetryApi } from './services/api';
import { Activity, ShieldCheck, Heart, Search, MapPin, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'patient' | 'admin' | 'outbreak' | 'specs' | 'favorites'>('patient');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters & User Location
  const [userLocation, setUserLocation] = useState<UserLocation>(LOCATION_PRESETS[0]);
  const [selectedMedicalAid, setSelectedMedicalAid] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Favorites & Settings
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mednest_favorites');
      return saved ? JSON.parse(saved) : ['pharm-1', 'pharm-5'];
    } catch {
      return ['pharm-1', 'pharm-5'];
    }
  });

  const [telemetryOptOut, setTelemetryOptOut] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mednest_opt_out') === 'true';
    } catch {
      return false;
    }
  });

  // Modals
  const [selectedPharmacyItem, setSelectedPharmacyItem] = useState<SearchResultItem | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mednest_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('mednest_opt_out', String(telemetryOptOut));
    } catch {}
  }, [telemetryOptOut]);

  // Execute Search API call with client fallback
  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const data = await searchMedicinesApi({
        q: q.trim(),
        userLat: userLocation.latitude,
        userLng: userLocation.longitude,
        medicalAid: selectedMedicalAid,
        maxDistance,
        inStockOnly,
        openNowOnly,
        sortBy,
      });
      setSearchResults(data);

      // Silent background search log for Disease Outbreak Surveillance
      if (q.trim().length > 1) {
        logSearchTelemetryApi({
          medicine_name: q.trim(),
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          opt_out: telemetryOptOut,
          session_id: 'anon-device-sess-' + Math.floor(Math.random() * 100000),
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes or location change
  useEffect(() => {
    performSearch(searchQuery);
  }, [userLocation, selectedMedicalAid, maxDistance, inStockOnly, openNowOnly, sortBy]);

  const toggleFavorite = (pharmacyId: string) => {
    setFavorites(prev =>
      prev.includes(pharmacyId)
        ? prev.filter(id => id !== pharmacyId)
        : [...prev, pharmacyId]
    );
  };

  // Favorites list computation
  const favoriteItems: SearchResultItem[] = (searchResults?.results || []).filter(r =>
    favorites.includes(r.pharmacy.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-200">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        favoritesCount={favorites.length}
        openPrivacyModal={() => setShowPrivacyModal(true)}
        telemetryOptOut={telemetryOptOut}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'patient' && (
          <div className="space-y-6">
            
            {/* Search Header Bar */}
            <SearchHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={(q) => performSearch(q)}
              selectedMedicalAid={selectedMedicalAid}
              setSelectedMedicalAid={setSelectedMedicalAid}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              openNowOnly={openNowOnly}
              setOpenNowOnly={setOpenNowOnly}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onOpenAiAssistant={() => setShowAiModal(true)}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
              
              {/* Results Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {searchQuery ? (
                      <span>Pharmacies stocking <strong className="text-emerald-700">"{searchQuery}"</strong></span>
                    ) : (
                      <span>Nearby Pharmacies ({searchResults?.results.length || 0} found)</span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sorted by {sortBy === 'price' ? 'lowest medicine price' : sortBy === 'rating' ? 'highest rating' : 'nearest distance'} • Within {maxDistance}km
                  </p>
                </div>

                {!telemetryOptOut && (
                  <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Anonymized outbreak surveillance active</span>
                  </div>
                )}
              </div>

              {/* Main Results: List View vs Map View */}
              {loading ? (
                <div className="py-20 text-center text-slate-500 space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold">Searching nearby pharmacy inventory & matching stock...</p>
                </div>
              ) : searchResults?.results.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No matching pharmacies found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try increasing your maximum distance slider, resetting filters, or searching for a generic medicine name (e.g. Paracetamol).
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMedicalAid('');
                      setMaxDistance(50);
                      setInStockOnly(false);
                      setOpenNowOnly(false);
                    }}
                    className="bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow mt-2"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults?.results.map((item) => (
                    <PharmacyCard
                      key={item.pharmacy.id}
                      item={item}
                      onSelect={(selected) => setSelectedPharmacyItem(selected)}
                      isFavorite={favorites.includes(item.pharmacy.id)}
                      onToggleFavorite={toggleFavorite}
                      searchedMedicineName={searchQuery}
                    />
                  ))}
                </div>
              ) : (
                <MapView
                  results={searchResults?.results || []}
                  userLocation={userLocation}
                  onSelectPharmacy={(selected) => setSelectedPharmacyItem(selected)}
                />
              )}

            </div>
          </div>
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoriteItems={favoriteItems}
            onSelectPharmacy={(item) => setSelectedPharmacyItem(item)}
            onToggleFavorite={toggleFavorite}
            onClearAll={() => setFavorites([])}
          />
        )}

        {currentView === 'admin' && <AdminPortal />}

        {currentView === 'outbreak' && <OutbreakRadar />}

        {currentView === 'specs' && <TechSpecsView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">✚</div>
            <span className="font-bold text-white text-sm">MedNest</span>
            <span>• Medicine Search & Pharmacy Locator</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-emerald-400 transition-colors">
              Privacy & Surveillance Notice
            </button>
            <button onClick={() => setCurrentView('specs')} className="hover:text-emerald-400 transition-colors">
              Tech Stack & Schemas
            </button>
            <button onClick={() => setCurrentView('admin')} className="hover:text-emerald-400 transition-colors">
              Pharmacy Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PharmacyDetailModal
        selectedItem={selectedPharmacyItem}
        onClose={() => setSelectedPharmacyItem(null)}
        isFavorite={selectedPharmacyItem ? favorites.includes(selectedPharmacyItem.pharmacy.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <AiSymptomModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSelectMedicine={(med) => {
          setSearchQuery(med);
          performSearch(med);
        }}
      />

      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        telemetryOptOut={telemetryOptOut}
        setTelemetryOptOut={setTelemetryOptOut}
      />

    </div>
  );
}
