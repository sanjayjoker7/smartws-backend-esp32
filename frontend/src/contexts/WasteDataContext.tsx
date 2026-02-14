import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import { fetchBins, BinData as ApiBinData, fetchDashboardData, DashboardData } from '@/lib/api';
export interface BinData {
  type: 'wet' | 'reject' | 'recyclable' | 'hazardous';
  label: string;
  fillLevel: number;
  totalCapacity: number;
  todayCollection: number;
  yesterdayCollection: number;
}

interface WasteDataContextType {
  bins: BinData[];
  getBinData: (type: string) => BinData | undefined;
  refreshBins: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const WasteDataContext = createContext<WasteDataContextType | undefined>(undefined);

export function useWasteData() {
  const context = useContext(WasteDataContext);
  if (context === undefined) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
}

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData().then(setDashboard).catch(() => setDashboard(null));
  }, []);

// Fallback data when API is not available
const fallbackBins: BinData[] = [
  {
    type: 'wet',
    label: 'Wet Waste',
    fillLevel: 56,
    totalCapacity: 100,
    todayCollection: 15,
    yesterdayCollection: 12,
  },
  {
    type: 'reject',
    label: 'Reject Waste',
    fillLevel: 72,
    totalCapacity: 100,
    todayCollection: 22,
    yesterdayCollection: 18,
  },
  {
    type: 'recyclable',
    label: 'Recyclable Waste',
    fillLevel: 45,
    totalCapacity: 100,
    todayCollection: 10,
    yesterdayCollection: 8,
  },
  {
    type: 'hazardous',
    label: 'Hazardous Waste',
    fillLevel: 92,
    totalCapacity: 100,
    todayCollection: 5,
    yesterdayCollection: 3,
  },
];

// Transform API response to frontend format
function transformApiBin(apiBin: ApiBinData): BinData {
  return {
    type: apiBin.type,
    label: apiBin.label,
    fillLevel: apiBin.fill_level,
    totalCapacity: apiBin.total_capacity,
    todayCollection: apiBin.today_collection,
    yesterdayCollection: apiBin.yesterday_collection,
  };
}

export function WasteDataProvider({ children }: { children: ReactNode }) {
  const [bins, setBins] = useState<BinData[]>(fallbackBins);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Always use fallbackBins for demo mode
  useEffect(() => {
    setBins(fallbackBins);
    setLoading(false);
    setError(null);
  }, []);

  const getBinData = (type: string) => bins.find(b => b.type === type);

  const refreshBins = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBins = await fetchBins();
      setBins(apiBins.map(transformApiBin));
    } catch (err: any) {
      setError(err.message || "Failed to fetch bins");
      setBins(fallbackBins); // fallback on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <WasteDataContext.Provider value={{ bins, getBinData, refreshBins, loading, error, dashboard }}>
      {children}
    </WasteDataContext.Provider>
  );
}