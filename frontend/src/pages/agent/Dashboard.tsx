import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { MetricPanel } from '../../components/ui/MetricPanel';
import { PlusCircle, Ship, Clock, CheckCircle, FileText } from 'lucide-react';

interface Report {
  id: number;
  report_number: string;
  vessel_name: string;
  imo_number: string;
  destination_port: string;
  eta: string;
  total_containers: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

const AgentDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
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

  const sent = reports.filter((r) => r.status === 'SENT').length;
  const accepted = reports.filter((r) => r.status === 'ACCEPTED').length;
  const pending = reports.filter((r) => ['SENT', 'CHANGES_REQUESTED'].includes(r.status)).length;

  if (loading) return <AppLayout><LoadingState label="Loading your reports..." /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Agent Dashboard"
        subtitle={`Welcome back, ${user?.email}`}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricPanel label="Total Reports" value={reports.length} icon={<FileText className="w-4 h-4 text-slate-400" />} />
        <MetricPanel label="Sent / Awaiting" value={sent} icon={<Clock className="w-4 h-4 text-amber-500" />} />
        <MetricPanel label="Accepted" value={accepted} icon={<CheckCircle className="w-4 h-4 text-cyan-400" />} />
        <MetricPanel label="Pending Action" value={pending} icon={<Ship className="w-4 h-4 text-blue-400" />} />
      </div>

      <div>
        <SectionHeader
          title="Recent Reports"
          subtitle="Your submitted vessel arrival reports"
          badge={reports.length}
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/agent/my-reports')}>
              View All
            </Button>
          }
        />

        {reports.length === 0 ? (
          <EmptyState
            title="No reports submitted yet"
            description="Create a Vessel Arrival Report to notify the port authority."
            icon={<FileText className="w-5 h-5 text-cyan-400" />}
            action={
              <Button variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />} onClick={() => navigate('/agent/create-report')}>
                Create First Report
              </Button>
            }
          />
        ) : (
          <div className="bg-[#030712] border border-[#142340] rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#060D1E] border-b border-[#142340] text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono-num">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Vessel</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142340]">
                {reports.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-[#081530] transition-colors">
                    <td className="py-3 px-4 font-mono-num text-xs font-bold text-cyan-400">{r.report_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{r.vessel_name}</div>
                      <div className="text-xs text-slate-400 font-mono-num">{r.imo_number}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">{r.destination_port}</td>
                    <td className="py-3 px-4 font-mono-num text-xs text-slate-300">
                      {new Date(r.eta).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}
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
      </div>
    </AppLayout>
  );
};

export default AgentDashboard;
