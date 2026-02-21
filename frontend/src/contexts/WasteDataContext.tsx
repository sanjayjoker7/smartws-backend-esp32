import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchDashboardData, DashboardData, BinData } from '@/lib/api';

// Context type
interface WasteDataContextType {
  dashboard: DashboardData | null;
  bins: BinData[];
  getBinData: (type: string) => BinData | undefined;
  loading: boolean;
  error: string | null;
}

// Create context
export const WasteDataContext = createContext<WasteDataContextType | undefined>(undefined);

// Provider component
export const WasteDataProvider = ({ children }: { children: ReactNode }) => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardData();
        setDashboard(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data every 10 seconds
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const bins = dashboard?.bins || [];

  const getBinData = (type: string) => {
    return bins.find(b => b.type === type);
  };

  return (
    <WasteDataContext.Provider value={{ dashboard, bins, getBinData, loading, error }}>
      {children}
    </WasteDataContext.Provider>
  );
};

// Custom hook for context usage
export function useWasteData() {
  const context = useContext(WasteDataContext);
  if (context === undefined) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
}