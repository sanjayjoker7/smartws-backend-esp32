import { DustBin3D } from '@/components/DustBin3D';
import { useWasteData } from '@/contexts/WasteDataContext';
import { Trash2, Droplets, Package, Recycle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { bins } = useWasteData();

  // Get individual bin data
  const wetBin = bins.find(b => b.type === 'wet');
  const rejectBin = bins.find(b => b.type === 'reject');
  const recyclableBin = bins.find(b => b.type === 'recyclable');
  const hazardousBin = bins.find(b => b.type === 'hazardous');

  // Calculate total items (using todayCollection as item count proxy)
  const totalItems = bins.reduce((acc, bin) => acc + Math.round(bin.todayCollection), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time waste monitoring overview</p>
      </div>

      {/* Quick Stats - 5 cards matching reference */}
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
              <p className="text-xl font-display font-bold">{wetBin ? Math.round(wetBin.todayCollection) : 0}</p>
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
              <p className="text-xl font-display font-bold">{rejectBin ? Math.round(rejectBin.todayCollection) : 0}</p>
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
              <p className="text-xl font-display font-bold">{recyclableBin ? Math.round(recyclableBin.todayCollection) : 0}</p>
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
              <p className="text-xl font-display font-bold">{hazardousBin ? Math.round(hazardousBin.todayCollection) : 0}</p>
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
                fillLevel={bin.fillLevel}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

