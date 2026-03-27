export const INITIAL = {
  status: 'stable',
  occupied: 3,
  bpm: 72,
  generator: false,
  love: false,
};

export const STATES = {
  stable: { occupied: 3, bpm: 72 },
  busy: { occupied: 6, bpm: 95 },
  critical: { occupied: 9, bpm: 110 },
  overwhelmed: { occupied: 12, bpm: 140 },
  love: { occupied: 2, bpm: 65 },
};

export const BADGE = {
  stable: { label: 'STABLE - ROUTINE', color: '#00ff88' },
  busy: { label: 'CONTAMINATION - INCOMING', color: '#f59e0b' },
  critical: { label: 'EMERGENCY', color: '#ef4444' },
  overwhelmed: { label: '\u{1F480} OVERWHELMED - NO BEDS LEFT', color: '#ef4444' },
  love: { label: '\u{1F495} ALL HEALED', color: '#ff69b4' },
};

export const THRESHOLDS = {
  toxicity: 40,
  panicLevel: 80,
};

export const COMMANDS = {
  love: 'love',
  reset: 'reset',
};

export const POWER_SEVERITY = {
  total: 'total',
  partial: 'partial',
};
