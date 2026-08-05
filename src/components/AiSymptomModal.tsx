import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { analyzeSymptomsWithAiApi } from '../services/api';

interface AiSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedicine: (medName: string) => void;
}

export const AiSymptomModal: React.FC<AiSymptomModalProps> = ({
  isOpen,
  onClose,
  onSelectMedicine,
}) => {
  const [symptomPrompt, setSymptomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ guidance?: string; recommended_medicines?: string[] } | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomPrompt.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeSymptomsWithAiApi(symptomPrompt);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        guidance: "Common medications for fever & body pain include Paracetamol (Panado) or Ibuprofen (Nurofen). Always consult a healthcare professional.",
        recommended_medicines: ['Panado', 'Nurofen Express', 'Benylin 4-Flu']
      });
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "High fever, body aches, and dry cough",
    "Seasonal allergies, sneezing, and runny nose",
    "Mild acid reflux and heartburn after meals",
    "Wheezing and shortness of breath during exercise",
  ];

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
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Powered by Gemini AI
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            AI Symptom & Medicine Finder
          </h2>
          <p className="text-xs text-slate-500">
            Not sure of the medicine name? Describe your symptoms, and MedNest AI will identify potential over-the-counter options.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyzeSymptoms} className="space-y-3">
          <textarea
            rows={3}
            value={symptomPrompt}
            onChange={(e) => setSymptomPrompt(e.target.value)}
            placeholder="Describe your symptoms (e.g. 'I have a sore throat, nasal congestion, and mild fever')..."
            className="w-full border border-slate-300 rounded-2xl p-3.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
          />

          {/* Quick suggestions */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Or tap a sample prompt:</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSymptomPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium text-left"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !symptomPrompt.trim()}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold py-3 rounded-2xl shadow transition-all text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{loading ? 'Analyzing Symptoms with AI...' : 'Identify Matching Medicine'}</span>
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3 animate-in fade-in">
            <div className="text-xs text-emerald-950 font-medium leading-relaxed">
              {result.guidance}
            </div>

            {result.recommended_medicines && result.recommended_medicines.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Recommended Catalog Items to Search:
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_medicines.map(med => (
                    <button
                      key={med}
                      onClick={() => {
                        onSelectMedicine(med);
                        onClose();
                      }}
                      className="text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs transition-all flex items-center space-x-1"
                    >
                      <span>Check Stock for "{med}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] text-emerald-800/80 flex items-center space-x-1 pt-1">
              <ShieldAlert className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>Medical Disclaimer: AI guidance is for informational purposes. Always consult a medical professional.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
