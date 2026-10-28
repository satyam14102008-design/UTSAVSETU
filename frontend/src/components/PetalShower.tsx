import React, { useMemo } from 'react';

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  type: 'marigold' | 'rose';
}

export const PetalShower: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 98, // 0 to 98%
      size: 10 + Math.random() * 14, // 10px to 24px
      duration: 6 + Math.random() * 7, // 6s to 13s
      delay: Math.random() * 6,
      type: i % 2 === 0 ? 'marigold' : 'rose',
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((p) => (
        <div
          key={p.id}
          className={`petal-particle ${p.type === 'marigold' ? 'petal-marigold' : 'petal-rose'}`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.3}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow:
              p.type === 'marigold'
                ? '0 2px 6px rgba(217, 119, 6, 0.4)'
                : '0 2px 6px rgba(225, 29, 72, 0.4)',
          }}
        />
      ))}
    </div>
  );
};

