import { useState, useEffect, useRef } from 'react';
import { useWasteData } from '@/contexts/WasteDataContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Recycle, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Recyclable() {
  const { addNotification } = useNotifications();
  const { bins } = useWasteData();
  const recyclableBin = bins.find(b => b.type === 'recyclable');
  
  // Track how many times recyclable bin has been emptied into storage (0-4)
  const [fillCount, setFillCount] = useState(2); // Start with 2 fills for demo
  const [lastFillLevel, setLastFillLevel] = useState(recyclableBin?.fillLevel || 0);
  const hasNotifiedRef = useRef(false);

  // Simulate detecting when recyclable bin gets full and empties
  useEffect(() => {
    if (recyclableBin) {
      // If bin was high and now dropped significantly, it was emptied into storage
      if (lastFillLevel >= 80 && recyclableBin.fillLevel < 30) {
        setFillCount(prev => Math.min(prev + 1, 4));
      }
      setLastFillLevel(recyclableBin.fillLevel);
    }
  }, [recyclableBin?.fillLevel, lastFillLevel]);

  // Send notification when storage bin is full (4/4)
  useEffect(() => {
    if (fillCount >= 4 && !hasNotifiedRef.current) {
      addNotification({
        binType: 'recyclable',
        fillPercentage: 100,
      });
      hasNotifiedRef.current = true;
    }
    // Reset notification flag when storage is emptied
    if (fillCount === 0) {
      hasNotifiedRef.current = false;
    }
  }, [fillCount, addNotification]);

  const storageFillLevel = (fillCount / 4) * 100;
  const isReadyForCollection = fillCount >= 4;

  const handleSchedulePickup = () => {
    // Reset after pickup
    setFillCount(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Recyclable Storage</h1>
        <p className="text-muted-foreground mt-1">Large storage bin for collected recyclable waste</p>
      </div>

      {/* Status Banner */}
      <div className={`glass-card p-6 border-2 ${isReadyForCollection ? 'border-bin-recyclable bg-bin-recyclable/10' : 'border-muted'}`}>
        <div className="flex items-center gap-4 flex-wrap">
          {isReadyForCollection ? (
            <>
              <div className="w-14 h-14 rounded-full bg-bin-recyclable/20 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-8 h-8 text-bin-recyclable" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-xl font-display font-bold text-bin-recyclable">Ready for Collection!</h2>
                <p className="text-muted-foreground">Storage bin is full after 4 recyclable bin collections</p>
              </div>
              <button 
                onClick={handleSchedulePickup}
                className="flex items-center gap-2 px-6 py-3 bg-bin-recyclable text-white rounded-xl font-semibold hover:bg-bin-recyclable/90 transition-colors"
              >
                <Truck className="w-5 h-5" />
                Schedule Pickup
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <Recycle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Collecting Recyclables</h2>
                <p className="text-muted-foreground">{fillCount} of 4 recyclable bin collections completed</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visual Flow: Small Bin → Large Storage */}
      <div className="glass-card p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Small Recyclable Bin */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">Current Recyclable Bin</p>
            <div className="relative w-32 h-44">
              <div className="absolute inset-0 rounded-2xl border-3 border-bin-recyclable/50 bg-gradient-to-b from-bin-recyclable/10 to-bin-recyclable/5 overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bin-recyclable to-bin-recyclable/60 transition-all duration-1000"
                  style={{ height: `${recyclableBin?.fillLevel || 0}%` }}
                >
                  <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-1 p-2">
                    <span className="text-lg">♻️</span>
                    <span className="text-lg">🥫</span>
                    <span className="text-lg">📦</span>
                  </div>
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-bin-recyclable rounded-t-lg" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-display font-bold">{recyclableBin?.fillLevel.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{recyclableBin?.weight} kg</p>
          </div>

          {/* Arrow showing flow */}
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-12 h-12 text-bin-recyclable/50 rotate-90 lg:rotate-0" />
            <p className="text-xs text-muted-foreground text-center">Empties when full<br/>(80%+)</p>
          </div>

          {/* Large Storage Bin */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">Large Storage Bin</p>
            <div className="relative w-56 h-72">
              {/* Main Container */}
              <div className="absolute inset-0 rounded-3xl border-4 border-bin-recyclable/50 bg-gradient-to-b from-bin-recyclable/10 to-bin-recyclable/5 overflow-hidden shadow-2xl">
                {/* Fill sections showing 4 layers */}
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                  style={{ height: `${storageFillLevel}%` }}
                >
                  {/* Layered fill effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bin-recyclable via-bin-recyclable/80 to-bin-recyclable/60" />
                  
                  {/* Layer dividers */}
                  {fillCount >= 1 && <div className="absolute bottom-[25%] left-0 right-0 h-0.5 bg-white/20" />}
                  {fillCount >= 2 && <div className="absolute bottom-[50%] left-0 right-0 h-0.5 bg-white/20" />}
                  {fillCount >= 3 && <div className="absolute bottom-[75%] left-0 right-0 h-0.5 bg-white/20" />}
                  
                  {/* Recyclable waste items only */}
                  <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 p-4 overflow-hidden">
                    {fillCount >= 1 && <span className="text-2xl animate-float" style={{ animationDelay: '0s' }}>🥫</span>}
                    {fillCount >= 1 && <span className="text-2xl animate-float" style={{ animationDelay: '0.3s' }}>📦</span>}
                    {fillCount >= 2 && <span className="text-2xl animate-float" style={{ animationDelay: '0.6s' }}>🧴</span>}
                    {fillCount >= 2 && <span className="text-2xl animate-float" style={{ animationDelay: '0.9s' }}>🍾</span>}
                    {fillCount >= 3 && <span className="text-2xl animate-float" style={{ animationDelay: '1.2s' }}>📰</span>}
                    {fillCount >= 3 && <span className="text-2xl animate-float" style={{ animationDelay: '1.5s' }}>📄</span>}
                    {fillCount >= 4 && <span className="text-2xl animate-float" style={{ animationDelay: '1.8s' }}>🥤</span>}
                    {fillCount >= 4 && <span className="text-2xl animate-float" style={{ animationDelay: '2.1s' }}>🗞️</span>}
                  </div>
                </div>

                {/* Bin Lid */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-6 bg-bin-recyclable rounded-t-xl border-4 border-bin-recyclable shadow-lg" />
                
                {/* Recycle Symbol */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Recycle className="w-10 h-10 text-bin-recyclable/50" />
                </div>

                {/* Fill count markers on the side */}
                <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-end pb-2">
                  {[4, 3, 2, 1].map((num) => (
                    <div 
                      key={num} 
                      className="h-[25%] flex items-center justify-end pr-1"
                    >
                      <span className={`text-xs font-bold ${fillCount >= num ? 'text-white' : 'text-muted-foreground/50'}`}>
                        {num}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glow effect when ready */}
              {isReadyForCollection && (
                <div className="absolute inset-0 rounded-3xl bg-bin-recyclable/20 blur-xl -z-10 animate-pulse" />
              )}
            </div>
            <p className="mt-3 text-3xl font-display font-bold">{fillCount}/4</p>
            <p className="text-sm text-muted-foreground">Collections stored</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium">Storage Progress</p>
          <p className="text-sm text-muted-foreground">{fillCount} of 4 collections</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num}
              className={`flex-1 h-4 rounded-full transition-all duration-500 ${
                fillCount >= num 
                  ? 'bg-bin-recyclable shadow-lg shadow-bin-recyclable/30' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Empty</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>Full</span>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>When the recyclable bin reaches 80% capacity, it automatically empties into the large storage bin.</p>
        <p>After 4 collections, schedule a pickup to recycle the waste.</p>
      </div>
    </div>
  );
}
