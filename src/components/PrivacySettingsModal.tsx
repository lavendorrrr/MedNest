import React from 'react';
import { ShieldCheck, MapPin, Activity, Lock, X, CheckCircle } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryOptOut: boolean;
  setTelemetryOptOut: (v: boolean) => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  telemetryOptOut,
  setTelemetryOptOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 space-y-6 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Location & Public Health Privacy Notice
          </h2>
          <p className="text-xs text-slate-500">
            MedNest values your privacy and handles all location and search telemetry securely.
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-4 text-xs text-slate-700 divide-y divide-slate-100">
          
          <div className="pt-2 flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm">1. Why Location Data is Used</strong>
              <p className="text-slate-500 mt-0.5">
                Your approximate GPS coordinates are used to calculate distances to nearby pharmacies, show map pins, and verify which local stores have your required medicine in stock.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-start space-x-3">
            <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm">2. Disease Outbreak Early Warning System</strong>
              <p className="text-slate-500 mt-0.5">
                Searches for specific medicines (e.g., flu remedies, antibiotics) are logged in aggregate by region to detect early spikes in disease demand before official hospital records, serving as a public health radar.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-start space-x-3">
            <Lock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm">3. Complete De-identification</strong>
              <p className="text-slate-500 mt-0.5">
                No personal information (such as your name, email, or phone number) is tied to medicine search logs. Telemetry stores only anonymized session hashes and coarse geographic regions.
              </p>
            </div>
          </div>

        </div>

        {/* Opt Out Toggle Box */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-900 block">Anonymized Public Health Logging</span>
              <span className="text-xs text-slate-500">Contribute to regional disease outbreak detection</span>
            </div>

            <button
              onClick={() => setTelemetryOptOut(!telemetryOptOut)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                !telemetryOptOut ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  !telemetryOptOut ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {telemetryOptOut ? (
            <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚠️ You have opted out of background surveillance telemetry. Pharmacy search & price locator functionality will continue to work normally.
            </div>
          ) : (
            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Background disease surveillance logging active (Opted In).</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-2xl shadow transition-all text-sm"
        >
          Save Privacy Preferences
        </button>

      </div>
    </div>
  );
};
