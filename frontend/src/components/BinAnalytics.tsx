import { TrendingUp, TrendingDown, Gauge, Hash } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BinData } from '@/contexts/WasteDataContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BinAnalyticsProps {
  bin: BinData;
}

const colorMap = {
  wet: 'hsl(199, 89%, 48%)',
  reject: 'hsl(38, 92%, 50%)',
  recyclable: 'hsl(142, 71%, 45%)',
  hazardous: 'hsl(0, 84%, 60%)',
};

// Mock weekly data
const generateWeeklyData = (bin: BinData) => [
  { day: 'Mon', value: Math.round(bin.todayCollection * 0.8) },
  { day: 'Tue', value: Math.round(bin.todayCollection * 1.1) },
  { day: 'Wed', value: Math.round(bin.todayCollection * 0.9) },
  { day: 'Thu', value: Math.round(bin.todayCollection * 1.3) },
  { day: 'Fri', value: Math.round(bin.todayCollection * 1.0) },
  { day: 'Sat', value: Math.round(bin.yesterdayCollection) },
  { day: 'Sun', value: Math.round(bin.todayCollection) },
];

export function BinAnalytics({ bin }: BinAnalyticsProps) {
  const percentageChange = ((bin.todayCollection - bin.yesterdayCollection) / bin.yesterdayCollection) * 100;
  const isPositive = percentageChange >= 0;
  const color = colorMap[bin.type];
  const weeklyData = generateWeeklyData(bin);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fill Level */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Gauge className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-sm text-muted-foreground">Fill Level</span>
          </div>
          <p className="text-2xl font-display font-bold">{bin.fillLevel}%</p>
          <Progress value={bin.fillLevel} className="mt-2 h-2" />
        </div>

        {/* Today's Items */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Hash className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-sm text-muted-foreground">Today's Items</span>
          </div>
          <p className="text-2xl font-display font-bold">{Math.round(bin.todayCollection)}</p>
          <p className="text-xs text-muted-foreground mt-1">items collected today</p>
        </div>

        {/* Trend */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isPositive ? 'bg-destructive/20' : 'bg-primary/20'
            )}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-destructive" />
              ) : (
                <TrendingDown className="w-5 h-5 text-primary" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">vs Yesterday</span>
          </div>
          <p className={cn(
            'text-2xl font-display font-bold',
            isPositive ? 'text-destructive' : 'text-primary'
          )}>
            {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPositive ? 'More items than yesterday' : 'Less items than yesterday'}
          </p>
        </div>
      </div>

      {/* Collection Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Today's Collection</h4>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-display font-bold" style={{ color }}>
              {Math.round(bin.todayCollection)}
            </span>
            <span className="text-lg text-muted-foreground mb-1">items</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Yesterday's Collection</h4>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-display font-bold text-muted-foreground">
              {Math.round(bin.yesterdayCollection)}
            </span>
            <span className="text-lg text-muted-foreground mb-1">items</span>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Weekly Collection Trend</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id={`gradient-${bin.type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} items`, 'Collected']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${bin.type})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

