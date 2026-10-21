import React, { useState, useMemo } from 'react';
import { CrimeIncident, DistrictName, CrimeCategory, IncidentStatus } from '../types';
import { 
  FileDown, 
  Filter, 
  RotateCcw, 
  ShieldAlert, 
  Users, 
  Clock, 
  Calendar, 
  Building2, 
  Activity, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { exportIncidentsToCSV } from '../utils/reportGenerator';
import { PageHeader } from './PageHeader';

interface DashboardViewProps {
  incidents: CrimeIncident[];
  onSelectIncident: (incident: CrimeIncident) => void;
  onNavigateToPrediction: () => void;
  onNavigateToHotspots: () => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  onSelectIncident,
  onNavigateToPrediction,
  onNavigateToHotspots,
  onBack = () => {},
  onNavigate,
}) => {
  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timePreset, setTimePreset] = useState<'ALL' | '2026' | '2025' | 'NIGHT'>('ALL');

  // Filter computation
  const filtered = useMemo(() => {
    return incidents.filter(item => {
      if (selectedDistrict !== 'ALL' && item.district !== selectedDistrict) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (timePreset === '2026' && item.year !== 2026) return false;
      if (timePreset === '2025' && item.year !== 2025) return false;
      if (timePreset === 'NIGHT' && (item.hour < 20 && item.hour > 5)) return false;
      return true;
    });
  }, [incidents, selectedDistrict, selectedCategory, selectedStatus, timePreset]);

  // Derived genuine statistical summaries
  const stats = useMemo(() => {
    const total = filtered.length;
    if (total === 0) {
      return {
        total: 0,
        arrestRate: 0,
        topCategory: 'None',
        topCategoryCount: 0,
        topDistrict: 'None',
        peakHour: 0,
        violentTotal: 0,
        domesticTotal: 0,
      };
    }

    const arrests = filtered.filter(i => i.arrest).length;
    const arrestRate = Number(((arrests / total) * 100).toFixed(1));

    // Category frequency
    const catCounts: Record<string, number> = {};
    const distCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};
    let violentCount = 0;
    let domesticCount = 0;
    const violentList: CrimeCategory[] = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'];

    for (const i of filtered) {
      catCounts[i.category] = (catCounts[i.category] || 0) + 1;
      distCounts[i.district] = (distCounts[i.district] || 0) + 1;
      hourCounts[i.hour] = (hourCounts[i.hour] || 0) + 1;
      if (violentList.includes(i.category)) violentCount += 1;
      if (i.domestic) domesticCount += 1;
    }

    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const sortedDists = Object.entries(distCounts).sort((a, b) => b[1] - a[1]);
    const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);

    return {
      total,
      arrestRate,
      topCategory: sortedCats[0]?.[0] || 'N/A',
      topCategoryCount: sortedCats[0]?.[1] || 0,
      topDistrict: sortedDists[0]?.[0] || 'N/A',
      peakHour: sortedHours[0] ? Number(sortedHours[0][0]) : 22,
      violentTotal: violentCount,
      domesticTotal: domesticCount,
    };
  }, [filtered]);

  // Category distribution for bar chart
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of filtered) {
      counts[i.category] = (counts[i.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([cat, count]) => ({
        category: cat,
        count,
        pct: filtered.length ? Number(((count / filtered.length) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Hourly curve distribution (0-23)
  const hourlyCurve = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    for (const inc of filtered) {
      if (inc.hour >= 0 && inc.hour < 24) {
        hours[inc.hour].count += 1;
      }
    }
    const max = Math.max(...hours.map(h => h.count), 1);
    return hours.map(h => ({
      ...h,
      pctOfMax: Math.round((h.count / max) * 100),
    }));
  }, [filtered]);

  // District distribution
  const districtDistribution = useMemo(() => {
    const map: Record<string, { total: number; arrests: number; violent: number }> = {};
    const violentList: CrimeCategory[] = ['BATTERY', 'ROBBERY', 'ASSAULT', 'WEAPONS VIOLATION'];
    for (const inc of filtered) {
      if (!map[inc.district]) map[inc.district] = { total: 0, arrests: 0, violent: 0 };
      map[inc.district].total += 1;
      if (inc.arrest) map[inc.district].arrests += 1;
      if (violentList.includes(inc.category)) map[inc.district].violent += 1;
    }
    return Object.entries(map).map(([dist, data]) => ({
      district: dist,
      total: data.total,
      arrestRate: data.total > 0 ? Number(((data.arrests / data.total) * 100).toFixed(1)) : 0,
      violentRate: data.total > 0 ? Number(((data.violent / data.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const handleResetFilters = () => {
    setSelectedDistrict('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setTimePreset('ALL');
  };

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Operational Crime Analytics Dashboard"
        subtitle={`Empirical incident intelligence derived from verified municipal records (${filtered.length} active in filter).`}
        onBack={onBack}
        breadcrumbs={[
          { label: 'Portal', view: 'landing' },
          { label: 'Dashboard' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportIncidentsToCSV(filtered)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              Export CSV ({filtered.length})
            </button>
            <button
              type="button"
              onClick={onNavigateToHotspots}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
            >
              Hotspots Map
            </button>
          </div>
        }
      />

      {/* Filter Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Data Filters</span>
          </div>
          {(selectedDistrict !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || timePreset !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* District Filter */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Police District</label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Districts (6)</option>
              <option value="Central 01">Central 01 (Downtown)</option>
              <option value="North River 02">North River 02 (Nightlife)</option>
              <option value="Harbor West 03">Harbor West 03 (Logistics)</option>
              <option value="South Park 04">South Park 04 (Residential)</option>
              <option value="University Heights 05">University Heights 05 (Campus)</option>
              <option value="Industrial East 06">Industrial East 06 (Freight)</option>
            </select>
          </div>

          {/* Offense Category Filter */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Offense Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Offenses</option>
              <option value="THEFT">THEFT</option>
              <option value="BATTERY">BATTERY</option>
              <option value="BURGLARY">BURGLARY</option>
              <option value="NARCOTICS">NARCOTICS</option>
              <option value="ROBBERY">ROBBERY</option>
              <option value="MOTOR VEHICLE THEFT">MOTOR VEHICLE THEFT</option>
              <option value="ASSAULT">ASSAULT</option>
              <option value="WEAPONS VIOLATION">WEAPONS VIOLATION</option>
            </select>
          </div>

          {/* Incident Status */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Investigation Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Closed - Arrested">Closed - Arrested</option>
              <option value="Open - Under Investigation">Open - Under Investigation</option>
              <option value="Closed - Exception">Closed - Exception</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </div>

          {/* Quick Time Preset */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Temporal Slice</label>
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setTimePreset('ALL')}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  timePreset === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTimePreset('2026')}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  timePreset === '2026' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2026
              </button>
              <button
                onClick={() => setTimePreset('2025')}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  timePreset === '2025' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2025
              </button>
              <button
                onClick={() => setTimePreset('NIGHT')}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  timePreset === 'NIGHT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Night
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Crime Incidents</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">
              {((stats.total / (incidents.length || 1)) * 100).toFixed(0)}% of dataset
            </span>
          </div>
        </div>

        {/* Arrest Resolution Rate */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Arrest Resolution Rate</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {stats.arrestRate}%
            </span>
            <span className="text-xs text-emerald-400">Verified resolution</span>
          </div>
        </div>

        {/* Primary Reported Offense */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Most Frequent Category</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white truncate max-w-[140px]" title={stats.topCategory}>
              {stats.topCategory}
            </span>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              {stats.topCategoryCount} cases
            </span>
          </div>
        </div>

        {/* Diurnal Peak Risk Window */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Peak Incident Window</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {stats.peakHour.toString().padStart(2, '0')}:00 hrs
            </span>
            <span className="text-xs text-slate-400">Nocturnal peak</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Category Distribution */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Offense Category Breakdown</h2>
              <p className="text-[11px] text-slate-400">Proportional volume by primary offense category</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{categoryDistribution.length} Categories</span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryDistribution.slice(0, 6).map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.category}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] text-slate-400">
                    <span>{item.count}</span>
                    <span className="text-slate-500">({item.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(item.pct * 2.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Hour Diurnal Crime Distribution */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Diurnal 24-Hour Incident Volume</h2>
              <p className="text-[11px] text-slate-400">Incident frequency across diurnal hours (00:00 to 23:00)</p>
            </div>
            <span className="text-xs font-mono text-purple-400">Peak: {stats.peakHour}:00</span>
          </div>

          <div className="h-44 flex items-end gap-1 pt-4 pb-2 border-b border-slate-800">
            {hourlyCurve.map(h => (
              <div
                key={h.hour}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute -top-7 hidden group-hover:flex z-20 px-1.5 py-0.5 bg-slate-950 border border-slate-700 text-[10px] text-white rounded whitespace-nowrap font-mono">
                  {h.hour}:00 · {h.count} crimes
                </div>
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    h.hour === stats.peakHour
                      ? 'bg-purple-500'
                      : h.hour >= 20 || h.hour <= 4
                      ? 'bg-blue-600/80 hover:bg-blue-500'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  style={{ height: `${Math.max(h.pctOfMax, 8)}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      {/* District Volume & Violent Rate Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Police District Incident Densities</h2>
            <p className="text-[11px] text-slate-400">Total recorded crimes and violent incident ratio per district</p>
          </div>
          <button
            onClick={onNavigateToHotspots}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open Interactive GIS Map →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 font-medium">District Name</th>
                <th className="pb-2.5 font-medium text-right">Total Crimes</th>
                <th className="pb-2.5 font-medium text-right">Violent Ratio</th>
                <th className="pb-2.5 font-medium text-right">Arrest Resolution</th>
                <th className="pb-2.5 font-medium text-right">Concentration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {districtDistribution.map(d => (
                <tr key={d.district} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-sans font-medium text-slate-200">{d.district}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-300">{d.total}</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-300">
                    <span className={d.violentRate > 35 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                      {d.violentRate}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-emerald-400">{d.arrestRate}%</td>
                  <td className="py-2.5 text-right tabular-nums text-slate-400">
                    {stats.total > 0 ? ((d.total / stats.total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Incidents Feed & Quick Modal */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Historical Incidents Feed</h2>
            <p className="text-[11px] text-slate-400">Live inspection of recent incident records with geocoded coordinates</p>
          </div>
          <span className="text-xs text-slate-400">Showing top 6 records</span>
        </div>

        <div className="space-y-2">
          {filtered.slice(0, 6).map(item => (
            <div
              key={item.id}
              onClick={() => onSelectIncident(item)}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 cursor-pointer transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-400">{item.caseNumber}</span>
                  <span className="text-slate-500 text-xs">·</span>
                  <span className="text-xs font-medium text-slate-200 truncate">{item.category}</span>
                  <span className="text-slate-500 text-xs">·</span>
                  <span className="text-[11px] text-slate-400">{item.district}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  <span>{item.address}</span>
                  <span className="mx-1 text-slate-600">|</span>
                  <span>{new Date(item.date).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  item.status === 'Closed - Arrested' 
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50' 
                    : 'text-slate-300 bg-slate-900 border border-slate-800'
                }`}>
                  {item.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
