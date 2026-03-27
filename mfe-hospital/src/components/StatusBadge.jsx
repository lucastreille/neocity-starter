import React from 'react';
import { BADGE } from '../hospitalConfig';

export default function StatusBadge({ status, love }) {
  const key = love ? 'love' : status;
  const meta = BADGE[key] ?? BADGE.stable;

  return (
    <span className="hospital-status" style={{ color: meta.color, borderColor: meta.color }}>
      {meta.label}
    </span>
  );
}