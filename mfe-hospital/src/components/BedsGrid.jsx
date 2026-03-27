import React from 'react';

const TOTAL_BEDS = 12;

export default function BedsGrid({ occupied, status }) {
  return (
    <div className="beds-section">
      <div className="beds-label">BEDS — {occupied}/{TOTAL_BEDS}</div>
      <div className="beds-grid">
        {Array.from({ length: TOTAL_BEDS }, (_, i) => {
          let bedClass = 'bed ';
          if (status === 'overwhelmed') {
            bedClass += 'bed-critical';
          } else if (i < occupied) {
            bedClass += 'bed-occupied';
          } else {
            bedClass += 'bed-empty';
          }
          return <div key={i} className={bedClass} />;
        })}
      </div>
    </div>
  );
}
