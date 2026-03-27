import React, { useEffect, useState } from 'react';
import eventBus from 'shared/eventBus';
import './TrafficGrid.css';

const INTERSECTIONS = [
  { id: 'A1', label: 'NORTH GATE' },
  { id: 'B2', label: 'DOWNTOWN' },
  { id: 'C3', label: 'HARBOR LINK' },
  { id: 'D4', label: 'HOSPITAL WAY' },
];

function getModeState({ scenario, powerState, riotMode, manualLockdown, hospitalPriority }) {
  if (manualLockdown || riotMode) {
    return {
      label: 'LOCKDOWN',
      className: 'mode-riot',
      intervalMs: 0,
      flow: 8,
      status: 'all intersections forced to red',
    };
  }

  if (powerState === 'total') {
    return {
      label: 'BLACKOUT',
      className: 'mode-blackout',
      intervalMs: 0,
      flow: 0,
      status: 'signals offline, local fail-safe engaged',
    };
  }

  if (powerState === 'partial') {
    return {
      label: 'GRID DEGRADED',
      className: 'mode-blackout',
      intervalMs: 900,
      flow: 32,
      status: 'fallback cycle with flashing caution',
    };
  }

  if (hospitalPriority) {
    return {
      label: 'MED PRIORITY',
      className: 'mode-priority',
      intervalMs: 650,
      flow: 68,
      status: 'hospital corridor receives green priority',
    };
  }

  switch (scenario) {
    case 'storm':
      return {
        label: 'STORM MODE',
        className: 'mode-storm',
        intervalMs: 1400,
        flow: 46,
        status: 'longer red phases and slower crossovers',
      };
    case 'love':
      return {
        label: 'LOVE WAVE',
        className: 'mode-love',
        intervalMs: 550,
        flow: 92,
        status: 'synchronized green wave across districts',
      };
    case 'drones':
      return {
        label: 'DRONE CLEAR',
        className: 'mode-drones',
        intervalMs: 700,
        flow: 74,
        status: 'air corridor synchronized with traffic lanes',
      };
    default:
      return {
        label: 'NORMAL',
        className: 'mode-normal',
        intervalMs: 800,
        flow: 81,
        status: 'timed phases stable across the grid',
      };
  }
}

function getLightPhase(index, phaseStep, modeKey, hospitalPriority, powerState) {
  if (modeKey === 'mode-riot') {
    return 'red';
  }

  if (powerState === 'total') {
    return 'off';
  }

  if (hospitalPriority && index === 3) {
    return 'green';
  }

  if (powerState === 'partial' && (index === 1 || index === 3)) {
    return phaseStep % 2 === 0 ? 'yellow' : 'off';
  }

  const sequences = {
    'mode-normal': ['red', 'green', 'yellow'],
    'mode-storm': ['red', 'red', 'green', 'yellow'],
    'mode-love': ['green', 'green', 'yellow', 'red'],
    'mode-drones': ['green', 'yellow', 'red', 'green'],
    'mode-priority': ['red', 'green', 'green', 'yellow'],
    'mode-blackout': ['red', 'yellow', 'red', 'green'],
  };

  const sequence = sequences[modeKey] || sequences['mode-normal'];
  return sequence[(phaseStep + index) % sequence.length];
}

