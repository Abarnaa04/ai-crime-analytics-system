import React, { useState, useMemo } from 'react';
import { CrimeIncident, CrimeCategory, DistrictName } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  Info
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface AnalyticsViewProps {
  incidents: CrimeIncident[];
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  incidents,
  onBack = () => {},
  onNavigate,
}) => {
  const [selectedComparisonPeriod, setSelectedComparisonPeriod] = useState<'2025_vs_2026' | 'day_vs_night'>('2025_vs_2026');

  // Categorize violent vs property
  const violentCats: CrimeCategory[] = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'];
  const propertyCats: CrimeCategory[] = ['THEFT', 'BURGLARY', 'MOTOR VEHICLE THEFT', 'CRIMINAL DAMAGE'];

  // Metrics comparison
  const metrics = useMemo(() => {
    const total = incidents.length;
    let violentCount = 0;
    let propertyCount = 0;
    let dayCount = 0; // 06:00 to 17:59
    let nightCount = 0; // 18:00 to 05:59
    let weekendCount = 0; // Sat, Sun
    let weekdayCount = 0;

    let y2025Count = 0;
    let y2026Count = 0;

    for (const inc of incidents) {
      if (violentCats.includes(inc.category)) violentCount += 1;
      else if (propertyCats.includes(inc.category)) propertyCount += 1;

      if (inc.hour >= 6 && inc.hour < 18) dayCount += 1;
      else nightCount += 1;

      if (inc.dayOfWeek === 'Saturday' || inc.dayOfWeek === 'Sunday') weekendCount += 1;
      else weekdayCount += 1;

      if (inc.year === 2025) y2025Count += 1;
      if (inc.year === 2026) y2026Count += 1;
    }

    return {
      total,
      violentCount,
      violentPct: Number(((violentCount / total) * 100).toFixed(1)),
      propertyCount,
      propertyPct: Number(((propertyCount / total) * 100).toFixed(1)),
      dayCount,
      dayPct: Number(((dayCount / total) * 100).toFixed(1)),
      nightCount,
      nightPct: Number(((nightCount / total) * 100).toFixed(1)),
      weekendCount,
      weekendPct: Number(((weekendCount / total) * 100).toFixed(1)),
      weekdayCount,
      weekdayPct: Number(((weekdayCount / total) * 100).toFixed(1)),
      y2025Count,
      y2026Count,
      yoyDelta: y2025Count > 0 ? Number((((y2026Count - y2025Count) / y2025Count) * 100).toFixed(1)) : 0,
    };
  }, [incidents]);

  // Cross-tabulation matrix: Districts vs Top Categories
  const crossTab = useMemo(() => {
    const districts: DistrictName[] = [
      'Central 01', 'North River 02', 'Harbor West 03', 'South Park 04', 'University Heights 05', 'Industrial East 06'
    ];
    const topCats: CrimeCategory[] = ['THEFT', 'BATTERY', 'BURGLARY', 'ROBBERY', 'MOTOR VEHICLE THEFT', 'NARCOTICS'];

    const matrix: Record<DistrictName, Record<CrimeCategory, number>> = {} as any;
    for (const d of districts) {
      matrix[d] = {} as any;
      for (const c of topCats) matrix[d][c] = 0;
    }

    for (const inc of incidents) {
      if (matrix[inc.district] && matrix[inc.district][inc.category] !== undefined) {
        matrix[inc.district][inc.category] += 1;
      }
    }

    return { districts, topCats, matrix };
  }, [incidents]);

  // Arrest efficiency per category
  const arrestPerCategory = useMemo(() => {
    const map: Record<string, { total: number; arrests: number }> = {};
    for (const inc of incidents) {
      if (!map[inc.category]) map[inc.category] = { total: 0, arrests: 0 };
      map[inc.category].total += 1;
      if (inc.arrest) map[inc.category].arrests += 1;
    }
    return Object.entries(map).map(([category, data]) => ({
      category,
      total: data.total,
      arrests: data.arrests,
      rate: Number(((data.arrests / data.total) * 100).toFixed(1)),
    })).sort((a, b) => b.rate - a.rate);
  }, [incidents]);

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Advanced Crime Trends & Comparative Analytics"
        subtitle="Historical comparative distributions, temporal shifts, and multi-sector cross-tabulations."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Comparative Analytics' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-Sector Trends</span>
          </span>
        }
      />

      {/* Comparative Ratio Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Violent vs Property */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Violent vs Property Offenses</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-400">Violent ({metrics.violentCount})</span>
              <span className="text-blue-400">Property ({metrics.propertyCount})</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${metrics.violentPct}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${metrics.propertyPct}%` }} className="bg-blue-500 h-full" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{metrics.violentPct}%</span>
              <span>{metrics.propertyPct}%</span>
            </div>
          </div>
        </div>

        {/* Day vs Night Split */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Diurnal: Day vs Nocturnal</span>
            <Moon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-300">Day 06-18h ({metrics.dayCount})</span>
              <span className="text-purple-400">Night 18-06h ({metrics.nightCount})</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${metrics.dayPct}%` }} className="bg-amber-400 h-full" />
              <div style={{ width: `${metrics.nightPct}%` }} className="bg-purple-600 h-full" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{metrics.dayPct}%</span>
              <span>{metrics.nightPct}%</span>
            </div>
          </div>
        </div>

        {/* Weekend vs Weekday */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Temporal: Weekend vs Weekday</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-emerald-400">Weekend ({metrics.weekendCount})</span>
              <span className="text-slate-300">Weekday ({metrics.weekdayCount})</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${metrics.weekendPct}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${metrics.weekdayPct}%` }} className="bg-slate-600 h-full" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{metrics.weekendPct}% (2 days)</span>
              <span>{metrics.weekdayPct}% (5 days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Tabulation Matrix: District by Crime Category */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Cross-Tabulation Matrix: Police District vs Offense Type</h2>
            <p className="text-[11px] text-slate-400">Concentration heat values representing recorded counts across primary categories</p>
          </div>
          <span className="text-xs font-mono text-slate-400">6 Districts × 6 Categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 font-medium">District</th>
                {crossTab.topCats.map(cat => (
                  <th key={cat} className="pb-2.5 font-medium text-right font-mono text-[11px]">
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {crossTab.districts.map(d => (
                <tr key={d} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-sans font-medium text-slate-200">{d}</td>
                  {crossTab.topCats.map(cat => {
                    const val = crossTab.matrix[d][cat] || 0;
                    return (
                      <td key={cat} className="py-2.5 text-right tabular-nums">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          val > 15 ? 'bg-blue-600/60 text-white font-bold' :
                          val > 8 ? 'bg-blue-950 text-blue-300' :
                          val > 0 ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arrest Efficiency Ratios across Categories */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Arrest Clearance Rate by Offense Classification</h2>
            <p className="text-[11px] text-slate-400">Percentage of incidents resolved with verified suspect arrest</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Average: ~24%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {arrestPerCategory.slice(0, 9).map(item => (
            <div key={item.category} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate">{item.category}</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">{item.rate}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{item.arrests} arrests</span>
                <span>{item.total} total cases</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytical Caution Statement */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Trend Analysis Notice:</strong> Shifts in historical counts reflect documented police incident logs. 
          While statistical fluctuations and historical increases or decreases provide essential guidance for departmental 
          budgeting and shift scheduling, statistical models cannot claim certainty regarding future occurrences.
        </p>
      </div>
    </div>
  );
};
