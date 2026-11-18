import { desc, eq, sql, asc } from "drizzle-orm";
import type { Database } from "../db/client";
import { engagementEvents } from "../db/schema";
import { chainHash, findBrokenLink, GENESIS_HASH } from "@/domain/hash-chain";
import { newId } from "../lib/ids";

export type ActorSide = "payer" | "payee" | "system";

export interface AppendEventInput {
  engagementId: string;
  type: string;
  actorUserId: string | null;
  actorSide: ActorSide | null;
  target?: Record<string, unknown> | null;
  data: Record<string, unknown>;
  ipHash?: string | null;
  userAgent?: string | null;
  at?: Date;
}

/** The exact fields covered by the hash. Changing this is a breaking change to verification. */
function hashedPayload(e: {
  id: string;
  engagementId: string;
  seq: number;
  type: string;
  actorUserId: string | null;
  actorSide: string | null;
  target: Record<string, unknown> | null;
  data: Record<string, unknown>;
  createdAt: Date;
}) {
  return {
    id: e.id,
    engagementId: e.engagementId,
    seq: e.seq,
    type: e.type,
    actorUserId: e.actorUserId,
    actorSide: e.actorSide,
    target: e.target,
    data: e.data,
    createdAt: e.createdAt,
  };
}

/**
 * Append an event inside the caller's transaction (FR-HIS-01). Appends for one engagement are
 * serialised with a transaction-scoped advisory lock so seq and prev_hash are consistent.
 * MUST be called within db.transaction(...) by services.
 */
export async function appendEvent(tx: Database, input: AppendEventInput) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.engagementId}))`);
  const [last] = await tx
    .select({ seq: engagementEvents.seq, hash: engagementEvents.hash })
    .from(engagementEvents)
    .where(eq(engagementEvents.engagementId, input.engagementId))
    .orderBy(desc(engagementEvents.seq))
    .limit(1);

  const row = {
    id: newId(),
    engagementId: input.engagementId,
    seq: (last?.seq ?? 0) + 1,
    type: input.type,
    actorUserId: input.actorUserId,
    actorSide: input.actorSide,
    target: input.target ?? null,
    data: input.data,
    // millisecond precision so the stored value round-trips exactly into the hash
    createdAt: new Date(Math.floor((input.at ?? new Date()).getTime())),
  };
  const prevHash = last?.hash ?? GENESIS_HASH;
  const hash = chainHash(prevHash, hashedPayload(row));
  await tx.insert(engagementEvents).values({ ...row, prevHash, hash, ipHash: input.ipHash ?? null, userAgent: input.userAgent ?? null });
  return { ...row, prevHash, hash };
}

/** Recompute the chain for an engagement. Returns the seq of the first broken event, or null if intact. */
export async function verifyEngagementChain(db: Database, engagementId: string): Promise<number | null> {
  const rows = await db
    .select()
    .from(engagementEvents)
    .where(eq(engagementEvents.engagementId, engagementId))
    .orderBy(asc(engagementEvents.seq));
  const idx = findBrokenLink(
    rows.map((r) => ({
      prevHash: r.prevHash,
      hash: r.hash,
      payload: hashedPayload({
        id: r.id,
        engagementId: r.engagementId,
        seq: r.seq,
        type: r.type,
        actorUserId: r.actorUserId,
        actorSide: r.actorSide,
        target: r.target ?? null,
        data: r.data,
        createdAt: r.createdAt,
      }),
    })),
  );
  return idx === -1 ? null : rows[idx]!.seq;
}
