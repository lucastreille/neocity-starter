import React, { useEffect, useState } from 'react';
import './DroneSwarm.css';
import eventBus from 'shared/eventBus';

const commandMap = {
  storm: 'chaos',
  drones: 'skull',
  riot: 'X',
  love: 'heart',
  blackout: 'off',
  off: 'off',
  reset: 'grid',
};

export default function DroneSwarm() {
  const [formation, setFormation] = useState('grid');

  const changeFormation = (nextFormation) => {
    setFormation(nextFormation);
    eventBus.emit('drone:formation', { formation: nextFormation });
  };

  useEffect(() => {
    const unsubCommand = eventBus.on('hacker:command', (payload = {}) => {
      const command = typeof payload === 'string' ? payload : payload.command;
      const target = commandMap[command];
      if (target) changeFormation(target);
    });

    const unsubOutage = eventBus.on('power:outage', (payload = {}) => {
      if (payload.cityPower === 0 || payload.severity === 'critical') {
        changeFormation('off');
      }
    });

    const unsubRestore = eventBus.on('power:restore', () => {
      changeFormation('grid');
    });

    return () => {
      unsubCommand?.();
      unsubOutage?.();
      unsubRestore?.();
    };
  }, []);

  return (
    <div className="drone-swarm">
      <div className="drone-header">
        <span>DRONE SWARM</span>
        <span className="formation-status">FORMATION: {formation.toUpperCase()}</span>
      </div>

      <div className="drone-grid">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className={`drone ${formation}`} />
        ))}
      </div>

      <div className="formation-buttons">
        {['grid', 'skull', 'heart', 'X', 'chaos', 'off'].map((item) => (
          <button
            key={item}
            className={`formation-btn ${formation === item ? 'active' : ''}`}
            onClick={() => changeFormation(item)}
          >
            {item.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
