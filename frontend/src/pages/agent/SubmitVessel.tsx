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
import { Ship, ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const SubmitVessel: React.FC = () => {
  const [formData, setFormData] = useState({
    vessel_name: '',
    imo_number: '',
    vessel_type: 'Container Ship',
    eta: '',
    origin: '',
    destination: 'Rotterdam',
    container_count: '',
    vessel_length: '',
    vessel_draft: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutofill = () => {
    const randomImo = 'IMO99' + Math.floor(10000 + Math.random() * 90000);
    const in36h = new Date(Date.now() + 36 * 3600 * 1000).toISOString().slice(0, 16);

    setFormData({
      vessel_name: 'CMA CGM Palais',
      imo_number: randomImo,
      vessel_type: 'Container Ship',
      eta: in36h,
      origin: 'Singapore',
      destination: 'Rotterdam',
      container_count: '14500',
      vessel_length: '399',
      vessel_draft: '16'
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        'http://localhost:8000/api/vessels',
        {
          ...formData,
          container_count: parseInt(formData.container_count, 10),
          vessel_length: parseInt(formData.vessel_length, 10),
          vessel_draft: parseInt(formData.vessel_draft, 10),
          eta: new Date(formData.eta).toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/agent/my-vessels');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit vessel declaration. Verify IMO uniqueness.');
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Submit Vessel Declaration">
      <PageHeader
        title="Vessel Arrival Declaration"
        subtitle="Mandatory port arrival notification & cargo manifest submission under ISPS code."
        badge="Port Notice Form"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              onClick={handleAutofill}
            >
              Fill Sample Data
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5 text-slate-400" />}
              onClick={() => navigate('/agent')}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl">
        {error && (
          <div className="mb-6 p-4 rounded bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Validation Error</p>
              <p className="text-[11px] text-rose-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-blue-950/70 border border-blue-600/60 text-xs text-cyan-200 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-300">Vessel Manifest Successfully Submitted!</p>
              <p className="text-[11px] text-cyan-200/90 mt-0.5">
                Vessel data stored in database. Forwarding to Rotterdam Port Authority incoming queue...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GROUP 1: VESSEL IDENTIFICATION */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader
              title="Vessel Identification"
              subtitle="Registered vessel name, IMO identifier, and class"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input
                label="Vessel Name"
                name="vessel_name"
                placeholder="e.g. CMA CGM Palais"
                value={formData.vessel_name}
                onChange={handleChange}
                required
              />

              <Input
                label="IMO Number"
                name="imo_number"
                placeholder="e.g. IMO9836074"
                value={formData.imo_number}
                onChange={handleChange}
                required
                mono
                helperText="7-digit unique identifier"
              />

              <Select
                label="Vessel Type"
                name="vessel_type"
                value={formData.vessel_type}
                onChange={handleChange}
                required
                options={[
                  { value: 'Container Ship', label: 'Container Ship (Fully Cellular)' },
                  { value: 'Bulk Carrier', label: 'Bulk Carrier (Gearless/Geared)' },
                  { value: 'Oil Tanker', label: 'Crude / Product Tanker' },
                  { value: 'Ro-Ro', label: 'Roll-on/Roll-off (Vehicle Carrier)' },
                  { value: 'General Cargo', label: 'Multi-Purpose General Cargo' },
                ]}
              />
            </div>
          </div>

          {/* GROUP 2: VOYAGE & ARRIVAL TIMETABLE */}
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader
              title="Arrival & Voyage Route"
              subtitle="Estimated time of arrival and pilot boarding waypoint"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input
                label="Estimated Time of Arrival (ETA)"
                type="datetime-local"
                name="eta"
                value={formData.eta}
                onChange={handleChange}
                required
                helperText="Local port entry timetable"
              />

              <Input
                label="Port of Origin"
                name="origin"
                placeholder="e.g. Shanghai / Singapore"
                value={formData.origin}
                onChange={handleChange}
                required
              />

              <Input
                label="Destination Port"
                name="destination"
                placeholder="Rotterdam"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* GROUP 3: CARGO & TECHNICAL DIMENSIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cargo */}
            <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
              <SectionHeader
                title="Cargo Manifest"
                subtitle="Inbound container load"
              />
              <div className="pt-2">
                <Input
                  label="Container Count (TEU)"
                  type="number"
                  name="container_count"
                  placeholder="e.g. 12500"
                  value={formData.container_count}
                  onChange={handleChange}
                  required
                  min="1"
                  mono
                  suffixElement={<span className="text-slate-500 font-mono-num">TEU</span>}
                  helperText="Twenty-foot equivalent unit volume"
                />
              </div>
            </div>

            {/* Vessel Dimensions */}
            <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
              <SectionHeader
                title="Vessel Dimensions"
                subtitle="Hull specifications for berth safety"
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Input
                  label="Length (LOA)"
                  type="number"
                  name="vessel_length"
                  placeholder="e.g. 399"
                  value={formData.vessel_length}
                  onChange={handleChange}
                  required
                  min="10"
                  mono
                  suffixElement={<span className="text-slate-500 font-mono-num">m</span>}
                />

                <Input
                  label="Maximum Draft"
                  type="number"
                  name="vessel_draft"
                  placeholder="e.g. 16"
                  value={formData.vessel_draft}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.1"
                  mono
                  suffixElement={<span className="text-slate-500 font-mono-num">m</span>}
                />
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between p-4 bg-[#030712] border border-[#142340] rounded-xl shadow-xl">
            <span className="text-xs text-slate-500 font-mono-num">
              TRANSMITTING VIA SECURE MARITIME PROTOCOL
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/agent')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="operational"
                size="md"
                loading={loading}
                icon={<Ship className="w-4 h-4" />}
              >
                SUBMIT VESSEL
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmitVessel;
