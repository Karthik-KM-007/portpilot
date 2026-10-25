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
import { ArrowLeft } from 'lucide-react';

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

const AgentReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setReport(r.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <AppLayout><LoadingState label="Loading report..." /></AppLayout>;
  if (!report) return <AppLayout><p className="text-sm text-slate-400">Report not found.</p></AppLayout>;

  const fmt = (dt: string | null) =>
    dt
      ? new Date(dt).toLocaleString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false,
        })
      : '—';

  return (
    <AppLayout>
      <PageHeader
        title={`${report.report_number} — ${report.vessel_name}`}
        subtitle="Vessel Arrival Report — Agent View"
        breadcrumbs={[
          { label: 'My Reports', href: '/agent/my-reports' },
          { label: report.report_number },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => navigate('/agent/my-reports')}>
              Back
            </Button>
            <StatusBadge status={report.status} size="md" />
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
              <Field label="Status" value={report.status.replace('_', ' ')} />
              <Field label="Submitted To" value={report.receiver_port} />
              <Field label="Submitted At" value={fmt(report.sent_at)} />
              <Field label="Last Updated" value={fmt(report.updated_at)} />
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

        {/* Right: Status sidebar */}
        <div className="space-y-4">
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-[#142340]">Report Status</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'SENT', done: ['SENT','ACCEPTED','REJECTED','CHANGES_REQUESTED'].includes(report.status) },
                { label: 'UNDER REVIEW', done: ['ACCEPTED','REJECTED','CHANGES_REQUESTED'].includes(report.status) },
                { label: report.status === 'REJECTED' ? 'REJECTED' : report.status === 'CHANGES_REQUESTED' ? 'CHANGES REQUESTED' : 'ACCEPTED', done: ['ACCEPTED','REJECTED','CHANGES_REQUESTED'].includes(report.status) },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? 'bg-cyan-500 border-cyan-400' : 'border-[#1E3358]'}`}>
                    {step.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-xs font-mono-num font-semibold ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {report.status === 'CHANGES_REQUESTED' && (
            <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-800/60 text-sm">
              <p className="font-semibold text-amber-300 mb-1">Changes Requested</p>
              <p className="text-amber-400/90 text-xs">The port authority has requested changes to this report. Please review and resubmit.</p>
            </div>
          )}
          {report.status === 'REJECTED' && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/60 text-sm">
              <p className="font-semibold text-rose-300 mb-1">Report Rejected</p>
              <p className="text-rose-400/90 text-xs">This report was rejected by the port authority.</p>
            </div>
          )}
          {report.status === 'ACCEPTED' && (
            <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-600/60 text-sm">
              <p className="font-semibold text-cyan-300 mb-1">Report Accepted</p>
              <p className="text-cyan-400/90 text-xs">The port authority has accepted this vessel arrival report.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AgentReportView;
