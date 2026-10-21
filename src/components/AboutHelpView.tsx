import React from 'react';
import { 
  HelpCircle, 
  Terminal, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  FileCheck, 
  Layers, 
  ExternalLink,
  BookOpen,
  CheckCircle2,
  FolderSync,
  AlertTriangle
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface AboutHelpViewProps {
  onNavigateToView: (view: string) => void;
  onBack?: () => void;
}

export const AboutHelpView: React.FC<AboutHelpViewProps> = ({ 
  onNavigateToView,
  onBack = () => {},
}) => {
  return (
    <div className="max-w-4xl space-y-10 pb-16">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Project Review Documentation & Local Run Guide"
        subtitle="Comprehensive project handbook for academic committee review and local deployment on Windows."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Documentation & Guide' }
        ]}
        onNavigate={onNavigateToView}
        badge={
          <span className="text-[11px] font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Academic Review Edition</span>
          </span>
        }
      />

      {/* College Review Demonstration Walkthrough Box */}
      <div className="bg-blue-950/40 border border-blue-800/80 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <span>Recommended 5-Step College Project Review Demonstration Sequence</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Follow this structured sequence to demonstrate all core project competencies to your academic evaluators:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-blue-400">Step 1</span>
            <div className="text-xs font-semibold text-white">Dashboard Overview</div>
            <p className="text-[11px] text-slate-400">
              Present the 380+ incident records, filter by district, and demonstrate diurnal 24-hr peaks.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-blue-400">Step 2</span>
            <div className="text-xs font-semibold text-white">Crime Predictor</div>
            <p className="text-[11px] text-slate-400">
              Select the "Weekend Nightlife" preset, show 58.7% confidence for Battery, and save to history.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-blue-400">Step 3</span>
            <div className="text-xs font-semibold text-white">Snap Map GIS & Bitmoji</div>
            <p className="text-[11px] text-slate-400">
              Demonstrate thermal Heatmap, cartoon Bitmoji avatars, explicit 'Locate Me' pin, and nearby proximity.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-blue-400">Step 4</span>
            <div className="text-xs font-semibold text-white">Model Metrics</div>
            <p className="text-[11px] text-slate-400">
              Display the 86.4% F1-score, interactive Confusion Matrix, and feature weight importance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-blue-400">Step 5</span>
            <div className="text-xs font-semibold text-white">Export & Reports</div>
            <p className="text-[11px] text-slate-400">
              Trigger "Print/Save as PDF" to render the official intelligence dossier and download CSV.
            </p>
          </div>
        </div>
      </div>

      {/* OneDrive Offline Recovery Instructions */}
      <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <FolderSync className="w-4 h-4" />
          <span>How to Access Local Project Files if OneDrive is Offline on Windows</span>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            If your existing files were saved inside a OneDrive folder (e.g. <code className="text-amber-300 font-mono">C:\Users\&lt;Username&gt;\OneDrive\AI Crime Analytics</code>) 
            and appear with cloud or gray icons, OneDrive Files On-Demand may have offloaded them.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-300">
            <li>
              <strong>Make Always Available:</strong> Open Windows File Explorer, right-click your project folder, and select 
              <span className="text-white font-semibold"> "Always keep on this device"</span>. Wait for the green checkmark icon.
            </li>
            <li>
              <strong>Move Outside OneDrive (Recommended for Dev):</strong> Copy the project folder to a direct drive location such as 
              <code className="text-blue-300 font-mono"> C:\Projects\ai_crime_analytics</code>. This avoids file-locking conflicts caused by real-time OneDrive syncing during Python/Node execution.
            </li>
            <li>
              <strong>Check Offline Cache:</strong> If OneDrive is paused or signed out, look in 
              <code className="text-amber-300 font-mono"> C:\Users\&lt;Username&gt;\AppData\Local\Microsoft\OneDrive</code> or open the OneDrive system tray icon and click "Resume Syncing".
            </li>
          </ol>
        </div>
      </div>

      {/* Exact Windows Terminal Commands to Run Locally */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Exact Windows Terminal Commands to Run Locally</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Command Prompt / PowerShell</span>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">
              Option A: Running the Standalone Python Flask Application
            </span>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto">
              <div className="text-slate-500"># 1. Open Windows Terminal (PowerShell or cmd) in the project directory:</div>
              <div>cd C:\path\to\your\project</div>
              <div className="text-slate-500 pt-1"># 2. Create and activate a Python virtual environment:</div>
              <div>python -m venv venv</div>
              <div>venv\Scripts\activate</div>
              <div className="text-slate-500 pt-1"># 3. Install required Python packages:</div>
              <div>pip install -r requirements.txt</div>
              <div className="text-slate-500 pt-1"># 4. Initialize database and start the Flask server:</div>
              <div>python app.py</div>
              <div className="text-slate-500 pt-1"># 5. Open browser at:</div>
              <div className="text-blue-400 font-bold">http://127.0.0.1:5000</div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">
              Option B: Running the Modern Web Interface (React + Vite)
            </span>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-blue-400 space-y-1 overflow-x-auto">
              <div className="text-slate-500"># 1. Install Node.js dependencies:</div>
              <div>npm install</div>
              <div className="text-slate-500 pt-1"># 2. Start the development server:</div>
              <div>npm run dev</div>
              <div className="text-slate-500 pt-1"># 3. Open browser at:</div>
              <div className="text-emerald-400 font-bold">http://localhost:3000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module-by-Module User Guide */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-2">
          System Functional Architecture & Module Guide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Machine Learning Prediction Module
            </span>
            <p className="text-slate-400 leading-relaxed">
              Accepts 7 features (Date, Diurnal Hour, Day of Week, Police District, Premise Type, Area Density Index, 
              Domestic Flag) and generates posterior offense probabilities, confidence score, and operational patrol directives.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              GIS Hotspot Analysis Module
            </span>
            <p className="text-slate-400 leading-relaxed">
              Provides Leaflet interactive mapping with dark command center cartography, rendering concentration 
              circles sized by incident volume and pinpointing coordinate locations without subjective stigmatization.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              Model Evaluation & Confusion Matrix
            </span>
            <p className="text-slate-400 leading-relaxed">
              Calculates genuine test set metrics (Accuracy, Macro Precision, Recall, F1-Score), an interactive 
              6x6 multi-class Confusion Matrix, and feature weight importance percentages.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              Reporting & Data Quality Audit
            </span>
            <p className="text-slate-400 leading-relaxed">
              Audits dataset schema completeness (null checks, duplicate keys, geographic bounds) and generates formal 
              printable PDF intelligence dossiers along with raw CSV exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
