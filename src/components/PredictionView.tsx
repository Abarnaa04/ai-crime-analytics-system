import React, { useState } from 'react';
import { 
  CrimeCategory, 
  DistrictName, 
  LocationType, 
  PredictionInput, 
  PredictionResult 
} from '../types';
import { predictCrimeCategory } from '../utils/mlModel';
import { historyStore } from '../utils/historyStore';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  BookmarkPlus, 
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface PredictionViewProps {
  onSaveSuccess?: () => void;
  onNavigateToHistory?: () => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  onSaveSuccess,
  onNavigateToHistory,
  onBack = () => {},
  onNavigate,
}) => {
  // Input features state
  const [date, setDate] = useState<string>('2026-10-21');
  const [hour, setHour] = useState<number>(22);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Friday');
  const [district, setDistrict] = useState<DistrictName>('Central 01');
  const [locationDescription, setLocationDescription] = useState<LocationType>('COMMERCIAL / RETAIL');
  const [priorDensityIndex, setPriorDensityIndex] = useState<'Low' | 'Medium' | 'High'>('High');
  const [domesticRiskFactor, setDomesticRiskFactor] = useState<boolean>(false);

  // Prediction result state
  const [result, setResult] = useState<PredictionResult | null>(() => {
    // Run initial baseline prediction so the reviewer immediately sees the output
    return predictCrimeCategory({
      date: '2026-10-21',
      hour: 22,
      dayOfWeek: 'Friday',
      district: 'Central 01',
      locationDescription: 'COMMERCIAL / RETAIL',
      priorDensityIndex: 'High',
      domesticRiskFactor: false,
    });
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [analystNotes, setAnalystNotes] = useState<string>('');

  const handlePredict = () => {
    const input: PredictionInput = {
      date,
      hour,
      dayOfWeek,
      district,
      locationDescription,
      priorDensityIndex,
      domesticRiskFactor,
    };
    const pred = predictCrimeCategory(input);
    setResult(pred);
    setIsSaved(false);
  };

  const handleSaveToHistory = () => {
    if (!result) return;
    const finalPred = { ...result, analystNotes: analystNotes.trim() || undefined };
    historyStore.addPrediction(finalPred);
    setIsSaved(true);
    if (onSaveSuccess) onSaveSuccess();
  };

  // Demo presets for college review
  const applyPreset = (presetName: string) => {
    if (presetName === 'nightlife') {
      setDate('2026-10-24');
      setHour(2);
      setDayOfWeek('Saturday');
      setDistrict('North River 02');
      setLocationDescription('ALLEYWAY');
      setPriorDensityIndex('High');
      setDomesticRiskFactor(false);
    } else if (presetName === 'retail') {
      setDate('2026-10-21');
      setHour(15);
      setDayOfWeek('Wednesday');
      setDistrict('Central 01');
      setLocationDescription('COMMERCIAL / RETAIL');
      setPriorDensityIndex('High');
      setDomesticRiskFactor(false);
    } else if (presetName === 'residential') {
      setDate('2026-10-22');
      setHour(20);
      setDayOfWeek('Thursday');
      setDistrict('South Park 04');
      setLocationDescription('RESIDENCE / APARTMENT');
      setPriorDensityIndex('Medium');
      setDomesticRiskFactor(true);
    } else if (presetName === 'logistics') {
      setDate('2026-10-23');
      setHour(4);
      setDayOfWeek('Friday');
      setDistrict('Industrial East 06');
      setLocationDescription('PARKING LOT');
      setPriorDensityIndex('Medium');
      setDomesticRiskFactor(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Predictive Crime Classification Engine"
        subtitle="Multivariate Bayesian predictive modeling based on empirical temporal, geographical, and premise variables."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Crime Prediction AI' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Bayesian ML Engine</span>
          </span>
        }
      />

      {/* Preset Buttons for Quick Review */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
          Review Demonstration Presets (Click to load realistic feature vector)
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { applyPreset('nightlife'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            🌙 Weekend Nightlife Sector (02:00)
          </button>
          <button
            onClick={() => { applyPreset('retail'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            🏬 Downtown Commercial Corridor (15:00)
          </button>
          <button
            onClick={() => { applyPreset('residential'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            🏠 Urban Residential Dispute (20:00)
          </button>
          <button
            onClick={() => { applyPreset('logistics'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            🚛 Freight Logistics Yard (04:00)
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-white">Model Input Parameters</h2>
            <span className="text-[11px] font-mono text-slate-400">7 Feature Vectors</span>
          </div>

          {/* Date & Day of Week */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          {/* Hour of Day Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[11px] font-medium text-slate-400">Diurnal Hour (00 - 23)</label>
              <span className="font-mono text-xs font-bold text-blue-400 tabular-nums">
                {hour.toString().padStart(2, '0')}:00 hrs
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>00:00 (Night)</span>
              <span>12:00 (Noon)</span>
              <span>23:00 (Late)</span>
            </div>
          </div>

          {/* District */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Geographic Sector / District</label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value as DistrictName)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Central 01">Central 01 (Downtown Commercial / Loop)</option>
              <option value="North River 02">North River 02 (Nightlife & Mixed Residential)</option>
              <option value="Harbor West 03">Harbor West 03 (Logistics & Medical District)</option>
              <option value="South Park 04">South Park 04 (Urban Residential & Civic)</option>
              <option value="University Heights 05">University Heights 05 (Campus & Student Corridors)</option>
              <option value="Industrial East 06">Industrial East 06 (Manufacturing & Rail Freight)</option>
            </select>
          </div>

          {/* Location Description */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Premise / Location Type</label>
            <select
              value={locationDescription}
              onChange={e => setLocationDescription(e.target.value as LocationType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="STREET">STREET / PUBLIC SIDEWALK</option>
              <option value="COMMERCIAL / RETAIL">COMMERCIAL / RETAIL STORE</option>
              <option value="RESIDENCE / APARTMENT">RESIDENCE / APARTMENT</option>
              <option value="PARKING LOT">PARKING LOT / GARAGE</option>
              <option value="PUBLIC TRANSIT">PUBLIC TRANSIT / TRAIN PLATFORM</option>
              <option value="ALLEYWAY">ALLEYWAY / REAR ACCESS</option>
              <option value="BANK / ATM">BANK / ATM KIOSK</option>
              <option value="HOTEL / MOTEL">HOTEL / MOTEL</option>
            </select>
          </div>

          {/* Prior Area Density Index */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Historical Incident Density Index</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriorDensityIndex(level)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    priorDensityIndex === level
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Domestic Incident Indicator */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={domesticRiskFactor}
                onChange={e => setDomesticRiskFactor(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
              />
              <span>Domestic / Relationship Flag (prior domestic calls recorded)</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handlePredict}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors shadow-lg shadow-blue-950"
            >
              <Sparkles className="w-4 h-4" />
              Compute Predicted Category & Confidence
            </button>
          </div>
        </div>

        {/* Prediction Intelligence Results (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Model Inference Result
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-2xl font-extrabold text-white">
                      {result.predictedCategory}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                      result.riskLevel === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                      result.riskLevel === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {result.riskLevel} Risk Tier
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Model Confidence</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-blue-400">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Baseline (10%)</span>
                  <span>Moderate (50%)</span>
                  <span>High Likelihood (100%)</span>
                </div>
              </div>

              {/* Top Ranked Alternative Offenses */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">
                  Ranked Probability Distribution
                </span>
                <div className="space-y-1.5">
                  {result.rankedProbabilities.map((item, idx) => (
                    <div key={item.category} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-slate-950/50 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-500">0{idx + 1}.</span>
                        <span className="font-medium text-slate-200">{item.category}</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-300 font-semibold">
                        {item.probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributing Factors Analysis */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">
                  Statistical Contributing Factors
                </span>
                <ul className="space-y-1.5">
                  {result.contributingFactors.map((factor, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 font-bold shrink-0">·</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tactical Resource Allocation Recommendations */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Tactical Patrol & Preventative Advisories
                </span>
                <ul className="space-y-1.5">
                  {result.recommendedActions.map((action, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notes & Actions Bar */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-medium text-slate-400 block">
                  Analyst Shift Notes (Optional for history logging)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Flagged for 2nd Watch squad briefing at Central precinct"
                  value={analystNotes}
                  onChange={e => setAnalystNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handleSaveToHistory}
                    disabled={isSaved}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isSaved
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <BookmarkPlus className="w-4 h-4 text-blue-400" />
                    {isSaved ? 'Saved in Intelligence Log' : 'Save to Prediction History'}
                  </button>

                  {onNavigateToHistory && (
                    <button
                      onClick={onNavigateToHistory}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All Prior Logs →
                    </button>
                  )}
                </div>
              </div>

              {/* Mandatory Ethical Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 block mb-0.5">Disclaimer:</span>
                {result.disclaimer}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-slate-400">
              Select input features and click compute to generate a prediction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
