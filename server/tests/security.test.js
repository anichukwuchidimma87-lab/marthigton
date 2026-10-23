import assert from "node:assert/strict";
import test from "node:test";
import {
  futureDate,
  normalizeEmail,
  normalizePhone,
  normalizeReferralCode,
  requiredText,
} from "../lib/validation.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

test("normalizes valid email and phone input", () => {
  assert.equal(normalizeEmail("  STAFF@Example.com "), "staff@example.com");
  assert.equal(normalizePhone("+234 813-292-9712"), "+234 813-292-9712");
});

test("rejects malformed email, phone, and oversized required text", () => {
  assert.throws(() => normalizeEmail("not-an-email"), { status: 400 });
  assert.throws(() => normalizePhone("call-me"), { status: 400 });
  assert.throws(() => requiredText("x".repeat(121), "Name", 120), { status: 400 });
});

test("appointment date must be a valid future timestamp", () => {
  assert.throws(() => futureDate("yesterday", "Preferred date"), { status: 400 });
  assert.throws(() => futureDate("2000-01-01T10:00:00.000Z", "Preferred date"), { status: 400 });
  assert.ok(futureDate(new Date(Date.now() + 60_000).toISOString(), "Preferred date") instanceof Date);
});

test("normalizes safe referral codes and rejects unsupported characters", () => {
  assert.equal(normalizeReferralCode(" Agent-abc_123 "), "agent-abc_123");
  assert.equal(normalizeReferralCode(undefined), undefined);
  assert.throws(() => normalizeReferralCode("agent/abc"), { status: 400 });
});

test("role middleware denies missing and disallowed roles", () => {
  const guard = allowRoles("admin", "superAdmin");
  for (const user of [undefined, { role: "agent" }]) {
    let receivedError;
    guard({ user }, {}, (error) => {
      receivedError = error;
    });
    assert.equal(receivedError.status, 403);
  }
});

test("role middleware allows explicitly permitted roles", () => {
  let nextCalled = false;
  allowRoles("admin")({ user: { role: "admin" } }, {}, (error) => {
    assert.equal(error, undefined);
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
