import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, X, Check, Shield, AlertTriangle, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Medicine } from '../types';
import { COMMON_MEDICAL_AIDS } from '../data/locations';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: (q: string) => void;
  selectedMedicalAid: string;
  setSelectedMedicalAid: (aid: string) => void;
  maxDistance: number;
  setMaxDistance: (dist: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (v: boolean) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  onOpenAiAssistant: () => void;
  viewMode: 'list' | 'map';
  setViewMode: (v: 'list' | 'map') => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  selectedMedicalAid,
  setSelectedMedicalAid,
  maxDistance,
  setMaxDistance,
  inStockOnly,
  setInStockOnly,
  openNowOnly,
  setOpenNowOnly,
  sortBy,
  setSortBy,
  onOpenAiAssistant,
  viewMode,
  setViewMode,
}) => {
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Fetch autocomplete suggestions as user types
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/medicines?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSuggestions(data.slice(0, 5));
        })
        .catch(() => setSuggestions([]));
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (med: Medicine) => {
    setSearchQuery(med.name);
    setShowSuggestions(false);
    onSearch(med.name);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchQuery);
  };

  const quickCategories = [
    { label: 'All Medicines', query: '' },
    { label: 'Panado / Paracetamol', query: 'Panado' },
    { label: 'Ibuprofen', query: 'Ibuprofen' },
    { label: 'Flu & Cold', query: 'Flu' },
    { label: 'Allergy / Zyrtec', query: 'Zyrtec' },
    { label: 'Antibiotics', query: 'Amoxil' },
    { label: 'Asthma Inhaler', query: 'Ventolin' },
  ];

  return (
    <div className="bg-emerald-900/95 text-white pb-6 pt-4 px-4 sm:px-6 shadow-inner border-b border-emerald-800">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Title / Hero note */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
            Find Medicine & Nearby Pharmacies
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200">
            Check real-time stock, compare prices, and match accepted medical aids instantly.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type medicine name (e.g. Panado, Amoxil, Zyrtec) or generic name..."
                className="w-full pl-11 pr-24 py-3.5 bg-white text-slate-900 rounded-2xl shadow-xl border-2 border-emerald-400 focus:border-emerald-600 focus:outline-none text-sm sm:text-base font-medium placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    onSearch('');
                  }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="ml-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3.5 rounded-2xl shadow-lg transition-all text-sm shrink-0 flex items-center space-x-1.5"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-emerald-50 text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Matching Medicines in Catalog
              </div>
              {suggestions.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(med)}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-700 text-sm">
                      {med.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Generic: <span className="font-medium text-slate-700">{med.generic_name}</span> {med.dosage ? `• ${med.dosage}` : ''}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                    {med.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Category Chips & AI Assistant Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setSearchQuery(cat.query);
                  onSearch(cat.query);
                }}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  searchQuery === cat.query
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow'
                    : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700 border border-emerald-700/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* AI Symptom Search Trigger Button */}
          <button
            onClick={onOpenAiAssistant}
            className="text-xs bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-3 py-1.5 rounded-full font-semibold shadow hover:brightness-105 transition-all flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>AI Symptom Search</span>
          </button>
        </div>

        {/* Controls Bar: Filters, Sort, View Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800/70 text-xs">
          
          <div className="flex items-center space-x-3 overflow-x-auto">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 font-medium transition-all ${
                selectedMedicalAid || inStockOnly || openNowOnly || maxDistance < 50
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-emerald-800/60 border-emerald-700 text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedMedicalAid || inStockOnly || openNowOnly || maxDistance < 50) && (
                <span className="w-2 h-2 rounded-full bg-slate-950 ml-1"></span>
              )}
            </button>

            {/* Quick In Stock Filter */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                inStockOnly
                  ? 'bg-emerald-400 text-emerald-950 font-bold border-emerald-300'
                  : 'bg-emerald-800/40 border-emerald-700/70 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              In Stock Only
            </button>

            {/* Medical Aid Quick Selector */}
            <select
              value={selectedMedicalAid}
              onChange={(e) => setSelectedMedicalAid(e.target.value)}
              className="bg-emerald-800/80 text-emerald-100 border border-emerald-700/80 rounded-lg px-2.5 py-1.5 font-medium outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="" className="bg-emerald-900 text-white">All Medical Aids</option>
              {COMMON_MEDICAL_AIDS.map(aid => (
                <option key={aid} value={aid} className="bg-emerald-900 text-white">{aid}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1 bg-emerald-800/80 border border-emerald-700/80 rounded-lg px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-emerald-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-emerald-100 font-medium outline-none cursor-pointer"
              >
                <option value="distance" className="bg-emerald-900 text-white">Sort: Nearest</option>
                <option value="price" className="bg-emerald-900 text-white">Sort: Lowest Price</option>
                <option value="rating" className="bg-emerald-900 text-white">Sort: Top Rated</option>
              </select>
            </div>
          </div>

          {/* Map vs List View Toggle */}
          <div className="flex items-center bg-emerald-950/80 p-0.5 rounded-lg border border-emerald-700/60 shrink-0 ml-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-950 shadow'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-950 shadow'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              Map
            </button>
          </div>

        </div>

      </div>

      {/* Expanded Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                <span>Search & Pharmacy Filters</span>
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-700">Maximum Distance</span>
                <span className="text-emerald-700 font-bold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>1 km</span>
                <span>15 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Medical Aid Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Accepted Medical Aid / Insurance Scheme
              </label>
              <select
                value={selectedMedicalAid}
                onChange={(e) => setSelectedMedicalAid(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">All Medical Aids Accepted</option>
                {COMMON_MEDICAL_AIDS.map(aid => (
                  <option key={aid} value={aid}>{aid}</option>
                ))}
              </select>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-800">Only show pharmacies with medicine In Stock</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-800">Only show pharmacies currently Open</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t space-x-3">
              <button
                onClick={() => {
                  setSelectedMedicalAid('');
                  setMaxDistance(50);
                  setInStockOnly(false);
                  setOpenNowOnly(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Reset All Filters
              </button>

              <button
                onClick={() => setShowFiltersModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
