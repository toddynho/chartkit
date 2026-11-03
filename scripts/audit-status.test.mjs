import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { auditPath, statusFromAudit, statusPath, statusForKlass } from "./audit-status.mjs";

const audit = JSON.parse(readFileSync(auditPath, "utf8"));
const committed = JSON.parse(readFileSync(statusPath, "utf8"));

test("option effect status matches the audit", () => {
  assert.ok(audit.coverage, "audit coverage is missing; run npm run audit:options");
  assert.deepEqual(committed, statusFromAudit(audit));
});

test("every audit row is classified in the status map", () => {
  for (const row of audit.rows) {
    const entry = committed[row.type]?.[row.path];
    assert.ok(entry, `${row.type} ${row.path} missing from the status map`);
    assert.equal(entry.status, statusForKlass(row.klass), `${row.type} ${row.path}`);
  }
});

test("works entries were probed and did not fail", () => {
  const failed = new Set(audit.rows.map((row) => `${row.type}\0${row.path}`));
  for (const [type, fields] of Object.entries(committed)) {
    for (const [path, entry] of Object.entries(fields)) {
      assert.ok(audit.coverage[type]?.includes(path), `${type} ${path} is not in the audit coverage`);
      if (entry.status === "works") assert.equal(failed.has(`${type}\0${path}`), false);
      assert.ok(entry.status === "works" || entry.status === "needs-data" || entry.status === "not-yet");
    }
  }
});
