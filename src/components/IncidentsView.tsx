import React, { useState, useMemo } from 'react';
import { CrimeIncident } from '../types';
import { 
  Database, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  Eye, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock,
  RotateCcw
} from 'lucide-react';
import { exportIncidentsToCSV } from '../utils/reportGenerator';
import { PageHeader } from './PageHeader';

interface IncidentsViewProps {
  incidents: CrimeIncident[];
  onSelectIncident: (incident: CrimeIncident) => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onBack = () => {},
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [arrestFilter, setArrestFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Filter
  const filtered = useMemo(() => {
    return incidents.filter(i => {
      if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
      if (districtFilter !== 'ALL' && i.district !== districtFilter) return false;
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (arrestFilter === 'YES' && !i.arrest) return false;
      if (arrestFilter === 'NO' && i.arrest) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCase = i.caseNumber.toLowerCase().includes(q);
        const matchCat = i.category.toLowerCase().includes(q);
        const matchSub = i.subCategory.toLowerCase().includes(q);
        const matchAddr = i.address.toLowerCase().includes(q);
        const matchDist = i.district.toLowerCase().includes(q);
        const matchPrem = i.locationDescription.toLowerCase().includes(q);
        if (!matchCase && !matchCat && !matchSub && !matchAddr && !matchDist && !matchPrem) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, categoryFilter, districtFilter, statusFilter, arrestFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleReset = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setDistrictFilter('ALL');
    setStatusFilter('ALL');
    setArrestFilter('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Verified Incident Database Explorer"
        subtitle={`Searchable repository of geocoded municipal crime incident logs (${filtered.length} matched).`}
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Incidents Explorer' }
        ]}
        onNavigate={onNavigate}
        actions={
          <button
            type="button"
            onClick={() => exportIncidentsToCSV(filtered)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            Export Query CSV
          </button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case number (e.g. JB200015), offense, address, or keyword..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="THEFT">THEFT</option>
              <option value="BATTERY">BATTERY</option>
              <option value="BURGLARY">BURGLARY</option>
              <option value="ROBBERY">ROBBERY</option>
              <option value="MOTOR VEHICLE THEFT">MOTOR VEHICLE THEFT</option>
              <option value="NARCOTICS">NARCOTICS</option>
              <option value="WEAPONS VIOLATION">WEAPONS VIOLATION</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">District</label>
            <select
              value={districtFilter}
              onChange={e => { setDistrictFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Districts</option>
              <option value="Central 01">Central 01</option>
              <option value="North River 02">North River 02</option>
              <option value="Harbor West 03">Harbor West 03</option>
              <option value="South Park 04">South Park 04</option>
              <option value="University Heights 05">University Heights 05</option>
              <option value="Industrial East 06">Industrial East 06</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Investigation Status</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Closed - Arrested">Closed - Arrested</option>
              <option value="Open - Under Investigation">Open - Under Investigation</option>
              <option value="Closed - Exception">Closed - Exception</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Arrest Made</label>
            <div className="flex items-center gap-2">
              <select
                value={arrestFilter}
                onChange={e => { setArrestFilter(e.target.value); setPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Records</option>
                <option value="YES">Yes (Arrest Made)</option>
                <option value="NO">No (Pending / None)</option>
              </select>
              {(searchTerm || categoryFilter !== 'ALL' || districtFilter !== 'ALL' || statusFilter !== 'ALL' || arrestFilter !== 'ALL') && (
                <button
                  onClick={handleReset}
                  title="Reset Query"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-4 font-medium">Case Number</th>
                <th className="py-3 px-4 font-medium">Date & Time</th>
                <th className="py-3 px-4 font-medium">Offense Category</th>
                <th className="py-3 px-4 font-medium">District & Block</th>
                <th className="py-3 px-4 font-medium">Premise</th>
                <th className="py-3 px-4 font-medium text-center">Arrest</th>
                <th className="py-3 px-4 font-medium">Investigation Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {currentRecords.length > 0 ? (
                currentRecords.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-blue-400">{item.caseNumber}</td>
                    <td className="py-3 px-4 text-slate-300 tabular-nums">
                      {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      <div>{item.category}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.subCategory}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div>{item.district}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.address}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{item.locationDescription}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.arrest ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-500'
                      }`}>
                        {item.arrest ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <span className={`text-[11px] px-2 py-0.5 rounded ${
                        item.status === 'Closed - Arrested' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' :
                        item.status === 'Open - Under Investigation' ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectIncident(item)}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    No incident records match the active search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-mono">{filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-white font-mono">{Math.min(page * pageSize, filtered.length)}</strong> of{' '}
            <strong className="text-white font-mono">{filtered.length}</strong> records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
