import React, { useReducer, useEffect } from 'react';
import eventBus from 'shared/eventBus';
import { INITIAL, STATES, THRESHOLDS, COMMANDS, POWER_SEVERITY } from '../hospitalConfig';
import './NeoHospital.css';
import ECGDisplay from './ECGDisplay';
import BedsGrid from './BedsGrid';
import StatusBadge from './StatusBadge';
import IntakesLog from './IntakesLog';

function hospitalReducer(state, action) {
  switch (action.type) {
    case 'weather:change':
      if (action.payload.toxicity > THRESHOLDS.toxicity) {
        return { ...state, status: 'busy', ...STATES.busy, love: false };
      }
      return state;
    case 'power:outage':
      if (action.payload.severity === POWER_SEVERITY.total) {
        return { ...state, status: 'critical', ...STATES.critical, generator: true, love: false };
      } else if (action.payload.severity === POWER_SEVERITY.partial) {
        return { ...state, status: 'busy', generator: true, love: false };
      }
      return state;
    case 'crowd:panic':
      if (action.payload.level > THRESHOLDS.panicLevel) {
        return { ...state, status: 'overwhelmed', ...STATES.overwhelmed, love: false };
      }
      return state;
    case 'hacker:command':
      if (action.payload.command === COMMANDS.love) {
        return { ...INITIAL, status: 'stable', ...STATES.love, love: true, generator: false };
      } else if (action.payload.command === COMMANDS.reset) {
        return { ...INITIAL };
      }
      return state;
    default:
      return state;
  }
}

export default function NeoHospital() {
  const [state, dispatch] = useReducer(hospitalReducer, INITIAL);

  // ── Listeners ────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubWeather = eventBus.on('weather:change', (payload) => dispatch({ type: 'weather:change', payload }));
    const unsubPower = eventBus.on('power:outage', (payload) => dispatch({ type: 'power:outage', payload }));
    const unsubCrowd = eventBus.on('crowd:panic', (payload) => dispatch({ type: 'crowd:panic', payload }));
    const unsubHacker = eventBus.on('hacker:command', (payload) => dispatch({ type: 'hacker:command', payload }));

    return () => {
      unsubWeather();
      unsubPower();
      unsubCrowd();
      unsubHacker();
    };
  }, []);

  // ── Emitter hospital:alert ────────────────────────────────────────────────
  useEffect(() => {
    eventBus.emit('hospital:alert', {
      status: state.status,
      beds: { total: 12, occupied: state.occupied, available: 12 - state.occupied },
      generator: state.generator,
    });
  }, [state.status, state.occupied, state.generator]);

  // ── Simulate button ───────────────────────────────────────────────────────
  const simulate = () => eventBus.emit('crowd:panic', { level: 90 });

  const rootClass = `neo-hospital${state.love ? ' love-mode' : ''}`;

  return (
    <div className={rootClass}>
      <div className="hospital-header">
        <span>NEO HOSPITAL</span>
        <StatusBadge status={state.status} love={state.love} />
      </div>

      <button className="simulate-btn" onClick={simulate}>
        SIMULATE CRISIS
      </button>

      <div className="hospital-body">
        <ECGDisplay bpm={state.bpm} status={state.love ? 'love' : state.status} generator={state.generator} />
        <BedsGrid occupied={state.occupied} status={state.status} />
      </div>

      <IntakesLog status={state.status} love={state.love} />
    </div>
  );
}