import React from 'react';
import { Cross, ShieldCheck, MapPin, Heart, Settings, LayoutDashboard, Activity, BookOpen, AlertCircle } from 'lucide-react';
import { UserLocation } from '../types';
import { LOCATION_PRESETS } from '../data/locations';

interface NavbarProps {
  currentView: 'patient' | 'admin' | 'outbreak' | 'specs' | 'favorites';
  setCurrentView: (view: 'patient' | 'admin' | 'outbreak' | 'specs' | 'favorites') => void;
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  favoritesCount: number;
  openPrivacyModal: () => void;
  telemetryOptOut: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  userLocation,
  setUserLocation,
  favoritesCount,
  openPrivacyModal,
  telemetryOptOut,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('patient')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
              <Cross className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">MedNest</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-700/80 text-emerald-100 border border-emerald-600/50">
                  Rx Locator
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 hidden sm:block">Find medicine • Compare prices • Locate stock</p>
            </div>
          </div>

          {/* Location Selector (Simulated GPS / District) */}
          <div className="hidden md:flex items-center bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 text-xs px-3 py-1.5 rounded-lg border border-emerald-700/60 transition-all">
            <MapPin className="w-3.5 h-3.5 text-emerald-300 mr-1.5 shrink-0" />
            <span className="font-medium mr-1">Near:</span>
            <select
              className="bg-transparent text-white font-semibold outline-none cursor-pointer pr-1"
              value={userLocation.name}
              onChange={(e) => {
                const found = LOCATION_PRESETS.find(l => l.name === e.target.value);
                if (found) setUserLocation(found);
              }}
            >
              {LOCATION_PRESETS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-emerald-900 text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Views */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Search / Patient view */}
            <button
              onClick={() => setCurrentView('patient')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                currentView === 'patient'
                  ? 'bg-white text-emerald-900 shadow'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Cross className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Favorites */}
            <button
              onClick={() => setCurrentView('favorites')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 relative ${
                currentView === 'favorites'
                  ? 'bg-white text-emerald-900 shadow'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span className="hidden sm:inline">Saved</span>
              {favoritesCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Disease Outbreak Radar */}
            <button
              onClick={() => setCurrentView('outbreak')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                currentView === 'outbreak'
                  ? 'bg-amber-400 text-slate-900 shadow font-semibold'
                  : 'text-amber-200 hover:bg-emerald-800/60'
              }`}
              title="Public Health Disease Outbreak Radar"
            >
              <Activity className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">Outbreak Radar</span>
              <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                AI
              </span>
            </button>

            {/* Admin Portal */}
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                currentView === 'admin'
                  ? 'bg-white text-emerald-900 shadow'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">Pharmacy Portal</span>
            </button>

            {/* Tech Specs */}
            <button
              onClick={() => setCurrentView('specs')}
              className={`p-2 rounded-lg text-emerald-200 hover:bg-emerald-800/60 transition-all ${
                currentView === 'specs' ? 'bg-emerald-800 text-white' : ''
              }`}
              title="App Specs & Data Schema"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Privacy & Surveillance Settings */}
            <button
              onClick={openPrivacyModal}
              className={`p-2 rounded-lg transition-all ${
                telemetryOptOut
                  ? 'text-amber-300 hover:bg-emerald-800'
                  : 'text-emerald-200 hover:bg-emerald-800'
              }`}
              title="Privacy & Location Settings"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
            </button>

          </div>
        </div>
      </div>

      {/* Sub-bar for mobile location info */}
      <div className="md:hidden bg-emerald-950 px-4 py-1.5 text-xs text-emerald-200 flex items-center justify-between border-t border-emerald-800/50">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">{userLocation.name}</span>
        </div>
        <select
          className="bg-emerald-900 text-emerald-100 text-xs rounded px-1.5 py-0.5"
          value={userLocation.name}
          onChange={(e) => {
            const found = LOCATION_PRESETS.find(l => l.name === e.target.value);
            if (found) setUserLocation(found);
          }}
        >
          {LOCATION_PRESETS.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
