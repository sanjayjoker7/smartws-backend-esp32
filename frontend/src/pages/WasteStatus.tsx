import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useWasteData } from '@/contexts/WasteDataContext';
import { BinAnalytics } from '@/components/BinAnalytics';
import { cn } from '@/lib/utils';

const binButtons = [
  { type: 'wet', label: 'Wet Bin', icon: '💧' },
  { type: 'reject', label: 'Reject Bin', icon: '📦' },
  { type: 'recyclable', label: 'Recyclable Bin', icon: '♻️' },
  { type: 'hazardous', label: 'Hazardous Bin', icon: '☢️' },
] as const;

const colorMap = {
  wet: 'border-bin-wet bg-bin-wet/10 hover:bg-bin-wet/20 data-[selected=true]:bg-bin-wet/20',
  reject: 'border-bin-reject bg-bin-reject/10 hover:bg-bin-reject/20 data-[selected=true]:bg-bin-reject/20',
  recyclable: 'border-bin-recyclable bg-bin-recyclable/10 hover:bg-bin-recyclable/20 data-[selected=true]:bg-bin-recyclable/20',
  hazardous: 'border-bin-hazardous bg-bin-hazardous/10 hover:bg-bin-hazardous/20 data-[selected=true]:bg-bin-hazardous/20',
};

export default function WasteStatus() {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const { getBinData } = useWasteData();

  const selectedBinData = selectedBin ? getBinData(selectedBin) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Waste Status</h1>
        <p className="text-muted-foreground mt-1">Detailed analytics for each waste bin</p>
      </div>

      {/* Bin Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {binButtons.map((bin, index) => (
          <button
            key={bin.type}
            onClick={() => setSelectedBin(selectedBin === bin.type ? null : bin.type)}
            data-selected={selectedBin === bin.type}
            className={cn(
              'glass-card p-5 text-left transition-all duration-300',
              'border-2 hover:scale-[1.02]',
              colorMap[bin.type],
              'animate-fade-in'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bin.icon}</span>
                <span className="font-display font-semibold">{bin.label}</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 transition-transform duration-300',
                  selectedBin === bin.type && 'rotate-180'
                )}
              />
            </div>
            {getBinData(bin.type) && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      bin.type === 'wet' && 'bg-bin-wet',
                      bin.type === 'reject' && 'bg-bin-reject',
                      bin.type === 'recyclable' && 'bg-bin-recyclable',
                      bin.type === 'hazardous' && 'bg-bin-hazardous'
                    )}
                    style={{ width: `${getBinData(bin.type)?.fill_level}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{getBinData(bin.type)?.fill_level}%</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Analytics Display */}
      {selectedBinData ? (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">
              {binButtons.find(b => b.type === selectedBin)?.icon}
            </span>
            <h2 className="font-display text-2xl font-bold">{selectedBinData.label} Analytics</h2>
          </div>
          <BinAnalytics bin={selectedBinData} />
        </div>
      ) : (
        <div className="glass-card p-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Select a Bin</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click on any bin above to view detailed analytics including fill levels and collection trends.
          </p>
        </div>
      )}
    </div>
  );
}
