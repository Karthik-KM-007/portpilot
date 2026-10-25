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
import { Ship, PlusCircle, Search } from 'lucide-react';

interface Vessel {
  id: number;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  eta: string;
  origin: string;
  destination: string;
  container_count: number;
  vessel_length: number;
  vessel_draft: number;
  status: string;
  created_at: string;
}

export const MyVessels: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/vessels', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVessels(response.data);
      } catch (err) {
        console.error('Error fetching vessels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVessels();
  }, [token]);

  const filtered = vessels.filter(v =>
    v.vessel_name.toLowerCase().includes(search.toLowerCase()) ||
    v.imo_number.toLowerCase().includes(search.toLowerCase()) ||
    v.origin.toLowerCase().includes(search.toLowerCase()) ||
    v.destination.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout pageTitle="My Declared Vessels">
        <LoadingState label="Loading Declared Vessels..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="My Declared Vessels">
      <PageHeader
        title="My Declared Vessels"
        subtitle="Tracking log of all voyage manifests submitted to Rotterdam Port Authority."
        badge={`${vessels.length} Declared`}
        actions={
          <Button
            variant="operational"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/agent/submit')}
          >
            Submit New Vessel
          </Button>
        }
      />

      <div className="bg-[#030712] border border-[#142340] rounded-xl p-4 mb-4 shadow-xl">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my vessels by name, IMO, port..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs text-slate-100 border border-[#142340] rounded-lg bg-[#060D1E] placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#030712] border border-[#142340] rounded-xl overflow-hidden shadow-xl">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#142340] text-slate-400 uppercase tracking-wider font-semibold text-[10px] bg-[#060D1E] font-mono-num select-none">
                  <th className="py-3 px-4">Vessel Name</th>
                  <th className="py-3 px-4">IMO Number</th>
                  <th className="py-3 px-4">Vessel Type</th>
                  <th className="py-3 px-4">ETA (UTC)</th>
                  <th className="py-3 px-4">Containers</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4">Port Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142340]">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-[#081530] transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {v.vessel_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-400 font-medium">
                      {v.imo_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {v.vessel_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-300">
                      {new Date(v.eta).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-cyan-300 font-bold">
                      {v.container_count.toLocaleString()} TEU
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {v.origin} → <span className="font-semibold text-white">{v.destination}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-400 text-[11px]">
                      {v.vessel_length}m / {v.vessel_draft}m
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No vessels found"
            description="You have not submitted any vessels matching this query."
            icon={<Ship className="w-5 h-5 text-slate-400" />}
            action={
              <Button
                variant="operational"
                size="sm"
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => navigate('/agent/submit')}
              >
                Submit Vessel
              </Button>
            }
          />
        )}
      </div>
    </AppLayout>
  );
};
