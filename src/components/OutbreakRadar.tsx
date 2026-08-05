import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Sparkles, MapPin, TrendingUp, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { OutbreakData } from '../types';
import { fetchOutbreaksApi, analyzeSymptomsWithAiApi } from '../services/api';

export const OutbreakRadar: React.FC = () => {
  const [data, setData] = useState<OutbreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchOutbreaks = async () => {
    setLoading(true);
    try {
      const resData = await fetchOutbreaksApi();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbreaks();
  }, []);

  const generateAiReport = async () => {
    setGeneratingAi(true);
    try {
      const resData = await analyzeSymptomsWithAiApi('', 'outbreak_report');
      if (resData && (resData.response || resData.guidance)) {
        setAiReport(resData.response || resData.guidance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <Activity className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
        <p className="text-sm font-semibold">Analyzing anonymized search telemetry for regional outbreak signals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-amber-900/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Surveillance Radar
            </span>
            <span className="text-amber-200 text-xs font-semibold">
              Live Anonymized Search Telemetry
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Disease Outbreak Early Warning Engine
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            MedNest aggregates anonymized, de-identified medicine search queries (medicine name + approximate GPS zone) in real-time. By detecting localized spikes in antipyretic, antiviral, or antibiotic searches, public health officials can spot viral outbreaks days before official clinical admissions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 font-semibold text-amber-300 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>{data?.total_logs || 0} Telemetry Samples Logged</span>
            </div>

            <button
              onClick={generateAiReport}
              disabled={generatingAi}
              className="bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold px-4 py-1.5 rounded-xl shadow transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{generatingAi ? 'Generating AI Epidemiological Brief...' : 'Generate AI Outbreak Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Epidemiological Brief Output */}
      {aiReport && (
        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gemini AI Epidemiologist Assessment</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              AI Insight
            </span>
          </div>

          <div className="text-xs text-amber-950 whitespace-pre-line leading-relaxed font-medium">
            {aiReport}
          </div>
        </div>
      )}

      {/* Spike Alert Banners */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Active Regional Demand Spike Warnings</span>
        </h3>

        {data?.outbreak_alerts && data.outbreak_alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.outbreak_alerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-amber-400 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                  {alert.severity} SURGE SEVERITY
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <h4 className="font-extrabold text-slate-900 text-base">{alert.title}</h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {alert.primary_symptoms.map(sym => (
                      <span key={sym} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>No critical demand spikes detected across monitored districts at this time.</span>
          </div>
        )}
      </div>

      {/* Regional Telemetry Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <span>Regional Search Volume & Frequently Searched Medications</span>
        </h3>

        {data?.regional_breakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.regional_breakdown).map(([region, regData]: [string, any]) => (
              <div key={region} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-slate-900 text-sm">{region}</span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {regData.total_searches} searches
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Medicines Searched</div>
                  <div className="space-y-1">
                    {Object.entries(regData.top_medicines).map(([med, count]) => (
                      <div key={med} className="flex justify-between text-slate-700 font-medium">
                        <span>{med}</span>
                        <span className="font-bold text-slate-900">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
