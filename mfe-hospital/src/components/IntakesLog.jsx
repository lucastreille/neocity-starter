import React, { useEffect, useRef, useState } from 'react';

function now() {
  return new Date().toLocaleTimeString();
}

export default function IntakesLog({ status, love }) {
  const listRef = useRef([]);
  const [, force] = useState(0);

  useEffect(() => {
    const inCrisis = status === 'busy' || status === 'critical' || status === 'overwhelmed';
    const intervalMs = inCrisis ? 2000 : 10000;

    const id = setInterval(() => {
      const label = love
        ? 'Healing intake'
        : inCrisis
          ? 'Emergency admission'
          : 'Routine admission';

      listRef.current = [{ time: now(), text: label }, ...listRef.current].slice(0, 3);
      force((x) => x + 1);
    }, intervalMs);

    return () => clearInterval(id);
  }, [status, love]);

  return (
    <div className="intakes-section">
      <div className="intakes-label">ADMISSIONS</div>

      {listRef.current.length === 0 ? (
        <div className="intake-line">
          <span className="intake-time">{now()}</span>
          <span>System online</span>
        </div>
      ) : (
        listRef.current.map((it, i) => (
          <div key={i} className="intake-line">
            <span className="intake-time">{it.time}</span>
            <span>{it.text}</span>
          </div>
        ))
      )}
    </div>
  );
}