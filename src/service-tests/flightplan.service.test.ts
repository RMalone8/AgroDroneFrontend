/**
 * Flight plan HTTP + MQTT service tests.
 *
 * Requires the backend and MQTT broker to be running:
 *   docker compose up mqtt backend -d
 *
 * Reads credentials from the project .env file (gitignored):
 *   VITE_DEVICE_TOKEN   — Bearer token for the backend
 *   VITE_BACKEND_URL    — e.g. http://localhost:8787  (optional, defaults below)
 *
 * Run with: npm run test:service
 * Run one suite: npm run test:service -- -t "suite name"
 */

import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import mqtt from 'mqtt';

const BACKEND_URL = process.env.VITE_BACKEND_URL ?? 'http://localhost:8787';
const BROKER_WS_URL = 'ws://localhost:9001';
const AUTH = `Bearer ${process.env.VITE_DEVICE_TOKEN}`;

// Fixed IDs so cleanup is reliable across runs
const SAVE_MISSION_ID     = '00000000-test-save-0000-service-test1';
const MQTT_MISSION_ID     = '00000000-test-mqtt-0000-service-test2';
const DELETE_MISSION_ID   = '00000000-test-del0-0000-service-test3';
const ACTIVATE_MISSION_ID = '00000000-test-actv-0000-service-test4';
const ACTIVATE_MQTT_ID    = '00000000-actv-mqtt-0000-service-test5';

const ALL_MISSION_IDS = [
  SAVE_MISSION_ID,
  MQTT_MISSION_ID,
  DELETE_MISSION_ID,
  ACTIVATE_MISSION_ID,
  ACTIVATE_MQTT_ID,
];

function makePlan(missionId: string) {
  return {
    missionId,
    createdAt: new Date().toISOString(),
    totalVertices: 3,
    vertices: [
      { order: 0, lng: -71.1382523, lat: 42.3894243 },
      { order: 1, lng: -71.1392523, lat: 42.3904243 },
      { order: 2, lng: -71.1372523, lat: 42.3904243 },
      { order: 3, lng: -71.1382523, lat: 42.3894243 }, // closing vertex
    ],
  };
}

async function savePlan(missionId: string) {
  return fetch(`${BACKEND_URL}/flightplan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: AUTH },
    body: JSON.stringify(makePlan(missionId)),
  });
}

async function deletePlan(missionId: string) {
  return fetch(`${BACKEND_URL}/flightplan/${missionId}`, {
    method: 'DELETE',
    headers: { Authorization: AUTH },
  });
}

// Clean up all known test IDs after the full suite, regardless of which tests ran
afterAll(async () => {
  await Promise.all(ALL_MISSION_IDS.map(deletePlan));
});

// ── Save mission ──────────────────────────────────────────────────────────────

describe('Save mission — POST /flightplan', () => {
  afterAll(() => deletePlan(SAVE_MISSION_ID));

  it('returns 200 and confirms the flight plan was saved', async () => {
    const response = await savePlan(SAVE_MISSION_ID);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe('Flight Plan Saved');
  });

  it('returns 401 without a valid token', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makePlan(SAVE_MISSION_ID)),
    });
    expect(response.status).toBe(401);
  });
});

// ── Get all flight plans ──────────────────────────────────────────────────────

describe('Get all flight plans — GET /flightplan/all', () => {
  beforeAll(() => savePlan(SAVE_MISSION_ID));
  afterAll(() => deletePlan(SAVE_MISSION_ID));

  it('returns an object with a flightplans array and metadata', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/all`, {
      headers: { Authorization: AUTH },
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { flightplans: unknown[]; metadata: Record<string, unknown> };
    expect(Array.isArray(data.flightplans)).toBe(true);
    expect(typeof data.metadata).toBe('object');
  });

  it('includes the flight plan saved in beforeAll', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/all`, {
      headers: { Authorization: AUTH },
    });
    const data = await response.json() as { flightplans: { missionId: string }[] };
    const found = data.flightplans.find((fp) => fp.missionId === SAVE_MISSION_ID);
    expect(found).toBeDefined();
    expect(found?.missionId).toBe(SAVE_MISSION_ID);
  });

  it('returns 401 without a valid token', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/all`);
    expect(response.status).toBe(401);
  });
});

// ── MQTT delivery ─────────────────────────────────────────────────────────────

