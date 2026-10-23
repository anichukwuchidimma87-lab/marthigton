import assert from "node:assert/strict";
import test from "node:test";
import { getRuntimeConfiguration } from "../lib/runtimeConfiguration.js";

test("reports configuration health without disclosing secret values", () => {
  const configuration = getRuntimeConfiguration(
    {
      MONGODB_URI: "mongodb://private-user:private-password@example.invalid/db",
      JWT_SECRET: "a-secret-that-is-at-least-thirty-two-characters",
      CLIENT_ORIGINS: "https://app.example.com, https://admin.example.com",
      PORT: "8000",
      NODE_ENV: "production",
    },
    1,
  );

  assert.deepEqual(configuration.database, { configured: true, connected: true });
  assert.deepEqual(configuration.jwtSecret, { configured: true, meetsMinimumLength: true });
  assert.deepEqual(configuration.clientOrigins, { configured: true, count: 2 });
  assert.deepEqual(configuration.port, { configured: true, value: 8000 });
  assert.equal(configuration.nodeEnvironment, "production");
  assert.equal(JSON.stringify(configuration).includes("private-password"), false);
  assert.equal(JSON.stringify(configuration).includes("a-secret"), false);
});

test("reports missing secrets and uses the local default port", () => {
  const configuration = getRuntimeConfiguration({}, 0);
  assert.deepEqual(configuration.database, { configured: false, connected: false });
  assert.deepEqual(configuration.jwtSecret, { configured: false, meetsMinimumLength: false });
  assert.deepEqual(configuration.clientOrigins, { configured: false, count: 1 });
  assert.deepEqual(configuration.port, { configured: false, value: 5000 });
});
