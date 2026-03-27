import React, { useState, useEffect, useRef, useCallback } from "react";
import "./PowerGrid.css";
import eventBus from "shared/eventBus";

const ZONES = [
  { id: "A", name: "Downtown Sector", mw: 120 },
  { id: "B", name: "Industrial Bay", mw: 95 },
  { id: "C", name: "Neon Heights", mw: 78 },
  { id: "D", name: "Old Grid", mw: 64 },
  { id: "E", name: "Harbor Lines", mw: 88 },
  { id: "F", name: "Metro Core", mw: 110 },
];

const ZONE_IDS = ZONES.map((z) => z.id);

// Zone status: "online" | "orange" | "red" | "black" | "love"
const defaultZoneStates = () =>
  Object.fromEntries(ZONE_IDS.map((id) => [id, "online"]));

export default function PowerGrid() {
  const [cityPower, setCityPower] = useState(100);
  const [showFailure, setShowFailure] = useState(false);
  const [zoneStates, setZoneStates] = useState(defaultZoneStates);
  const timersRef = useRef([]);

  // Clear any running cascade timers
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    // ─── weather:change ───────────────────────────────────
    const unsubWeather = eventBus.on("weather:change", ({ intensity }) => {
      clearTimers();

      if (intensity >= 80) {
        // B,D → orange  +  A,E → red
        setZoneStates((prev) => ({
          ...prev,
          B: "orange",
          D: "orange",
          A: "red",
          E: "red",
        }));
        setCityPower(34);
        setShowFailure(false);
        eventBus.emit("power:outage", {
          zones: ["A", "B", "D", "E"],
          severity: "partial",
          cityPower: 34,
        });
      } else if (intensity >= 50) {
        // B,D → orange
        setZoneStates((prev) => ({
          ...prev,
          A: "online",
          E: "online",
          B: "orange",
          D: "orange",
        }));
        setCityPower(72);
        setShowFailure(false);
        eventBus.emit("power:outage", {
          zones: ["B", "D"],
          severity: "partial",
          cityPower: 72,
        });
      } else {
        // Below 50 → everything back to normal
        setZoneStates(defaultZoneStates());
        setCityPower(100);
        setShowFailure(false);
      }
    });

    // ─── hacker:command ───────────────────────────────────
    const unsubHacker = eventBus.on("hacker:command", ({ command }) => {
      clearTimers();

      if (command === "blackout") {
        // Cascade noir A → F, 300 ms entre chaque
        ZONE_IDS.forEach((id, i) => {
          const t = setTimeout(() => {
            setZoneStates((prev) => ({ ...prev, [id]: "black" }));
            // After last zone goes black
            if (i === ZONE_IDS.length - 1) {
              setCityPower(0);
              setShowFailure(true);
            }
          }, i * 300);
          timersRef.current.push(t);
        });
      } else if (command === "love") {
        // Toutes les zones → vert pulsant
        setZoneStates(Object.fromEntries(ZONE_IDS.map((id) => [id, "love"])));
        setCityPower(100);
        setShowFailure(false);
      } else if (command === "reset") {
        // Rallumage inverse F → A, 300 ms entre chaque
        const reversed = [...ZONE_IDS].reverse();
        reversed.forEach((id, i) => {
          const t = setTimeout(() => {
            setZoneStates((prev) => ({ ...prev, [id]: "online" }));
            // After last zone (A) is back online
            if (i === reversed.length - 1) {
              setCityPower(100);
              setShowFailure(false);
            }
          }, i * 300);
          timersRef.current.push(t);
        });
      }
    });

    return () => {
      unsubWeather();
      unsubHacker();
      clearTimers();
    };
  }, [clearTimers]);

  // ─── helpers ────────────────────────────────────────────
  const indicatorColor = (status) => {
    switch (status) {
      case "orange":
        return "#ff8800";
      case "red":
        return "#ff003c";
      case "black":
        return "#222";
      case "love":
        return "#00ff88";
      default:
        return "#00ff88";
    }
  };

  const zoneClass = (status) => {
    switch (status) {
      case "orange":
        return "zone zone-warning";
      case "red":
        return "zone zone-critical";
      case "black":
        return "zone zone-offline";
      case "love":
        return "zone zone-love";
      default:
        return "zone zone-online";
    }
  };

  const powerBarStyle = {
    width: `${Math.max(0, Math.min(100, cityPower))}%`,
    background:
      cityPower === 0 ? "#ff003c" : cityPower <= 50 ? "#ff8800" : "#00ff88",
  };

  return (
    <div className="powergrid">
      <div className="grid-header">
        <span className="grid-title">POWER GRID</span>
        <span className="city-power">CITY POWER: {cityPower}%</span>
      </div>

      {/* ── Simulate buttons ── */}
      <div className="simulate-row">
        <button
          className="simulate-btn"
          onClick={() => eventBus.emit("weather:change", { intensity: 50 })}
        >
          WEATHER 50
        </button>
        <button
          className="simulate-btn"
          onClick={() => eventBus.emit("weather:change", { intensity: 80 })}
        >
          WEATHER 80
        </button>
        <button
          className="simulate-btn"
          onClick={() =>
            eventBus.emit("hacker:command", { command: "blackout" })
          }
        >
          BLACKOUT
        </button>
        <button
          className="simulate-btn"
          onClick={() => eventBus.emit("hacker:command", { command: "love" })}
        >
          LOVE
        </button>
        <button
          className="simulate-btn"
          onClick={() => eventBus.emit("hacker:command", { command: "reset" })}
        >
          RESET
        </button>
      </div>

      <div className="power-bar-track">
        <div className="power-bar-fill" style={powerBarStyle} />
      </div>

      {showFailure && <div className="blackout-alert">GRID FAILURE</div>}

      <div className="zones-grid">
        {ZONES.map((z) => {
          const status = zoneStates[z.id];
          return (
            <div key={z.id} className={zoneClass(status)}>
              <div
                className="zone-indicator"
                style={{ background: indicatorColor(status) }}
              />
              <div className="zone-id">ZONE {z.id}</div>
              <div className="zone-name">{z.name}</div>
              <div className="zone-power">{z.mw} MW</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
