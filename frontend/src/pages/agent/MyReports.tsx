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
import { PlusCircle, FileText } from 'lucide-react';

interface Report {
  id: number;
  report_number: string;
  vessel_name: string;
  imo_number: string;
  origin_port: string;
  destination_port: string;
  eta: string;
  total_containers: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/reports/sent', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setReports(r.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <AppLayout><LoadingState label="Loading your reports..." /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="My Reports"
        subtitle="All vessel arrival reports submitted by your agency"
        badge={`${reports.length} total`}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/agent/create-report')}
          >
            Create Report
          </Button>
        }
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Submit a Vessel Arrival Report to notify the port authority of an incoming vessel."
          icon={<FileText className="w-5 h-5" />}
          action={
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />} onClick={() => navigate('/agent/create-report')}>
              Create Report
            </Button>
          }
        />
      ) : (
        <div className="bg-[#030712] border border-[#142340] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#060D1E] border-b border-[#142340] text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono-num select-none">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Vessel</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">ETA</th>
                <th className="py-3 px-4">Containers</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142340]">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#081530] transition-colors group">
                  <td className="py-3 px-4 font-mono-num text-xs font-bold text-cyan-400">{r.report_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{r.vessel_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono-num">{r.imo_number}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs">
                    {r.origin_port} → <span className="font-semibold text-white">{r.destination_port}</span>
                  </td>
                  <td className="py-3 px-4 font-mono-num text-xs text-slate-300">
                    {new Date(r.eta).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: false,
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono-num text-xs font-bold text-cyan-300">
                    {(r.total_containers || 0).toLocaleString()} TEU
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-mono-num">
                    {r.sent_at
                      ? new Date(r.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Draft'}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={r.status} size="sm" /></td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/agent/reports/${r.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export { MyReports };
export default MyReports;
