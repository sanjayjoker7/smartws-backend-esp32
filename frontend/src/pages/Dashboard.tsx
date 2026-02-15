import { DustBin3D } from '@/components/DustBin3D';
import { useWasteData } from '@/contexts/WasteDataContext';
import { Trash2, Droplets, Package, Recycle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { dashboard, loading, error } = useWasteData();

  // Backend may return either a detailed `bins` array or aggregate counts
  // (total, wet, reject, recycle, hazardous). Normalize to a `bins` array
  // so the UI can render consistently.
  let bins = dashboard?.bins || [];

  if ((!bins || bins.length === 0) && dashboard) {
    // Map backend aggregate keys to the frontend bin types
    bins = [
      {
        id: 1,
        type: 'wet',
        bin_type: 'wet',
        label: 'Wet Waste',
        fill_level: 0,
        total_capacity: 0,
        today_collection: dashboard.wet ?? 0,
        yesterday_collection: 0,
        total_collection: dashboard.wet ?? 0,
        last_updated: '',
      },
      {
        id: 2,
        type: 'reject',
        bin_type: 'reject',
        label: 'Reject Waste',
        fill_level: 0,
        total_capacity: 0,
        today_collection: dashboard.reject ?? 0,
        yesterday_collection: 0,
        total_collection: dashboard.reject ?? 0,
        last_updated: '',
      },
      {
        id: 3,
        type: 'recyclable',
        bin_type: 'recyclable',
        label: 'Recyclable',
        fill_level: 0,
        total_capacity: 0,
        today_collection: dashboard.recycle ?? 0,
        yesterday_collection: 0,
        total_collection: dashboard.recycle ?? 0,
        last_updated: '',
      },
      {
        id: 4,
        type: 'hazardous',
        bin_type: 'hazardous',
        label: 'Hazardous',
        fill_level: 0,
        total_capacity: 0,
        today_collection: dashboard.hazardous ?? 0,
        yesterday_collection: 0,
        total_collection: dashboard.hazardous ?? 0,
        last_updated: '',
      },
    ];
  }

  // Construct dashboard stats from bins data
  const totalItems = dashboard?.total ?? bins?.reduce((sum, bin) => sum + (bin.today_collection || 0), 0) ?? 0;
  const wetBin = bins?.find(b => b.type === 'wet');
  const rejectBin = bins?.find(b => b.type === 'reject');
  const recyclableBin = bins?.find(b => b.type === 'recyclable');
  const hazardousBin = bins?.find(b => b.type === 'hazardous');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32">
        <p className="text-lg text-red-500 font-semibold mb-2">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time waste monitoring overview</p>
      </div>

      {/* Quick Stats - 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Items */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Items</p>
              <p className="text-xl font-display font-bold">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Wet Waste */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bin-wet/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-bin-wet" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wet Waste</p>
              <p className="text-xl font-display font-bold">{wetBin ? Math.round(wetBin.today_collection) : 0}</p>
            </div>
          </div>
        </div>

        {/* Reject Waste */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bin-reject/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-bin-reject" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reject Waste</p>
              <p className="text-xl font-display font-bold">{rejectBin ? Math.round(rejectBin.today_collection) : 0}</p>
            </div>
          </div>
        </div>

        {/* Recyclable */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bin-recyclable/20 flex items-center justify-center">
              <Recycle className="w-5 h-5 text-bin-recyclable" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recyclable</p>
              <p className="text-xl font-display font-bold">{recyclableBin ? Math.round(recyclableBin.today_collection) : 0}</p>
            </div>
          </div>
        </div>

        {/* Hazardous */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bin-hazardous/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-bin-hazardous" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hazardous</p>
              <p className="text-xl font-display font-bold">{hazardousBin ? Math.round(hazardousBin.today_collection) : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Bins Display */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-xl font-semibold">Smart Dustbins</h2>
            <p className="text-sm text-muted-foreground">Live fill level monitoring</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live updates every 10s
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bins.map((bin, index) => (
            <div
              key={bin.type}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <DustBin3D
                type={bin.type}
                label={bin.label}
                fillLevel={bin.fill_level}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}