import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { historyStore } from '../utils/historyStore';
import { 
  History, 
  Trash2, 
  FileDown, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { exportPredictionsToCSV } from '../utils/reportGenerator';
import { PageHeader } from './PageHeader';

interface HistoryViewProps {
  onRerunPrediction?: (pred: PredictionResult) => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  onRerunPrediction,
  onBack = () => {},
  onNavigate,
}) => {
  const [history, setHistory] = useState<PredictionResult[]>(() => historyStore.getHistory());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState<string>('');

  const refreshHistory = () => {
    setHistory(historyStore.getHistory());
  };

  const handleDelete = (id: string) => {
    historyStore.deletePrediction(id);
    refreshHistory();
  };

  const handleStartEdit = (item: PredictionResult) => {
    setEditingId(item.id);
    setEditNotesText(item.analystNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    historyStore.updateNotes(id, editNotesText);
    setEditingId(null);
    refreshHistory();
  };

  const handleClearAll = () => {
    if (confirm('Clear all logged prediction intelligence slips?')) {
      historyStore.clearHistory();
      refreshHistory();
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.predictedCategory.toLowerCase().includes(q) ||
      item.inputs.district.toLowerCase().includes(q) ||
      item.inputs.locationDescription.toLowerCase().includes(q) ||
      (item.analystNotes && item.analystNotes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Crime Prediction Intelligence Logs"
        subtitle={`Audit trail of tactical crime likelihood models evaluated by department analysts (${filteredHistory.length} logged).`}
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Prediction Engine', view: 'prediction' },
          { label: 'Case History' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportPredictionsToCSV(filteredHistory)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              Export Log CSV
            </button>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear Log
              </button>
            )}
          </div>
        }
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search prior predictions by ID, predicted category, district, or analyst notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Predictions Cards */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(pred => {
            const isEditing = editingId === pred.id;

            return (
              <div
                key={pred.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-400">{pred.id}</span>
                    <span className="text-slate-500 text-xs">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(pred.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      pred.riskLevel === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                      pred.riskLevel === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {pred.riskLevel}
                    </span>
                    <button
                      onClick={() => handleDelete(pred.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Inputs */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Target Scenario Parameters
                    </span>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500">Date:</span> {pred.inputs.date}
                      </div>
                      <div>
                        <span className="text-slate-500">Hour:</span> {pred.inputs.hour.toString().padStart(2, '0')}:00 hrs
                      </div>
                      <div>
                        <span className="text-slate-500">Day:</span> {pred.inputs.dayOfWeek}
                      </div>
                      <div>
                        <span className="text-slate-500">Density:</span> {pred.inputs.priorDensityIndex}
                      </div>
                      <div className="col-span-2 font-sans">
                        <span className="text-slate-500 font-mono">Sector:</span> {pred.inputs.district}
                      </div>
                      <div className="col-span-2 font-sans">
                        <span className="text-slate-500 font-mono">Premise:</span> {pred.inputs.locationDescription}
                      </div>
                    </div>
                  </div>

                  {/* Right: Model Prediction & Confidence */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Model Classification
                    </span>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Predicted Primary Offense</div>
                        <div className="text-lg font-bold text-white">{pred.predictedCategory}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="text-lg font-bold font-mono text-blue-400">{pred.confidence}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyst Notes */}
                <div className="pt-2 border-t border-slate-800">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNotesText}
                        onChange={e => setEditNotesText(e.target.value)}
                        placeholder="Add shift or tactical intelligence notes..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSaveNotes(pred.id)}
                        className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                        title="Save note"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Analyst Note:</span>
                        <span className="italic text-slate-300">
                          {pred.analystNotes || 'No notes attached.'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartEdit(pred)}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800 rounded-xl">
            <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>No prediction logs recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">Run a classification on the Crime Prediction page to generate logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
