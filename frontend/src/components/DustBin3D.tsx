import { cn } from '@/lib/utils';

interface DustBin3DProps {
  type: 'wet' | 'reject' | 'recyclable' | 'hazardous';
  label: string;
  fillLevel: number;
  className?: string;
}

const binColors = {
  wet: {
    border: 'border-blue-400/60',
    glow: 'shadow-[0_0_60px_-10px_rgba(59,130,246,0.5)]',
    fill: 'bg-gradient-to-t from-blue-500/90 via-blue-400/70 to-blue-300/50',
    waste: 'from-blue-600 to-blue-400',
    badge: 'from-blue-500 to-blue-400',
  },
  reject: {
    border: 'border-amber-400/60',
    glow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.5)]',
    fill: 'bg-gradient-to-t from-amber-500/90 via-amber-400/70 to-amber-300/50',
    waste: 'from-amber-600 to-amber-400',
    badge: 'from-amber-500 to-amber-400',
  },
  recyclable: {
    border: 'border-emerald-400/60',
    glow: 'shadow-[0_0_60px_-10px_rgba(16,185,129,0.5)]',
    fill: 'bg-gradient-to-t from-emerald-500/90 via-emerald-400/70 to-emerald-300/50',
    waste: 'from-emerald-600 to-emerald-400',
    badge: 'from-emerald-500 to-emerald-400',
  },
  hazardous: {
    border: 'border-red-400/60',
    glow: 'shadow-[0_0_60px_-10px_rgba(239,68,68,0.5)]',
    fill: 'bg-gradient-to-t from-red-500/90 via-red-400/70 to-red-300/50',
    waste: 'from-red-600 to-red-400',
    badge: 'from-red-500 to-red-400',
  },
};

const binIcons = {
  wet: '💧',
  reject: '📦',
  recyclable: '♻️',
  hazardous: '☢️',
};

const wasteItems = {
  wet: ['🍌', '🍎', '🥬', '🍞', '🥕', '🍊'],
  reject: ['📄', '📦', '🧻', '📰', '✉️', '🏷️'],
  recyclable: ['🥫', '🍶', '🧴', '🥤', '🍾', '🫙'],
  hazardous: ['🔋', '💊', '🧪', '💡', '🩹', '🧫'],
};

