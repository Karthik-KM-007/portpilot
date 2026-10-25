import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Eye, Filter, Download, ArrowUpDown, Ship, Clock } from 'lucide-react';

interface Report {
  id: number;
  report_number: string;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  eta: string;
  origin_port: string;
  destination_port: string;
  total_containers: number;
  status: string;
  created_at: string;
  sent_at: string;
  sender: {
    name: string;
    email: string;
  };
}

export const IncomingVessels: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'eta' | 'vessel_name' | 'container_count'>('eta');
  const [sortAsc, setSortAsc] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/reports/incoming', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token]);

  const handleSort = (field: 'eta' | 'vessel_name' | 'container_count') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredReports = reports
    .filter((r) => {
      const matchesSearch =
        r.report_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.imo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.origin_port.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.sender?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'eta') {
        comparison = new Date(a.eta).getTime() - new Date(b.eta).getTime();
      } else if (sortField === 'vessel_name') {
        comparison = a.vessel_name.localeCompare(b.vessel_name);
      } else if (sortField === 'container_count') {
        comparison = (a.total_containers || 0) - (b.total_containers || 0);
      }
      return sortAsc ? comparison : -comparison;
    });

  const totalFilteredContainers = filteredReports.reduce((acc, r) => acc + (r.total_containers || 0), 0);

  if (loading) {
    return (
      <AppLayout pageTitle="Incoming Reports">
        <LoadingState label="Loading Incoming Vessel Reports..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Incoming Reports">
      <PageHeader
        title="Incoming Vessel Reports"
        subtitle="Review and process vessel arrival declarations submitted by shipping agents."
        badge={`${filteredReports.length} REPORTS`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 text-[#8693A4]" />}
              onClick={() => window.print()}
            >
              Export Manifest
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-[#030712] border border-[#142340] rounded-xl p-4 mb-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Report ID, Vessel, IMO, Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs text-slate-100 border border-[#142340] rounded-lg bg-[#060D1E] placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Status Filters & Summary Tag */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 bg-[#060D1E] p-1 rounded-xl border border-[#142340] text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {['ALL', 'SENT', 'ACCEPTED', 'CHANGES_REQUESTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer font-mono-num ${
                    statusFilter === st
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B1834]'
                  }`}
                >
                  {st === 'SENT' ? 'NEW' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#060D1E] rounded-xl border border-[#142340] text-xs font-mono-num">
              <span className="text-slate-400">TOTAL TEU:</span>
              <span className="font-bold text-cyan-300">{totalFilteredContainers.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Data Table */}
      <div className="bg-[#030712] border border-[#142340] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#142340] text-slate-400 uppercase tracking-wider font-semibold text-[10px] bg-[#060D1E] select-none font-mono-num">
                <th className="py-3 px-4">Report ID</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('vessel_name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Vessel</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('eta')}
                >
                  <div className="flex items-center gap-1">
                    <span>ETA</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('container_count')}
                >
                  <div className="flex items-center gap-1">
                    <span>Containers</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142340]">
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[#081530] transition-colors group"
                >
                  <td className="py-3 px-4 font-mono-num text-xs font-bold text-cyan-400">
                    {r.report_number}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{r.vessel_name}</div>
                    <div className="text-[11px] font-mono-num text-slate-400">{r.imo_number}</div>
                  </td>
                  <td className="py-3 px-4 font-mono-num text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(r.eta).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono-num text-xs font-bold text-slate-100">
                    {(r.total_containers || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    {r.origin_port}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-medium text-slate-200">{r.sender?.name}</div>
                    <div className="text-slate-400 text-[11px]">{r.sender?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status === 'SENT' ? 'NEW' : r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5 text-slate-400" />}
                      onClick={() => navigate(`/authority/vessels/${r.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12">
            <EmptyState
              title="No reports found"
              description="No incoming vessel reports matched your criteria."
              icon={<Ship className="w-6 h-6 text-slate-500" />}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default IncomingVessels;
