import React, { useState, useEffect, useCallback } from "react";
import "./CCTVMatrix.css";

const CAMERAS_DATA = [
  { id: "CAM-A", zone: "Zone Nord", defaultFeed: "RAS — Circulation normale" },
  {
    id: "CAM-B",
    zone: "Zone Centrale",
    defaultFeed: "Marché nocturne actif — 34 civils",
  },
  {
    id: "CAM-C",
    zone: "Port Est",
    defaultFeed: "Dock 7 — 2 véhicules stationnés",
  },
  {
    id: "CAM-D",
    zone: "Banlieue Sud",
    defaultFeed: "Patrouille Alpha en transit",
  },
  {
    id: "CAM-E",
    zone: "District K",
    defaultFeed: "Accès autorisé — Zone sécurisée",
  },
  {
    id: "CAM-F",
    zone: "Underground",
    defaultFeed: "Flux tunnel normal — 12 km/h",
  },
];

function getStatusLabel(status) {
  switch (status) {
    case "online":
      return "REC";
    case "degraded":
      return "DÉGRADÉ";
    case "hacked":
      return "INTRUSION";
    case "offline":
      return "HORS LIGNE";
    default:
      return "REC";
  }
}

function getOverallStatus(cameras) {
  if (cameras.some((c) => c.status === "hacked")) return "BRÈCHE DÉTECTÉE";
  if (cameras.some((c) => c.status === "offline")) return "PANNE DÉTECTÉE";
  if (cameras.some((c) => c.status === "degraded")) return "DÉGRADATION";
  return "TOUTES OPÉRATIONNELLES";
}

export default function CCTVMatrix() {
  const [cameras, setCameras] = useState(
    CAMERAS_DATA.map((cam) => ({
      ...cam,
      status: "online",
      feed: cam.defaultFeed,
      drone: false,
    })),
  );
  const [time, setTime] = useState(new Date());
  const [glitching, setGlitching] = useState(false);
  const [droneAlert, setDroneAlert] = useState(false);
  const [breachActive, setBreachActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("fr-FR", { hour12: false });

  const resetCameras = useCallback(() => {
    setCameras(
      CAMERAS_DATA.map((cam) => ({
        ...cam,
        status: "online",
        feed: cam.defaultFeed,
        drone: false,
      })),
    );
    setDroneAlert(false);
    setBreachActive(false);
  }, []);

  const triggerGlitch = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 600);
  };

  useEffect(() => {
    const handleHackerCommand = () => {
      triggerGlitch();
      setBreachActive(true);
      setCameras((prev) =>
        prev.map((cam, i) =>
          i === 1 || i === 4
            ? { ...cam, status: "hacked", feed: "⚠ ACCÈS NON AUTORISÉ ⚠" }
            : cam,
        ),
      );
      setTimeout(resetCameras, 8000);
    };

    const handlePowerOutage = () => {
      triggerGlitch();
      setCameras((prev) =>
        prev.map((cam, i) =>
          i === 0 || i === 2 || i === 5
            ? { ...cam, status: "offline", feed: "" }
            : { ...cam, status: "degraded", feed: cam.defaultFeed },
        ),
      );
      setTimeout(resetCameras, 8000);
    };

    const handleDroneFormation = () => {
      triggerGlitch();
      setDroneAlert(true);
      setCameras((prev) =>
        prev.map((cam, i) =>
          i === 0 || i === 3
            ? {
                ...cam,
                drone: true,
                status: "degraded",
                feed: "Drone détecté — Tracking...",
              }
            : cam,
        ),
      );
      setTimeout(resetCameras, 8000);
    };

    window.addEventListener("hacker:command", handleHackerCommand);
    window.addEventListener("power:outage", handlePowerOutage);
    window.addEventListener("drone:formation", handleDroneFormation);

    return () => {
      window.removeEventListener("hacker:command", handleHackerCommand);
      window.removeEventListener("power:outage", handlePowerOutage);
      window.removeEventListener("drone:formation", handleDroneFormation);
    };
  }, [resetCameras]);

  const simulateBreach = () => {
    triggerGlitch();
    setBreachActive(true);
    setCameras((prev) =>
      prev.map((cam, i) =>
        i % 2 === 0
          ? { ...cam, status: "hacked", feed: "⚠ SIGNAL COMPROMIS ⚠" }
          : { ...cam, status: "degraded", feed: "Interférence détectée..." },
      ),
    );
    window.dispatchEvent(
      new CustomEvent("surveillance:breach", {
        detail: { source: "cctv-matrix", timestamp: Date.now() },
      }),
    );
    setTimeout(resetCameras, 8000);
  };

  const overallStatus = getOverallStatus(cameras);

  return (
    <div className="cctv-matrix">
      <button className="simulate-btn" onClick={simulateBreach}>
        ► SIMULATE BREACH
      </button>

      <div className="cctv-header">
        <span>▣ SURVEILLANCE — NEOCITY CCTV</span>
        <span className={`breach-badge${breachActive ? " active" : ""}`}>
          ● {overallStatus}
        </span>
      </div>

      {droneAlert && (
        <div className="drone-alert">
          ⚠ ALERTE DRONE — FORMATION DÉTECTÉE EN APPROCHE ⚠
        </div>
      )}

      <div className={`cameras-grid${glitching ? " glitching" : ""}`}>
        {cameras.map((cam) => (
          <div key={cam.id} className={`camera camera-${cam.status}`}>
            <div className="camera-header">
              <span className="cam-id">{cam.id}</span>
              <span className={`cam-status ${cam.status}`}>
                ● {getStatusLabel(cam.status)}
              </span>
            </div>
            <div className="camera-feed">
              {cam.status === "offline" ? (
                <span className="no-signal">NO SIGNAL</span>
              ) : (
                <span
                  className={`feed-text${cam.status !== "online" ? " " + cam.status : ""}`}
                >
                  {cam.feed}
                </span>
              )}
              {cam.drone && <div className="drone-overlay">DRONE</div>}
            </div>
            <div className="camera-footer">
              <span>{cam.zone}</span>
              <span className="cam-time">{formatTime(time)}</span>
            </div>
            <div className="scanlines" />
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>
        listen: hacker:command, power:outage, drone:formation | emit:
        surveillance:breach
      </div>
    </div>
  );
}