export default function TrafficGrid() {
  const [scenario, setScenario] = useState('normal');
  const [powerState, setPowerState] = useState('normal');
  const [riotMode, setRiotMode] = useState(false);
  const [manualLockdown, setManualLockdown] = useState(false);
  const [hospitalPriority, setHospitalPriority] = useState(false);
  const [phaseStep, setPhaseStep] = useState(0);
  const [cityPower, setCityPower] = useState(100);
  const [outageZones, setOutageZones] = useState(0);
  const [lastSignal, setLastSignal] = useState('grid online');
  const [broadcastMessage, setBroadcastMessage] = useState('Traffic grid synchronized with city bus');

  const resetGrid = () => {
    setScenario('normal');
    setPowerState('normal');
    setRiotMode(false);
    setManualLockdown(false);
    setHospitalPriority(false);
    setPhaseStep(0);
    setCityPower(100);
    setOutageZones(0);
    setLastSignal('grid reset');
    setBroadcastMessage('Traffic grid restored to standard timing');
  };

  const modeState = getModeState({
    scenario,
    powerState,
    riotMode,
    manualLockdown,
    hospitalPriority,
  });

  useEffect(() => {
    if (!modeState.intervalMs) {
      return undefined;
    }

    const interval = setInterval(() => {
      setPhaseStep((current) => current + 1);
    }, modeState.intervalMs);

    return () => clearInterval(interval);
  }, [modeState.intervalMs]);

  useEffect(() => {
    const unsubHacker = eventBus.on('hacker:command', ({ command } = {}) => {
      const normalized = String(command || '').toLowerCase();
      setLastSignal(`hacker:${normalized || 'unknown'}`);

      if (normalized.startsWith('storm')) {
        setScenario('storm');
        setRiotMode(false);
        setManualLockdown(false);
        setBroadcastMessage('Toxic rain protocol: longer red lights and slower city flow');
        return;
      }

      if (normalized === 'blackout') {
        setPowerState('partial');
        setScenario('normal');
        setRiotMode(false);
        setManualLockdown(false);
        setCityPower(35);
        setOutageZones(2);
        setBroadcastMessage('Traffic control awaiting power-grid confirmation');
        return;
      }

      if (normalized === 'riot') {
        setRiotMode(true);
        setManualLockdown(false);
        setHospitalPriority(false);
        setBroadcastMessage('Civil unrest detected: all intersections switch to red');
        return;
      }

      if (normalized === 'drones') {
        setScenario('drones');
        setRiotMode(false);
        setManualLockdown(false);
        setBroadcastMessage('Drone corridor clearance enabled over central avenues');
        return;
      }

      if (normalized === 'love') {
        setScenario('love');
        setPowerState('normal');
        setRiotMode(false);
        setManualLockdown(false);
        setHospitalPriority(false);
        setCityPower(100);
        setOutageZones(0);
        setBroadcastMessage('Green wave engaged across the city');
        return;
      }

      if (normalized === 'reset') {
        resetGrid();
      }
    });

    const unsubWeather = eventBus.on('weather:change', ({ condition, intensity, toxicity } = {}) => {
      const normalized = String(condition || '').toLowerCase();
      setLastSignal(`weather:${normalized || 'change'}`);

      if (normalized === 'rainbow') {
        setScenario('love');
        setBroadcastMessage('Weather anomaly detected: the city enters a synchronized calm cycle');
        return;
      }

      if (normalized.includes('storm') || normalized.includes('acid') || normalized.includes('toxic')) {
        setScenario('storm');
        setRiotMode(false);
        setManualLockdown(false);
        setBroadcastMessage(
          `Storm pressure rising: intensity ${intensity ?? 0}, toxicity ${toxicity ?? 0}`,
        );
      }
    });

    const unsubPower = eventBus.on('power:outage', ({ zones, severity, cityPower: powerLevel } = {}) => {
      const normalized = String(severity || '').toLowerCase();
      const totalOutage = normalized === 'total' || normalized === 'critical';
      setLastSignal(`power:${normalized || 'outage'}`);
      setPowerState(totalOutage ? 'total' : 'partial');
      setCityPower(typeof powerLevel === 'number' ? powerLevel : totalOutage ? 0 : 35);
      setOutageZones(Array.isArray(zones) ? zones.length : totalOutage ? INTERSECTIONS.length : 2);
      setBroadcastMessage(
        totalOutage
          ? 'Blackout confirmed: local signals fall back to dark mode'
          : 'Partial outage confirmed: caution pattern activated on affected crossings',
      );
    });

    const unsubHospital = eventBus.on('hospital:alert', ({ status, beds, generator } = {}) => {
      setLastSignal(`hospital:${status || 'alert'}`);

      if (status && status !== 'stable') {
        setHospitalPriority(true);
        setBroadcastMessage(
          `Medical surge detected: ${beds?.available ?? 'unknown'} beds available, generator ${generator ? 'online' : 'offline'}`,
        );
      } else {
        setHospitalPriority(false);
      }
    });

    const unsubRadio = eventBus.on('radio:broadcast', ({ message, frequency, isEmergency } = {}) => {
      const normalized = String(message || '').toLowerCase();
      setLastSignal(`radio:${frequency || '--.-'}FM`);
      setBroadcastMessage(message || 'Radio broadcast received by traffic control');

      if (!isEmergency && (normalized.includes('restore') || normalized.includes('resume') || normalized.includes('normal'))) {
        resetGrid();
        return;
      }

      if (isEmergency && (normalized.includes('riot') || normalized.includes('lockdown') || normalized.includes('resistance'))) {
        setRiotMode(true);
      }

      if (isEmergency && (normalized.includes('blackout') || normalized.includes('power') || normalized.includes('coupure'))) {
        setPowerState((current) => (current === 'total' ? current : 'partial'));
      }
    });

    return () => {
      unsubHacker();
      unsubWeather();
      unsubPower();
      unsubHospital();
      unsubRadio();
    };
  }, []);

  const handleSimulateLockdown = () => {
    const shouldLock = !manualLockdown;
    setManualLockdown(shouldLock);
    setRiotMode(shouldLock);
    setHospitalPriority(false);
    setLastSignal('local simulation');

    eventBus.emit('radio:broadcast', {
      message: shouldLock
        ? 'TRAFFIC CONTROL: Lockdown engaged. All major intersections switch to red.'
        : 'TRAFFIC CONTROL: Timed lights restored. Resume normal circulation.',
      frequency: '103.9',
      isEmergency: shouldLock,
    });
  };

  const lightPhases = INTERSECTIONS.map((_, index) =>
    getLightPhase(index, phaseStep, modeState.className, hospitalPriority, powerState),
  );
  const activeLights = lightPhases.filter((phase) => phase !== 'off').length;

  return (
    <div className="traffic-grid">
      <div className="traffic-header">
        <span>TRAFFIC CONTROL - NEOCITY GRID</span>
        <span className={`traffic-mode ${modeState.className}`}>{modeState.label}</span>
      </div>

      <button className="simulate-btn" onClick={handleSimulateLockdown} type="button">
        {manualLockdown ? 'RESTORE TIMERS' : 'SIMULATE LOCKDOWN'}
      </button>

      <div className="lights-grid">
        {INTERSECTIONS.map((intersection, index) => {
          const phase = lightPhases[index];

          return (
            <div className="traffic-light" key={intersection.id}>
              <div className="light-body">
                <div className={`led led-red${phase === 'red' ? ' on' : ''}`} />
                <div className={`led led-yellow${phase === 'yellow' ? ' on' : ''}`} />
                <div className={`led led-green${phase === 'green' ? ' on' : ''}`} />
              </div>
              <div className="light-pole" />
              <div className="light-label">{intersection.label}</div>
            </div>
          );
        })}
      </div>

      <div className="traffic-stats">
        <span>{modeState.status} | active lights: {activeLights}/4</span>
        <span>listen: hacker, weather, power, hospital, radio | emit: radio:broadcast</span>
      </div>

      <div className="traffic-stats">
        <span>city power: {cityPower}% | impacted zones: {outageZones}</span>
        <span>flow: {modeState.flow}% | last signal: {lastSignal}</span>
      </div>

      <div className="traffic-stats">
        <span>{broadcastMessage}</span>
        <span>phase step: {phaseStep}</span>
      </div>
    </div>
  );
}
