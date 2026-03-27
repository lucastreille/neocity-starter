/**
 * NeoCity Event Bus — Communication inter-MFE
 * Singleton partagé via window.__NEOCITY_BUS__
 *
 * Usage:
 *   import eventBus from 'shared/eventBus';
 *   const unsub = eventBus.on('hacker:command', (data) => { ... });
 *   eventBus.emit('weather:change', { condition: 'storm', intensity: 72 });
 *   return () => unsub(); // TOUJOURS dans le return du useEffect !
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    console.log(`[NeoCity Bus] ${event}`, data);
    this.listeners[event].forEach(cb => {
      try { cb(data); } catch (e) { console.error(`[NeoCity Bus] Error in ${event}:`, e); }
    });
  }
}

if (!window.__NEOCITY_BUS__) {
  window.__NEOCITY_BUS__ = new EventBus();
}

export default window.__NEOCITY_BUS__;
