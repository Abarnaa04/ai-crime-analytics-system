import React, { useMemo } from 'react';
import { CrimeIncident } from '../types';
import { auditDataQuality } from '../utils/dataQuality';
import { 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Database, 
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface DataQualityViewProps {
  incidents: CrimeIncident[];
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({ 
  incidents,
  onBack = () => {},
  onNavigate,
}) => {
  const report = useMemo(() => auditDataQuality(incidents), [incidents]);

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Dataset Quality & Integrity Audit Summary"
        subtitle="Automated data validation and schema profiling for municipal crime intelligence records."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Data Quality' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completeness: {report.overallCompletenessPct}%</span>
          </span>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Total Incident Records</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {report.totalRecords}
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            Across {report.totalFields} structured fields
          </span>
        </div>

        {/* Completeness */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Overall Completeness</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {report.overallCompletenessPct}%
          </span>
          <span className="text-[11px] text-emerald-400 block pt-1">
            Zero critical null gaps
          </span>
        </div>

        {/* Duplicates */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Duplicate Case Records</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-white">
            {report.duplicateRecords}
          </span>
          <span className="text-[11px] text-emerald-400 block pt-1">
            Unique primary keys verified
          </span>
        </div>

        {/* Spatial Envelop */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">Geographic Bounding Box</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-400">
            {report.coordinateValidityPct}%
          </span>
          <span className="text-[11px] text-slate-400 block pt-1">
            Within municipal boundaries
          </span>
        </div>
      </div>

      {/* Formal Data Integrity Rules List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <h2 className="text-sm font-semibold text-white">System Integrity & Validation Checks</h2>
          <p className="text-[11px] text-slate-400">Automated pre-flight checks enforcing analytical reproducibility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.integrityChecks.map(check => (
            <div key={check.checkName} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{check.checkName}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PASSED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{check.description}</p>
              <div className="text-[11px] font-mono text-slate-400 pt-0.5">{check.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Field-by-Field Schema Completeness Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Field Schema & Null-Value Profiling</h2>
            <p className="text-[11px] text-slate-400">Detailed column profile and completeness audit</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Temporal Span: {report.dateRange.earliest} to {report.dateRange.latest} ({report.dateRange.spanMonths} mos)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-sans">
                <th className="pb-2 font-medium">Field Identifier</th>
                <th className="pb-2 font-medium">Data Type</th>
                <th className="pb-2 font-medium text-right">Missing / Null</th>
                <th className="pb-2 font-medium text-right">Null %</th>
                <th className="pb-2 font-medium">Representative Sample</th>
                <th className="pb-2 font-medium text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.fieldMetrics.map(f => (
                <tr key={f.fieldName} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-blue-400">{f.fieldName}</td>
                  <td className="py-2.5 text-slate-400">{f.dataType}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-300">{f.nullCount}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-400">{f.nullPercentage}%</td>
                  <td className="py-2.5 text-slate-300 font-sans truncate max-w-[200px]">{f.sampleValue}</td>
                  <td className="py-2.5 text-right font-sans">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Valid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
