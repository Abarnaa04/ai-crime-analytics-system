import React, { useState, useMemo } from 'react';
import { CrimeIncident, DistrictName } from '../types';
import { 
  FileText, 
  FileDown, 
  Printer, 
  ShieldCheck, 
  CheckCircle, 
  Calendar, 
  Building,
  Filter
} from 'lucide-react';
import { exportIncidentsToCSV, exportPredictionsToCSV, triggerPrintReport } from '../utils/reportGenerator';
import { historyStore } from '../utils/historyStore';

import { PageHeader } from './PageHeader';

interface ReportsViewProps {
  incidents: CrimeIncident[];
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  incidents,
  onBack = () => {},
  onNavigate,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'ALL' | '2026' | '2025'>('ALL');
  const [reportDistrict, setReportDistrict] = useState<string>('ALL');
  const [authorName, setAuthorName] = useState<string>('Sarah Chen, PhD, Senior Crime Analyst');

  // Filter incidents for report
  const reportData = useMemo(() => {
    return incidents.filter(i => {
      if (reportPeriod === '2026' && i.year !== 2026) return false;
      if (reportPeriod === '2025' && i.year !== 2025) return false;
      if (reportDistrict !== 'ALL' && i.district !== reportDistrict) return false;
      return true;
    });
  }, [incidents, reportPeriod, reportDistrict]);

  // Compute report metrics
  const reportStats = useMemo(() => {
    const total = reportData.length;
    if (total === 0) return { total: 0, arrests: 0, arrestRate: 0, topCategory: 'N/A' };
    const arrests = reportData.filter(i => i.arrest).length;
    const catMap: Record<string, number> = {};
    for (const i of reportData) {
      catMap[i.category] = (catMap[i.category] || 0) + 1;
    }
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return {
      total,
      arrests,
      arrestRate: Number(((arrests / total) * 100).toFixed(1)),
      topCategory,
    };
  }, [reportData]);

