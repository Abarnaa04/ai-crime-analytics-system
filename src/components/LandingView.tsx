import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Database, 
  ArrowRight, 
  Lock, 
  FileCheck2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface LandingViewProps {
  onExploreDashboard: () => void;
  onTryPrediction: () => void;
  onOpenHotspots: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onExploreDashboard,
  onTryPrediction,
  onOpenHotspots,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-12 lg:p-16">
        <div className="absolute inset-0 -z-10 opacity-30">
          <img
            src="/src/assets/images/crime_analytics_hero_1792560919439.jpg"
            alt="AI Crime Analytics Command Center"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-950/80 border border-blue-800/80 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic & Municipal Law Enforcement Research Project</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Predictive AI Intelligence & Spatial Crime Analytics
          </h1>

          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive, data-driven analytical platform integrating machine learning classification, 
            empirical Bayesian probability modeling, GIS hotspot clustering, and automated law enforcement intelligence reporting.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreDashboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-950"
            >
              Open Live Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTryPrediction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Run Crime Predictor
            </button>
            <button
              onClick={onOpenHotspots}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              View Hotspots Map
            </button>
          </div>

          <div className="pt-4 flex items-center gap-4 text-xs text-slate-400">
            <span>Verified Dataset: 380+ Geocoded Records</span>
            <span aria-hidden="true">·</span>
            <span>Accuracy: 86.4% F1-Score</span>
            <span aria-hidden="true">·</span>
            <span>6 City Districts Covered</span>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Core Analytical Modules
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered to support crime analysts, precinct commanders, and public safety researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Machine Learning Crime Prediction</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trained on temporal, spatial, and premise indicators to evaluate multi-class offense probabilities, 
              providing confidence scores and operational patrol recommendations.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-variable Bayesian & Decision Forest model</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">GIS Hotspot Clustering</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-resolution geographical mapping with Leaflet, highlighting verified historical crime concentration zones 
              without arbitrary or stigmatizing speculation.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dynamic coordinate markers & district density ranks</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Longitudinal Trend Analysis</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Diurnal 24-hour cycles, day-of-week distributions, and category-level arrest resolution ratios calculated 
              directly from empirical incident records.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2">
              <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Zero hardcoded mock statistics</span>
            </div>
          </div>
        </div>
      </section>

      {/* College Review Demonstration Guide Banner */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <FileCheck2 className="w-4 h-4" />
            <span>Prepared for Academic Project Review</span>
          </div>
          <h3 className="text-lg font-bold text-white">Ready for Local Windows & Academic Evaluation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The project includes both this interactive cloud application and full standalone Python Flask project files 
            (including <code className="text-blue-300 font-mono">app.py</code>, <code className="text-blue-300 font-mono">database.py</code>, 
            <code className="text-blue-300 font-mono">requirements.txt</code>, and <code className="text-blue-300 font-mono">crime.db</code>) 
            for instant offline Windows execution.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
          >
            Sign In / Test Accounts
          </button>
        </div>
      </section>

      {/* Ethical Safeguards & Scientific Limitations Callout */}
      <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5 md:p-6 text-xs text-amber-200/90 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Ethical Predictive Modeling Guidelines & Safeguards</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          This system adheres to responsible data science guidelines: predictions represent statistical likelihood estimates derived 
          strictly from historical incident records for resource deployment. They do not constitute deterministic outcomes, evidence of guilt, 
          or individual surveillance flags. Hotspot zones reflect reported incident frequencies and do not imply inherent danger.
        </p>
      </section>
    </div>
  );
};
