import React, { useMemo } from 'react';

/**
 * Génère un path SVG ECG (PQRST) dynamique selon le status et le BPM.
 * ViewBox : 300 x 60, ligne de base à y=30.
 * Overwhelmed → flatline.
 */
function generateECGPath(status, bpm) {
  if (status === 'overwhelmed') return 'M0,30 L300,30';

  const cy = 30;
  const amp = { love: 12, stable: 18, busy: 22, critical: 26 }[status] ?? 18;

  // Nombre de complexes affichés sur 2.5 secondes
  const complexWidth = 300 / ((bpm / 60) * 2.5);
  const numComplexes = Math.ceil(300 / complexWidth) + 1;

  let d = `M0,${cy}`;

  for (let i = 0; i < numComplexes; i++) {
    const x = i * complexWidth;
    if (x > 300) break;

    // Points du complexe PQRST (proportionnel à complexWidth)
    const pts = [
      [x + complexWidth * 0.10, cy],
      [x + complexWidth * 0.15, cy - amp * 0.25], // P montée
      [x + complexWidth * 0.22, cy],               // P descente
      [x + complexWidth * 0.30, cy],
      [x + complexWidth * 0.33, cy + amp * 0.10],  // Q
      [x + complexWidth * 0.37, cy - amp],          // R pic
      [x + complexWidth * 0.40, cy + amp * 0.15],  // S
      [x + complexWidth * 0.46, cy],
      [x + complexWidth * 0.55, cy],
      [x + complexWidth * 0.62, cy - amp * 0.20],  // T montée
      [x + complexWidth * 0.70, cy - amp * 0.22],  // T pic
      [x + complexWidth * 0.78, cy],               // T descente
      [x + complexWidth * 1.00, cy],
    ];

    for (const [px, py] of pts) {
      if (px > 305) break;
      d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
    }
  }

  return d;
}

const WAVE_COLOR = {
  stable:      '#00ff88',
  busy:        '#f59e0b',
  critical:    '#ef4444',
  overwhelmed: '#ef4444',
  love:        '#ff69b4',
};

const POWER_BADGE_CONFIG = {
  normal:  { label: 'GRID POWER',    color: '#4a9eff' },
  backup:  { label: 'BACKUP POWER',  color: '#f59e0b' },
  offline: { label: 'OFFLINE',          color: '#4a5568' },
};

export default function ECGDisplay({ bpm = 72, status = 'stable', generator = false }) {
  const ecgPath = useMemo(() => generateECGPath(status, bpm), [status, bpm]);

  const strokeColor = WAVE_COLOR[status] ?? '#00ff88';
  const powerKey = status === 'overwhelmed' ? 'offline' : generator ? 'backup' : 'normal';
  const power = POWER_BADGE_CONFIG[powerKey];

  return (
    <div className="ecg-section">
      <div className="ecg-label">
        <span style={{ color: strokeColor }}>ECG</span>
        <span className="bpm-display" style={{ color: strokeColor }}>{bpm} BPM</span>
      </div>

      <div className="ecg-screen">
        <svg className="ecg-wave" viewBox="0 0 300 60" preserveAspectRatio="none">
          <path
            className="ecg-path-glow"
            d={ecgPath}
            style={{ stroke: strokeColor }}
          />
          <path
            className="ecg-path"
            d={ecgPath}
            style={{ stroke: strokeColor }}
          />
        </svg>
        <div className="ecg-scanline" />
      </div>

      <div className="power-badge" style={{ color: power.color }}>
        {power.label}
      </div>
    </div>
  );
}
