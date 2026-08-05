import React from 'react';
import { BookOpen, Smartphone, Server, Database, Shield, CheckCircle2, Code2, Cpu } from 'lucide-react';

export const TechSpecsView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-emerald-700" />
          <h2 className="text-2xl font-extrabold text-slate-900">
            MedNest — Architecture, Tech Stack & Data Schema
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Technical design specifications, cross-platform mobile architecture recommendation, and relational data schemas.
        </p>
      </div>

      {/* Recommended Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mobile Client */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Mobile Frontend Stack</h3>
          <p className="text-xs text-slate-500">
            Recommended: <strong>Flutter (Dart)</strong> or <strong>React Native (TypeScript)</strong>
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 divide-y divide-slate-100">
            <li className="pt-2">✔ <strong>Cross-platform:</strong> iOS & Android from a single codebase.</li>
            <li className="pt-2">✔ <strong>Geolocation:</strong> Background GPS sampling for distance calculation & anonymized search logging.</li>
            <li className="pt-2">✔ <strong>Offline First:</strong> Local cache (Hive / WatermelonDB) for saved favorite pharmacies.</li>
          </ul>
        </div>

        {/* Backend Engine */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Server className="w-6 h-6 text-sky-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Backend API Services</h3>
          <p className="text-xs text-slate-500">
            Recommended: <strong>Node.js / Express</strong> or <strong>Firebase Cloud Functions</strong>
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 divide-y divide-slate-100">
            <li className="pt-2">✔ <strong>REST / GraphQL API:</strong> Fast search endpoints with distance sorting algorithms.</li>
            <li className="pt-2">✔ <strong>De-identification Pipeline:</strong> Anonymizes user search logs before storing.</li>
            <li className="pt-2">✔ <strong>AI Integration:</strong> Gemini 3.6 Flash for natural language symptom search & outbreak summaries.</li>
          </ul>
        </div>

        {/* Database Layer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Database className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Persistence & Analytics</h3>
          <p className="text-xs text-slate-500">
            Recommended: <strong>PostgreSQL (PostGIS)</strong> or <strong>Firebase Firestore</strong>
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 divide-y divide-slate-100">
            <li className="pt-2">✔ <strong>PostGIS Geo-indexing:</strong> Haversine / Spatial queries for instant radius lookup.</li>
            <li className="pt-2">✔ <strong>TimeSeries Logs:</strong> Aggregated search telemetry for disease outbreak prediction.</li>
            <li className="pt-2">✔ <strong>Security Rules:</strong> Role-based access control for Pharmacy Staff vs General Public.</li>
          </ul>
        </div>

      </div>

      {/* Relational Data Schema Documentation */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Database Schema Design</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          
          {/* Pharmacy Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block text-sm">TABLE Pharmacy</span>
            <div className="text-slate-300 space-y-1">
              <div>id: VARCHAR(36) [PRIMARY KEY]</div>
              <div>name: VARCHAR(100) NOT NULL</div>
              <div>address: TEXT NOT NULL</div>
              <div>latitude: DECIMAL(9,6) NOT NULL</div>
              <div>longitude: DECIMAL(9,6) NOT NULL</div>
              <div>phone: VARCHAR(20)</div>
              <div>opening_hours: JSONB</div>
              <div>medical_aids: TEXT[]</div>
              <div>status: ENUM('active', 'inactive')</div>
            </div>
          </div>

          {/* Medicine Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-sky-400 font-bold block text-sm">TABLE Medicine</span>
            <div className="text-slate-300 space-y-1">
              <div>id: VARCHAR(36) [PRIMARY KEY]</div>
              <div>name: VARCHAR(100) NOT NULL</div>
              <div>generic_name: VARCHAR(100) NOT NULL</div>
              <div>category: VARCHAR(50)</div>
              <div>dosage: VARCHAR(50)</div>
              <div>description: TEXT</div>
            </div>
          </div>

          {/* Junction Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold block text-sm">TABLE PharmacyMedicine (Junction)</span>
            <div className="text-slate-300 space-y-1">
              <div>pharmacy_id: VARCHAR(36) [FOREIGN KEY]</div>
              <div>medicine_id: VARCHAR(36) [FOREIGN KEY]</div>
              <div>price: DECIMAL(10,2) NOT NULL</div>
              <div>stock_quantity: INTEGER DEFAULT 0</div>
              <div>stock_status: ENUM('in_stock', 'low_stock', 'out_of_stock')</div>
              <div>last_updated: TIMESTAMP WITH TIME ZONE</div>
            </div>
          </div>

          {/* Anonymized SearchLog */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-rose-400 font-bold block text-sm">TABLE SearchLog (De-identified)</span>
            <div className="text-slate-300 space-y-1">
              <div>id: VARCHAR(36) [PRIMARY KEY]</div>
              <div>medicine_name: VARCHAR(100) NOT NULL</div>
              <div>latitude: DECIMAL(9,6) NOT NULL</div>
              <div>longitude: DECIMAL(9,6) NOT NULL</div>
              <div>region: VARCHAR(50)</div>
              <div>timestamp: TIMESTAMP WITH TIME ZONE</div>
              <div>session_id: VARCHAR(64) [HASHED / ANONYMOUS]</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
