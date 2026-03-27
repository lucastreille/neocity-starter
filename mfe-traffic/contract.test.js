const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

global.window = global.window || {};

function loadSharedEventBus() {
  const filePath = path.resolve(__dirname, '../shared/eventBus.js');
  const source = fs
    .readFileSync(filePath, 'utf8')
    .replace('export default window.__NEOCITY_BUS__;', 'module.exports = window.__NEOCITY_BUS__;');

  const localModule = new Module(filePath, module);
  localModule.filename = filePath;
  localModule.paths = Module._nodeModulePaths(path.dirname(filePath));
  localModule._compile(source, filePath);
  return localModule.exports;
}

test('mfe-traffic emits radio:broadcast with the expected contract', async () => {
  const eventBus = loadSharedEventBus();
  eventBus.listeners = {};

  await new Promise((resolve, reject) => {
    const unsub = eventBus.on('radio:broadcast', (data) => {
      try {
        assert.ok(data);
        assert.equal(typeof data.message, 'string');
        assert.equal(typeof data.frequency, 'string');
        assert.equal(typeof data.isEmergency, 'boolean');
        assert.match(data.frequency, /^\d{2,3}\.\d$/);
        unsub();
        resolve();
      } catch (error) {
        unsub();
        reject(error);
      }
    });

    eventBus.emit('radio:broadcast', {
      message: 'TRAFFIC CONTROL: Lockdown engaged. All major intersections switch to red.',
      frequency: '103.9',
      isEmergency: true,
    });
  });
});

test('eventBus unsubscribe stops radio:broadcast notifications', async () => {
  const eventBus = loadSharedEventBus();
  eventBus.listeners = {};

  let callCount = 0;
  const unsub = eventBus.on('radio:broadcast', () => {
    callCount += 1;
  });

  eventBus.emit('radio:broadcast', {
    message: 'TRAFFIC CONTROL: test signal',
    frequency: '103.9',
    isEmergency: false,
  });

  unsub();

  eventBus.emit('radio:broadcast', {
    message: 'TRAFFIC CONTROL: second test signal',
    frequency: '103.9',
    isEmergency: false,
  });

  assert.equal(callCount, 1);
});
