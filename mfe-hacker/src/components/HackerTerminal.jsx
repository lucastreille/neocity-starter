import React, { useState } from "react";
import "./HackerTerminal.css";

export default function Terminal() {
  const [history, setHistory] = useState([]);
  const [command, setCommand] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const cmd = command.trim().toLowerCase();

    const newHistory = [...history, `root@neocity:~$ ${cmd}`];

    let feedback = "";
    let event = null;

    switch (cmd) {
      case "storm":
        feedback = "✓ Command executed: STORM LEVEL 2";
        event = { command: "storm", level: 2 };
        break;

      case "storm max":
        feedback = "✓ Command executed: STORM MAX LEVEL 3";
        event = { command: "storm", level: 3 };
        break;

      case "blackout":
        feedback = "✓ Command executed: BLACKOUT";
        event = { command: "blackout", level: 2 };
        break;

      case "riot":
        feedback = "✓ Command executed: RIOT";
        event = { command: "riot", level: 2 };
        break;

      case "drones":
        feedback = "✓ Command executed: DRONES FORMATION";
        event = { command: "drones", level: 1 };
        break;

      case "love":
        feedback = "✓ Command executed: LOVE MODE ❤️";
        event = { command: "love", level: 1 };
        break;

      case "reset":
        feedback = "✓ City reset to normal.";
        event = { command: "reset", level: 0 };
        break;

      case "help":
        feedback =
          "Commands: storm | storm max | blackout | riot | drones | love | reset";
        break;

      default:
        feedback = "⚠ Command not found. Type 'help'.";
    }

    // console pour tester l'event (comme demandé dans le brief)
    if (event) {
      console.log("EVENT:", {
        event: "hacker:command",
        payload: event,
      });
    }

    newHistory.push(feedback);

    setHistory(newHistory);
    setCommand("");
  };

  return (
    <div className="terminal">
      <div className="header">
        <div>[ NEOCITY BREACH v2.7 ]</div>
        <div>- CONNECTED</div>
      </div>

      <div className="history">
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-line">
        <span>root@neocity:~$ </span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          autoFocus
          autoComplete="off"
        />
      </form>
    </div>
  );
}