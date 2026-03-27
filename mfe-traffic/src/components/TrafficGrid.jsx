import React from 'react';
import './TrafficGrid.css';

export default function TrafficGrid() {
  return (
    <div className="traffic-grid">
      <div className="traffic-header">
        <span>TRAFFIC CONTROL - STUDENT STARTER</span>
        <span className="traffic-mode mode-normal">TODO</span>
      </div>

      <button className="simulate-btn" disabled>
        SIMULATE LOCKDOWN (TODO)
      </button>

      <div className="lights-grid">
        <div className="traffic-light">
          <div className="light-body">
            <div className="led led-red on" />
            <div className="led led-yellow" />
            <div className="led led-green" />
          </div>
          <div className="light-pole" />
        </div>
      </div>

      <div className="traffic-stats">
        <span>TODO: timed light phases</span>
        <span>emit traffic:chaos</span>
      </div>
    </div>
  );
}