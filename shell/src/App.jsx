import React, { Suspense, lazy, useState, useEffect } from 'react';
import './App.css';
import eventBus from 'shared/eventBus';

const offline = (name, port) => ({
  default: () => (
    <div className="mfe-offline">[OFFLINE] {name} - Port {port} inaccessible</div>
  ),
});

const HackerTerminal = lazy(() => import('mfeHacker/HackerTerminal').catch(() => offline('HackerTerminal', 3001)));
const WeatherTower = lazy(() => import('mfeWeather/WeatherTower').catch(() => offline('WeatherTower', 3002)));
const PowerGrid = lazy(() => import('mfePowergrid/PowerGrid').catch(() => offline('PowerGrid', 3003)));
const BillboardMatrix = lazy(() => import('mfeBillboard/BillboardMatrix').catch(() => offline('BillboardMatrix', 3004)));
const DroneSwarm = lazy(() => import('mfeDrones/DroneSwarm').catch(() => offline('DroneSwarm', 3005)));
const UndergroundRadio = lazy(() => import('mfeRadio/UndergroundRadio').catch(() => offline('UndergroundRadio', 3006)));
const CitizenFeed = lazy(() => import('mfeCitizens/CitizenFeed').catch(() => offline('CitizenFeed', 3007)));
const CCTVMatrix = lazy(() => import('mfeCctv/CCTVMatrix').catch(() => offline('CCTVMatrix', 3008)));
const TrafficGrid = lazy(() => import('mfeTraffic/TrafficGrid').catch(() => offline('TrafficGrid', 3009)));
const NeoHospital = lazy(() => import('mfeHospital/NeoHospital').catch(() => offline('NeoHospital', 3010)));
const AIOracle = lazy(() => import('mfeOracle/AIOracle').catch(() => offline('AIOracle', 3011)));

function Placeholder({ name, port }) {
  return (
    <div className="mfe-placeholder">
      <div className="port">{port}</div>
      <div>
        <span className="blink">[ ]</span> En attente de <strong>{name}</strong>...
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>
        Lance : npm start dans mfe-{name.toLowerCase()}
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <div className="mfe-offline">[ERROR] {this.props.name} a crashe</div>;
    return this.props.children;
  }
}

function MfeSlot({ name, port, component: Component }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<Placeholder name={name} port={port} />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const [cityStatus, setCityStatus] = useState('normal');

  useEffect(() => {
    const unsubPanic = eventBus.on('crowd:panic', ({ level }) => {
      if (level > 80) setCityStatus('crisis');
      else if (level > 40) setCityStatus('alert');
      else setCityStatus('normal');
    });

    const unsubCmd = eventBus.on('hacker:command', ({ command }) => {
      if (command === 'reset') setCityStatus('normal');
    });

    return () => {
      unsubPanic();
      unsubCmd();
    };
  }, []);

  const statusLabel = {
    normal: 'CITY STATUS : NORMAL',
    alert: 'ALERT : INSTABILITE DETECTEE',
    crisis: 'CRISIS : BLACKOUT TOTAL',
  }[cityStatus];

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-title">[ NEOCITY CONTROL ROOM ]</div>
        <div className={`city-status ${cityStatus}`}>{statusLabel}</div>
        <div className="shell-ports">
          3000 Shell | 3001 Hacker | 3002 Weather | 3003 Power | 3004 Billboard | 3005 Drones | 3006 Radio | 3007 Citizens | 3008 CCTV | 3009 Traffic | 3010 Hospital | 3011 Oracle
        </div>
      </header>

      <main className="shell-grid">
        <div className="mfe-slot slot-hacker">
          <MfeSlot name="HackerTerminal" port={3001} component={HackerTerminal} />
        </div>
        <div className="mfe-slot slot-weather">
          <MfeSlot name="WeatherTower" port={3002} component={WeatherTower} />
        </div>
        <div className="mfe-slot slot-billboard">
          <MfeSlot name="BillboardMatrix" port={3004} component={BillboardMatrix} />
        </div>
        <div className="mfe-slot slot-powergrid">
          <MfeSlot name="PowerGrid" port={3003} component={PowerGrid} />
        </div>

        <div className="mfe-slot slot-drones">
          <MfeSlot name="DroneSwarm" port={3005} component={DroneSwarm} />
        </div>
        <div className="mfe-slot slot-radio">
          <MfeSlot name="UndergroundRadio" port={3006} component={UndergroundRadio} />
        </div>
        <div className="mfe-slot slot-citizens">
          <MfeSlot name="CitizenFeed" port={3007} component={CitizenFeed} />
        </div>

        <div className="mfe-slot slot-cctv">
          <MfeSlot name="CCTVMatrix" port={3008} component={CCTVMatrix} />
        </div>
        <div className="mfe-slot slot-traffic">
          <MfeSlot name="TrafficGrid" port={3009} component={TrafficGrid} />
        </div>
        <div className="mfe-slot slot-hospital">
          <MfeSlot name="NeoHospital" port={3010} component={NeoHospital} />
        </div>

        <div className="mfe-slot slot-oracle">
          <MfeSlot name="AIOracle" port={3011} component={AIOracle} />
        </div>
      </main>
    </div>
  );
}
