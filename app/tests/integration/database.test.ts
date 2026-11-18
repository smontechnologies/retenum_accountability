import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createTestDb } from "../helpers/db";
import { appendEvent, verifyEngagementChain } from "@/server/events/append";
import { engagementEvents, securityAuditLog } from "@/server/db/schema";
import { newId } from "@/server/lib/ids";
import type { Database } from "@/server/db/client";
import type { PGlite } from "@electric-sql/pglite";

/** Drizzle wraps driver errors ("Failed query: ..."); the trigger's message is on the cause. */
async function expectAppendOnlyRejection(p: Promise<unknown>) {
  const err = await p.then(
    () => null,
    (e: unknown) => e as Error & { cause?: Error },
  );
  expect(err, "expected the statement to be rejected").not.toBeNull();
  expect(`${err!.message} ${err!.cause?.message ?? ""}`).toMatch(/append-only table/);
}

let db: Database;
let client: PGlite;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, client, close } = await createTestDb());
});
afterAll(async () => close());

describe("migrations", () => {
  it("create all foundation tables", async () => {
    const res = await client.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );
    const names = res.rows.map((r) => r.table_name);
    for (const t of ["user", "session", "account", "verification", "engagement_events", "security_audit_log", "outbox"]) {
      expect(names).toContain(t);
    }
  });
});

describe("append-only history (AC-HIS-1, FR-HIS-02)", () => {
  it("rejects UPDATE, DELETE and TRUNCATE on engagement_events", async () => {
    const engagementId = newId();
    await db.transaction(async (tx) => {
      await appendEvent(tx as unknown as Database, {
        engagementId,
        type: "test.created",
        actorUserId: null,
        actorSide: "system",
        data: { a: 1 },
      });
    });
    await expectAppendOnlyRejection(db.execute(sql`update engagement_events set type = 'x'`));
    await expectAppendOnlyRejection(db.execute(sql`delete from engagement_events`));
    await expectAppendOnlyRejection(db.execute(sql`truncate engagement_events`));
    const rows = await db.select().from(engagementEvents);
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects UPDATE and DELETE on security_audit_log", async () => {
    await db.insert(securityAuditLog).values({ type: "test", data: {} });
    await expectAppendOnlyRejection(db.execute(sql`update security_audit_log set type = 'x'`));
    await expectAppendOnlyRejection(db.execute(sql`delete from security_audit_log`));
  });
});

describe("engagement event chain (FR-HIS-01, FR-HIS-03)", () => {
  it("assigns sequential seq numbers and links hashes", async () => {
    const engagementId = newId();
    for (let i = 1; i <= 3; i++) {
      await db.transaction(async (tx) => {
        await appendEvent(tx as unknown as Database, {
          engagementId,
          type: "test.step",
          actorUserId: "user-1",
          actorSide: "payee",
          target: { kind: "commitment", id: `c${i}` },
          data: { step: i, amountMinor: BigInt(i * 100).toString() },
        });
      });
    }
    const rows = await db.select().from(engagementEvents).where(sql`engagement_id = ${engagementId}`).orderBy(engagementEvents.seq);
    expect(rows.map((r) => r.seq)).toEqual([1, 2, 3]);
    expect(rows[1]!.prevHash).toBe(rows[0]!.hash);
    expect(rows[2]!.prevHash).toBe(rows[1]!.hash);
    expect(await verifyEngagementChain(db, engagementId)).toBeNull();
  });

  it("keeps separate chains per engagement", async () => {
    const a = newId();
    const b = newId();
    await db.transaction(async (tx) => {
      await appendEvent(tx as unknown as Database, { engagementId: a, type: "t", actorUserId: null, actorSide: null, data: {} });
      await appendEvent(tx as unknown as Database, { engagementId: b, type: "t", actorUserId: null, actorSide: null, data: {} });
    });
    const rows = await db.select().from(engagementEvents).where(sql`engagement_id in (${a}, ${b})`);
    expect(rows.every((r) => r.seq === 1)).toBe(true);
  });

  it("does not persist an event when the surrounding transaction rolls back", async () => {
    const engagementId = newId();
    await expect(
      db.transaction(async (tx) => {
        await appendEvent(tx as unknown as Database, { engagementId, type: "t", actorUserId: null, actorSide: null, data: {} });
        throw new Error("business rule failed");
      }),
    ).rejects.toThrow("business rule failed");
    const rows = await db.select().from(engagementEvents).where(sql`engagement_id = ${engagementId}`);
    expect(rows).toHaveLength(0);
  });

  it("detects tampering by someone who bypasses the triggers (tamper-evident, D-47)", async () => {
    const engagementId = newId();
    for (let i = 0; i < 3; i++) {
      await db.transaction(async (tx) => {
        await appendEvent(tx as unknown as Database, {
          engagementId,
          type: "test.amount",
          actorUserId: "u",
          actorSide: "payer",
          data: { amountMinor: "100" },
        });
      });
    }
    // Simulate a database superuser disabling protection and editing history.
    await client.exec("alter table engagement_events disable trigger engagement_events_append_only");
    await client.query(
      `update engagement_events set data = '{"amountMinor":"999"}'::jsonb where engagement_id = $1 and seq = 2`,
      [engagementId],
    );
    await client.exec("alter table engagement_events enable trigger engagement_events_append_only");
    expect(await verifyEngagementChain(db, engagementId)).toBe(2);
  });
});
