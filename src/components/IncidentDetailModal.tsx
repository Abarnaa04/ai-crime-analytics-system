import React from 'react';
import { CrimeIncident } from '../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Building, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: CrimeIncident | null;
  onClose: () => void;
  onPredictSimilar?: (incident: CrimeIncident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onPredictSimilar,
}) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400">{incident.caseNumber}</span>
              <span className="text-slate-500 text-xs">·</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                incident.status === 'Closed - Arrested' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                'bg-slate-800 text-slate-300'
              }`}>
                {incident.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{incident.category}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Offense Subtype</span>
              <span className="font-medium text-slate-200">{incident.subCategory}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Severity Tier</span>
              <span className="font-medium text-amber-400">{incident.severity}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Arrest Executed</span>
              <span className="font-medium text-slate-200">{incident.arrest ? 'YES' : 'NO'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Domestic Incident</span>
              <span className="font-medium text-slate-200">{incident.domestic ? 'YES' : 'NO'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Temporal & Geospatial Coordinates
            </span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">Date:</span> {new Date(incident.date).toLocaleDateString()} ({incident.dayOfWeek})
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">Time:</span> {incident.hour.toString().padStart(2, '0')}:00 hrs
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">Sector:</span> {incident.district}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">Location:</span> {incident.address} ({incident.locationDescription})
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-slate-500 pl-5">GPS:</span> {incident.latitude}, {incident.longitude}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono">{incident.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