describe('Flight plan MQTT delivery — backend publishes after POST', () => {
  afterAll(() => deletePlan(MQTT_MISSION_ID));

  it('delivers the saved flight plan to the flightplan MQTT topic', () =>
    new Promise<void>((resolve, reject) => {
      const subscriber = mqtt.connect(BROKER_WS_URL);

      subscriber.on('connect', () => {
        subscriber.subscribe('flightplan', (err) => {
          if (err) return reject(err);
          savePlan(MQTT_MISSION_ID).catch(reject);
        });
      });

      subscriber.on('message', (_topic, payload) => {
        try {
          const received = JSON.parse(payload.toString()) as { missionId: string };
          if (received.missionId !== MQTT_MISSION_ID) return;
          expect(received.missionId).toBe(MQTT_MISSION_ID);
          subscriber.end();
          resolve();
        } catch (e) {
          subscriber.end();
          reject(e);
        }
      });

      subscriber.on('error', reject);
    }));
});

// ── Delete flight plan ────────────────────────────────────────────────────────

describe('Delete flight plan — DELETE /flightplan/:id', () => {
  beforeAll(() => savePlan(DELETE_MISSION_ID));
  // No afterAll — the test itself deletes the plan; file-level afterAll covers failure cases

  it('deletes a flight plan and confirms it is gone', async () => {
    // Confirm it exists
    const beforeRes = await fetch(`${BACKEND_URL}/flightplan/all`, { headers: { Authorization: AUTH } });
    const before = await beforeRes.json() as { flightplans: { missionId: string }[] };
    expect(before.flightplans.find(fp => fp.missionId === DELETE_MISSION_ID)).toBeDefined();

    // Delete
    const deleteRes = await deletePlan(DELETE_MISSION_ID);
    expect(deleteRes.status).toBe(200);

    // Confirm it is gone
    const afterRes = await fetch(`${BACKEND_URL}/flightplan/all`, { headers: { Authorization: AUTH } });
    const after = await afterRes.json() as { flightplans: { missionId: string }[] };
    expect(after.flightplans.find(fp => fp.missionId === DELETE_MISSION_ID)).toBeUndefined();
  });

  it('returns 401 without a valid token', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/${DELETE_MISSION_ID}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(401);
  });
});

// ── Activate flight plan ──────────────────────────────────────────────────────

describe('Activate flight plan — PUT /flightplan/:id/activate', () => {
  beforeAll(() => Promise.all([
    savePlan(ACTIVATE_MISSION_ID),
    savePlan(ACTIVATE_MQTT_ID),
  ]));
  afterAll(() => Promise.all([
    deletePlan(ACTIVATE_MISSION_ID),
    deletePlan(ACTIVATE_MQTT_ID),
  ]));

  it('activates a flight plan and confirms it becomes the active plan', async () => {
    const activateRes = await fetch(`${BACKEND_URL}/flightplan/${ACTIVATE_MISSION_ID}/activate`, {
      method: 'PUT',
      headers: { Authorization: AUTH },
    });
    expect(activateRes.status).toBe(200);

    const allRes = await fetch(`${BACKEND_URL}/flightplan/all`, { headers: { Authorization: AUTH } });
    const data = await allRes.json() as { flightplans: { missionId: string }[]; metadata: { currentFlightPlan: string } };
    expect(data.metadata.currentFlightPlan).toBe(ACTIVATE_MISSION_ID);
  });

  it('returns 404 for a non-existent mission ID', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/00000000-0000-0000-0000-000000000000/activate`, {
      method: 'PUT',
      headers: { Authorization: AUTH },
    });
    expect(response.status).toBe(404);
  });

  it('returns 401 without a valid token', async () => {
    const response = await fetch(`${BACKEND_URL}/flightplan/${ACTIVATE_MISSION_ID}/activate`, {
      method: 'PUT',
    });
    expect(response.status).toBe(401);
  });

  it('publishes the activated plan to the flightplan MQTT topic', () =>
    new Promise<void>((resolve, reject) => {
      const subscriber = mqtt.connect(BROKER_WS_URL);

      subscriber.on('connect', () => {
        subscriber.subscribe('flightplan', (err) => {
          if (err) return reject(err);

          fetch(`${BACKEND_URL}/flightplan/${ACTIVATE_MQTT_ID}/activate`, {
            method: 'PUT',
            headers: { Authorization: AUTH },
          }).catch(reject);
        });
      });

      subscriber.on('message', (_topic, payload) => {
        try {
          const received = JSON.parse(payload.toString()) as { missionId: string };
          if (received.missionId !== ACTIVATE_MQTT_ID) return;
          expect(received.missionId).toBe(ACTIVATE_MQTT_ID);
          subscriber.end();
          resolve();
        } catch (e) {
          subscriber.end();
          reject(e);
        }
      });

      subscriber.on('error', reject);
    }));
});
