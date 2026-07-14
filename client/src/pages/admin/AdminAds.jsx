import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Eye, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

const defaultValues = {
  enabled: false,
  publisherTagId: '',
  zoneHomepage: '',
  zoneBelowPlayer: '',
  zoneSidebar: '',
  zoneStickyBottom: '',
};

export default function AdminAds() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, watch, setValue, reset } = useForm({ defaultValues });

  const enabled = watch('enabled');
  const zoneHomepage = watch('zoneHomepage');
  const zoneBelowPlayer = watch('zoneBelowPlayer');
  const zoneSidebar = watch('zoneSidebar');
  const zoneStickyBottom = watch('zoneStickyBottom');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings/ads');
        const d = res.data?.data || res.data;
        reset({
          enabled: d.ad_enabled ?? d.enabled ?? false,
          publisherTagId: d.ad_publisherTagId || d.publisherTagId || '',
          zoneHomepage: d.ad_zoneHomepage || d.zoneHomepage || '',
          zoneBelowPlayer: d.ad_zoneBelowPlayer || d.zoneBelowPlayer || '',
          zoneSidebar: d.ad_zoneSidebar || d.zoneSidebar || '',
          zoneStickyBottom: d.ad_zoneStickyBottom || d.zoneStickyBottom || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSave = async (data) => {
    setSaving(true);
    try {
      await api.put('/admin/settings/ads', data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const zones = [
    { name: 'zoneHomepage', label: 'Homepage Hero', size: '728x90', value: zoneHomepage },
    { name: 'zoneBelowPlayer', label: 'Watch Below Player', size: '728x90', value: zoneBelowPlayer },
    { name: 'zoneSidebar', label: 'Watch Sidebar', size: '300x250', value: zoneSidebar },
    { name: 'zoneStickyBottom', label: 'Sticky Bottom', size: 'Full Width', value: zoneStickyBottom },
  ];

  if (loading) return <div className="text-center py-12 text-[#94a3b8]">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#f8fafc]">HilltopAds Settings</h1>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.12)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#f8fafc]">HilltopAds</h2>
              <p className="text-sm text-[#94a3b8]">Enable or disable ads across the site</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('enabled', !enabled)}
              className={cn('transition-colors', enabled ? 'text-green-400' : 'text-[#94a3b8]')}
            >
              {enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          <div>
            <label className="block text-sm text-[#94a3b8] mb-1">Publisher Tag ID</label>
            <input {...register('publisherTagId')} className="input-dark" placeholder="Enter your HilltopAds publisher tag ID" />
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.12)] p-6">
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Zone IDs</h2>
          <div className="space-y-4">
            {zones.map((zone) => (
              <div key={zone.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-[#f8fafc] mb-1">{zone.label} <span className="text-[#94a3b8]">({zone.size})</span></label>
                  <input {...register(zone.name)} className="input-dark" placeholder={`Zone ID for ${zone.label}`} />
                </div>
                {zone.value && (
                  <button
                    type="button"
                    onClick={() => window.open(`https://hilltopads.com/zone/${zone.value}`, '_blank')}
                    className="self-end p-2 rounded-lg hover:bg-[#334155] text-[#94a3b8] hover:text-[#0ea5e9] transition-colors"
                    title="Preview zone"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
          Note: Premium users will see an ad-free experience. Ads are only shown to free-tier users.
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