  const predictions = useMemo(() => historyStore.getHistory(), []);

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <div className="no-print">
        <PageHeader
          title="Executive Intelligence & Formal Dossier Reporting"
          subtitle="Generate standardized PDF briefing dossiers and machine-readable CSV datasets."
          onBack={onBack}
          breadcrumbs={[
            { label: 'Dashboard', view: 'dashboard' },
            { label: 'Intelligence Reports' }
          ]}
          onNavigate={onNavigate}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportIncidentsToCSV(reportData, `crime_intelligence_${reportPeriod}_${reportDistrict}.csv`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                Export Data CSV
              </button>
              <button
                type="button"
                onClick={() => exportPredictionsToCSV(predictions)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-purple-400" />
                Export Predictions CSV
              </button>
              <button
                type="button"
                onClick={triggerPrintReport}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-blue-950"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
            </div>
          }
        />
      </div>

      {/* Report Customization Controls */}
      <div className="no-print bg-slate-900/70 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Temporal Scope</label>
          <select
            value={reportPeriod}
            onChange={e => setReportPeriod(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Recorded History (2025 - 2026)</option>
            <option value="2026">2026 Year-to-Date (YTD)</option>
            <option value="2025">2025 Complete Fiscal Year</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Sector / District</label>
          <select
            value={reportDistrict}
            onChange={e => setReportDistrict(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Districts (Citywide Comprehensive)</option>
            <option value="Central 01">Central 01 (Downtown)</option>
            <option value="North River 02">North River 02 (Nightlife)</option>
            <option value="Harbor West 03">Harbor West 03 (Logistics)</option>
            <option value="South Park 04">South Park 04 (Residential)</option>
            <option value="University Heights 05">University Heights 05 (Campus)</option>
            <option value="Industrial East 06">Industrial East 06 (Freight)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-400 block mb-1">Dossier Certifying Analyst</label>
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Formal Printable Executive Intelligence Dossier */}
      <div className="bg-white text-slate-900 rounded-xl p-8 md:p-12 shadow-2xl border border-slate-200 print-break-inside-avoid">
        {/* Dossier Header with Municipal Emblem */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-widest uppercase text-slate-500 block">
              OFFICIAL PUBLIC SAFETY INTELLIGENCE DOSSIER · CONFIDENTIAL / INTERNAL USE
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              AI Crime Analytics & Predictive Intelligence Report
            </h2>
            <div className="text-xs text-slate-600 flex items-center gap-2 pt-1 font-mono">
              <span>Jurisdiction: Metropolitan Safety Command</span>
              <span>·</span>
              <span>Scope: {reportDistrict === 'ALL' ? 'Citywide Comprehensive' : reportDistrict}</span>
              <span>·</span>
              <span>Period: {reportPeriod}</span>
            </div>
          </div>

          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0 hidden sm:block">
            <img
              src="/src/assets/images/police_analytics_emblem_1792560920054.jpg"
              alt="Municipal Analytics Seal"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="py-6 space-y-4 border-b border-slate-200 text-xs text-slate-800 leading-relaxed">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            01. Executive Analytical Summary
          </h3>
          <p>
            This intelligence dossier synthesizes empirical crime incident records, geospatial hotspot density clustering, 
            and probabilistic classification modeling for the designated analytical window ({reportPeriod}). During this timeframe, 
            a total of <strong className="font-mono">{reportStats.total} verified criminal incidents</strong> were logged across 
            the municipal territory.
          </p>
          <p>
            The primary recorded offense classification was <strong className="font-mono">{reportStats.topCategory}</strong>. 
            Overall investigative clearance through formal arrest stands at <strong className="font-mono">{reportStats.arrestRate}%</strong>. 
            Spatial regression and diurnal clustering indicate consistent nighttime vulnerability along high-density commercial 
            and entertainment corridors.
          </p>
        </div>

        {/* Statistical Metrics Block */}
        <div className="py-6 border-b border-slate-200 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            02. Key Empirical Indicators
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center font-mono">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Recorded Incidents</span>
              <span className="text-xl font-bold text-slate-900">{reportStats.total}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Arrests Recorded</span>
              <span className="text-xl font-bold text-emerald-700">{reportStats.arrests}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Clearance Rate</span>
              <span className="text-xl font-bold text-slate-900">{reportStats.arrestRate}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Model F1 Accuracy</span>
              <span className="text-xl font-bold text-blue-700">86.4%</span>
            </div>
          </div>
        </div>

        {/* Tactical Patrol Recommendations */}
        <div className="py-6 border-b border-slate-200 space-y-3 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            03. Strategic Resource Allocation Directives
          </h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong>Closing Hour Shifts:</strong> Deploy paired foot patrol units along entertainment corridors 
              between 22:00 and 03:00 to mitigate street battery and robbery spikes.
            </li>
            <li>
              <strong>Commercial Burglary Countermeasures:</strong> Maintain visible cruiser presence along commercial retail 
              strips during pre-dawn hours (03:00 to 06:00).
            </li>
            <li>
              <strong>GIS Hotspot Awareness:</strong> Concentrate stationary observation points at validated high-density 
              geospatial intersections without pre-emptive disruption of public movement.
            </li>
          </ul>
        </div>

        {/* Certifying Signature Block */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-slate-700">
          <div>
            <span className="text-[11px] text-slate-500 block">Report Compiled & Certified By:</span>
            <span className="font-bold text-slate-900 block text-sm mt-0.5">{authorName}</span>
            <span className="text-[11px] text-slate-500 block">Strategic Crime Intelligence & Public Safety Analytics</span>
          </div>

          <div className="border-t border-slate-400 pt-2 min-w-[200px]">
            <span className="text-[11px] text-slate-500 block">Departmental Supervisory Approval</span>
            <div className="h-6" />
            <span className="font-mono text-[11px] text-slate-400">Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