// Steam particle component for wet bin
function SteamParticle({ delay, left }: { delay: number; left: number }) {
  return (
    <div
      className="absolute w-3 h-3 rounded-full bg-white/20 blur-sm animate-steam"
      style={{
        left: `${left}%`,
        bottom: '100%',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Floating particle for hazardous bin
function HazardParticle({ delay, left }: { delay: number; left: number }) {
  return (
    <div
      className="absolute w-1.5 h-1.5 rounded-full bg-red-400/60 animate-hazard-float"
      style={{
        left: `${left}%`,
        bottom: '80%',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Sparkle effect for recyclable bin
function SparkleParticle({ delay, left, top }: { delay: number; left: number; top: number }) {
  return (
    <div
      className="absolute w-1 h-1 bg-emerald-300 rounded-full animate-sparkle"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Dust particle for reject bin
function DustParticle({ delay, left }: { delay: number; left: number }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full bg-amber-300/50 animate-dust"
      style={{
        left: `${left}%`,
        bottom: '70%',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function DustBin3D({ type, label, fillLevel, className }: DustBin3DProps) {
  const colors = binColors[type];
  const isCritical = fillLevel >= 80;
  const items = wasteItems[type];

  // Calculate how many waste items to show based on fill level
  const visibleItemCount = Math.ceil((fillLevel / 100) * items.length);

  return (
    <div className={cn('flex flex-col items-center group', className)}>
      {/* 3D Bin Container with hover zoom effect */}
      <div
        className="relative transition-transform duration-300 group-hover:scale-110"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Floating animation wrapper */}
        <div className="animate-float group-hover:pause-animation">
          {/* Particle effects based on bin type */}
          {type === 'wet' && fillLevel > 20 && (
            <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
              {[...Array(8)].map((_, i) => (
                <SteamParticle key={i} delay={i * 0.4} left={15 + i * 10} />
              ))}
            </div>
          )}

          {type === 'hazardous' && fillLevel > 30 && (
            <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
              {[...Array(5)].map((_, i) => (
                <HazardParticle key={i} delay={i * 0.6} left={20 + i * 15} />
              ))}
            </div>
          )}

          {type === 'recyclable' && (
            <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
              {[...Array(6)].map((_, i) => (
                <SparkleParticle key={i} delay={i * 0.5} left={10 + i * 15} top={20 + (i % 3) * 20} />
              ))}
            </div>
          )}

          {type === 'reject' && fillLevel > 40 && (
            <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
              {[...Array(4)].map((_, i) => (
                <DustParticle key={i} delay={i * 0.8} left={25 + i * 15} />
              ))}
            </div>
          )}

          {/* Bin Body - Transparent Glass Effect */}
          <div
            className={cn(
              'relative w-36 h-48 rounded-b-3xl rounded-t-lg overflow-hidden',
              'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
              'backdrop-blur-sm',
              'border-2',
              colors.border,
              colors.glow,
              'transition-all duration-500',
              isCritical && 'animate-glow'
            )}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), inset -5px -5px 20px rgba(0,0,0,0.2)',
            }}
          >
            {/* Glass reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />

            {/* Waste Fill Level with visible waste items */}
            <div
              className={cn(
                'absolute bottom-0 left-1 right-1 rounded-b-2xl transition-all duration-1000 ease-out overflow-hidden',
                colors.fill
              )}
              style={{ height: `${fillLevel}%` }}
            >
              {/* Waste surface ripple effect */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />

              {/* Visible waste items */}
              <div className="absolute inset-0 flex flex-wrap items-end justify-center gap-1 p-2 overflow-hidden">
                {items.slice(0, visibleItemCount).map((item, index) => (
                  <span
                    key={index}
                    className="text-lg opacity-80 animate-bounce"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animationDuration: '2s',
                      transform: `rotate(${(index * 30) % 360}deg)`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Bubbles / particles effect inside */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/30 animate-float-up"
                    style={{
                      left: `${20 + i * 15}%`,
                      bottom: `${10 + i * 10}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${2 + i * 0.5}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bin Icon floating on top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="text-3xl drop-shadow-2xl filter brightness-110">{binIcons[type]}</span>
            </div>

            {/* Glass edge highlights */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/20 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-white/10 to-transparent" />
          </div>

          {/* Lid - Glass Effect */}
          <div
            className={cn(
              'absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-7',
              'bg-gradient-to-br from-white/20 via-white/10 to-white/5',
              'backdrop-blur-sm',
              'rounded-t-xl border-2',
              colors.border,
              'shadow-lg'
            )}
            style={{
              boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.2), 0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            {/* Lid handle */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-10 h-4 bg-gradient-to-b from-white/30 to-white/10 rounded-t-full border border-white/20" />
            {/* Lid reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
          </div>

          {/* Base shadow */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/50 rounded-full blur-xl"
            style={{ transform: 'translateX(-50%) rotateX(60deg) scale(1.2)' }}
          />
        </div>
      </div>

      {/* Label and Percentage */}
      <div className="mt-10 text-center">
        <h3 className="font-display font-semibold text-lg text-foreground">{label}</h3>
        <div className={cn(
          'mt-2 px-5 py-2 rounded-full text-sm font-bold',
          'bg-gradient-to-r',
          colors.badge,
          'text-white shadow-lg backdrop-blur-sm'
        )}>
          {fillLevel}% Full
        </div>
        {isCritical && (
          <p className="mt-2 text-xs text-destructive font-medium animate-pulse">
            ⚠️ Critical Level
          </p>
        )}
      </div>
    </div>
  );
}
