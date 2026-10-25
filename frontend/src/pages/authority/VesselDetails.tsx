import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Report {
  id: number;
  report_number: string;
  status: string;
  receiver_port: string;
  sender: { name: string; email: string } | null;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  vessel_length: number | null;
  vessel_draft: number | null;
  flag: string | null;
  origin_port: string;
  destination_port: string;
  eta: string;
  etd: string | null;
  total_containers: number;
  import_containers: number;
  export_containers: number;
  reefer_containers: number;
  hazardous_containers: number;
  created_at: string;
  sent_at: string | null;
  updated_at: string | null;
}

const Field: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</dt>
    <dd className="text-sm font-medium text-slate-100 font-mono-num">{value ?? '—'}</dd>
  </div>
);

export const VesselDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, token]);

  const handleAction = async (status: string) => {
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/reports/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <AppLayout pageTitle="Review Report">
        <LoadingState label="Retrieving Vessel Arrival Report..." />
      </AppLayout>
    );
  }

  const fmt = (dt: string | null) =>
    dt
      ? new Date(dt).toLocaleString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false,
        })
      : '—';

  return (
    <AppLayout pageTitle={`Report: ${report.report_number}`}>
      <PageHeader
        title={`${report.report_number} — ${report.vessel_name}`}
        subtitle="Vessel Arrival Report Review"
        breadcrumbs={[
          { label: 'Incoming Reports', href: '/authority/vessels' },
          { label: report.report_number }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5 text-[#8693A4]" />}
              onClick={() => navigate('/authority/vessels')}
            >
              Back to Queue
            </Button>
            <StatusBadge status={report.status === 'SENT' ? 'NEW' : report.status} size="md" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main report sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Report Information */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader title="Report Information" />
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2">
              <Field label="Report ID" value={report.report_number} />
              <Field label="Submitted By" value={report.sender?.name} />
              <Field label="Agent Email" value={report.sender?.email} />
              <Field label="Submitted At" value={fmt(report.sent_at)} />
              <Field label="Last Updated" value={fmt(report.updated_at)} />
              <Field label="Destination" value={report.receiver_port} />
            </dl>
          </div>

          {/* Vessel Information */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader title="Vessel Information" />
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2">
              <Field label="Vessel Name" value={report.vessel_name} />
              <Field label="IMO Number" value={report.imo_number} />
              <Field label="Vessel Type" value={report.vessel_type} />
              <Field label="Length (m)" value={report.vessel_length} />
              <Field label="Draft (m)" value={report.vessel_draft} />
              <Field label="Flag State" value={report.flag} />
            </dl>
          </div>

          {/* Voyage Information */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader title="Voyage Information" />
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2">
              <Field label="Origin Port" value={report.origin_port} />
              <Field label="Destination Port" value={report.destination_port} />
              <Field label="ETA" value={fmt(report.eta)} />
              <Field label="ETD" value={fmt(report.etd)} />
            </dl>
          </div>

          {/* Cargo Information */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader title="Cargo Information" />
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2">
              <Field label="Total Containers" value={`${report.total_containers?.toLocaleString() ?? 0} TEU`} />
              <Field label="Import" value={`${report.import_containers ?? 0} TEU`} />
              <Field label="Export" value={`${report.export_containers ?? 0} TEU`} />
              <Field label="Reefer" value={`${report.reefer_containers ?? 0} TEU`} />
              <Field label="Hazardous" value={`${report.hazardous_containers ?? 0} TEU`} />
            </dl>
          </div>
        </div>

        {/* Right: Actions sidebar */}
        <div className="space-y-6">
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-[#142340]">
              Review Actions
            </h3>
            
            {report.status === 'ACCEPTED' ? (
              <div className="text-center p-4 bg-blue-950/70 border border-blue-600/60 rounded-xl text-sm text-cyan-300">
                <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Report Accepted</p>
                <p className="text-xs text-slate-300 mt-1">This arrival has been cleared.</p>
              </div>
            ) : report.status === 'REJECTED' ? (
              <div className="text-center p-4 bg-rose-950/70 border border-rose-800/60 rounded-xl text-sm text-rose-300">
                <XCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Report Rejected</p>
                <p className="text-xs text-rose-300 mt-1">This arrival has been denied.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-4">
                  Please review the submitted manifest information. You can accept, reject, or request modifications from the shipping agent.
                </p>
                <Button
                  className="w-full justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-md border border-cyan-400/30"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => handleAction('ACCEPTED')}
                  loading={actionLoading}
                >
                  ACCEPT REPORT
                </Button>
                
                <Button
                  className="w-full justify-center bg-[#060D1E] text-amber-300 border border-amber-500/40 hover:bg-amber-950/40"
                  icon={<AlertCircle className="w-4 h-4" />}
                  onClick={() => handleAction('CHANGES_REQUESTED')}
                  loading={actionLoading}
                >
                  REQUEST CHANGES
                </Button>
                
                <Button
                  className="w-full justify-center bg-[#060D1E] text-rose-400 border border-rose-500/40 hover:bg-rose-950/40"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleAction('REJECTED')}
                  loading={actionLoading}
                >
                  REJECT REPORT
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VesselDetails;
