import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Send, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface FormState {
  // Vessel
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  vessel_length: string;
  vessel_draft: string;
  flag: string;
  // Voyage
  origin_port: string;
  destination_port: string;
  eta: string;
  etd: string;
  // Cargo
  total_containers: string;
  import_containers: string;
  export_containers: string;
  reefer_containers: string;
  hazardous_containers: string;
}

const EMPTY: FormState = {
  vessel_name: '', imo_number: '', vessel_type: 'Container Ship',
  vessel_length: '', vessel_draft: '', flag: '',
  origin_port: '', destination_port: 'Rotterdam', eta: '', etd: '',
  total_containers: '', import_containers: '', export_containers: '',
  reefer_containers: '0', hazardous_containers: '0',
};

const CreateReport: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [success, setSuccess] = useState<{ reportNumber: string } | null>(null);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildPayload = (action: 'send' | 'draft') => ({
    vessel_name: form.vessel_name,
    imo_number: form.imo_number,
    vessel_type: form.vessel_type,
    vessel_length: form.vessel_length ? parseInt(form.vessel_length) : null,
    vessel_draft: form.vessel_draft ? parseInt(form.vessel_draft) : null,
    flag: form.flag || null,
    origin_port: form.origin_port,
    destination_port: form.destination_port,
    eta: new Date(form.eta).toISOString(),
    etd: form.etd ? new Date(form.etd).toISOString() : null,
    total_containers: parseInt(form.total_containers) || 0,
    import_containers: parseInt(form.import_containers) || 0,
    export_containers: parseInt(form.export_containers) || 0,
    reefer_containers: parseInt(form.reefer_containers) || 0,
    hazardous_containers: parseInt(form.hazardous_containers) || 0,
    action,
  });

  const submit = async (action: 'send' | 'draft') => {
    setError('');
    if (action === 'send') setLoading(true); else setDraftLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/reports', buildPayload(action), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (action === 'send') {
        setSuccess({ reportNumber: res.data.report_number });
      } else {
        navigate('/agent/my-reports');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Submission failed. Please check your inputs.');
    } finally {
      setLoading(false);
      setDraftLoading(false);
    }
  };

  if (success) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-16 text-center bg-[#030712] border border-[#142340] rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-blue-950/70 border border-blue-600/60 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Report Submitted Successfully</h2>
          <p className="text-sm text-slate-400 mb-1">
            Your Vessel Arrival Report has been sent to the Port Authority.
          </p>
          <p className="text-sm font-mono-num font-bold text-cyan-400 mb-6">
            Report ID: {success.reportNumber}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/agent/my-reports')}>
              View My Reports
            </Button>
            <Button variant="primary" icon={<Send className="w-3.5 h-3.5" />} onClick={() => { setSuccess(null); setForm(EMPTY); }}>
              Submit Another Report
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Vessel Arrival Report"
        subtitle="Complete and submit the arrival declaration to the destination port authority."
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/agent')}
          >
            Back
          </Button>
        }
      />

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-6 max-w-4xl" onSubmit={(e) => { e.preventDefault(); submit('send'); }}>

        {/* ── VESSEL INFORMATION ────────────────────────────────── */}
        <section className="p-5 bg-[#030712] border border-[#142340] rounded-xl shadow-xl">
          <SectionHeader title="Vessel Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            <Input label="Vessel Name" name="vessel_name" placeholder="e.g. MSC Aurora" value={form.vessel_name} onChange={handleChange} required />
            <Input label="IMO Number" name="imo_number" placeholder="e.g. IMO9836074" value={form.imo_number} onChange={handleChange} required mono />
            <Select
              label="Vessel Type"
              name="vessel_type"
              value={form.vessel_type}
              onChange={handleChange}
              options={[
                { value: 'Container Ship', label: 'Container Ship' },
                { value: 'Bulk Carrier', label: 'Bulk Carrier' },
                { value: 'Oil Tanker', label: 'Oil Tanker' },
                { value: 'Ro-Ro', label: 'Ro-Ro' },
                { value: 'General Cargo', label: 'General Cargo' },
                { value: 'LNG Tanker', label: 'LNG Tanker' },
              ]}
            />
            <Input label="Length (m)" name="vessel_length" type="number" placeholder="e.g. 300" value={form.vessel_length} onChange={handleChange} mono />
            <Input label="Draft (m)" name="vessel_draft" type="number" placeholder="e.g. 14" value={form.vessel_draft} onChange={handleChange} mono />
            <Input label="Flag State" name="flag" placeholder="e.g. Panama" value={form.flag} onChange={handleChange} />
          </div>
        </section>

        {/* ── VOYAGE INFORMATION ────────────────────────────────── */}
        <section className="p-5 bg-[#030712] border border-[#142340] rounded-xl shadow-xl">
          <SectionHeader title="Voyage Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <Input label="Origin Port" name="origin_port" placeholder="e.g. Singapore" value={form.origin_port} onChange={handleChange} required />
            <Input label="Destination Port" name="destination_port" placeholder="e.g. Rotterdam" value={form.destination_port} onChange={handleChange} required />
            <Input label="ETA" name="eta" type="datetime-local" value={form.eta} onChange={handleChange} required />
            <Input label="ETD (optional)" name="etd" type="datetime-local" value={form.etd} onChange={handleChange} />
          </div>
        </section>

        {/* ── CARGO INFORMATION ─────────────────────────────────── */}
        <section className="p-5 bg-[#030712] border border-[#142340] rounded-xl shadow-xl">
          <SectionHeader title="Cargo Information" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-1">
            <Input label="Total Containers" name="total_containers" type="number" placeholder="0" value={form.total_containers} onChange={handleChange} mono suffixElement={<span className="text-slate-500 font-mono-num text-xs">TEU</span>} />
            <Input label="Import" name="import_containers" type="number" placeholder="0" value={form.import_containers} onChange={handleChange} mono />
            <Input label="Export" name="export_containers" type="number" placeholder="0" value={form.export_containers} onChange={handleChange} mono />
            <Input label="Reefer" name="reefer_containers" type="number" placeholder="0" value={form.reefer_containers} onChange={handleChange} mono />
            <Input label="Hazardous" name="hazardous_containers" type="number" placeholder="0" value={form.hazardous_containers} onChange={handleChange} mono />
          </div>
        </section>

        {/* ── ACTIONS ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 bg-[#030712] border border-[#142340] rounded-xl shadow-xl">
          <p className="text-xs text-slate-400">
            Submitting to: <span className="font-semibold text-cyan-300">{form.destination_port || '—'}</span> Port Authority
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              loading={draftLoading}
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={() => submit('draft')}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="operational"
              loading={loading}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send Report
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default CreateReport;
