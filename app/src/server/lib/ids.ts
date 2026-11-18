import { randomBytes, randomUUID, createHash } from "node:crypto";

/** Primary keys: UUID v4. */
export const newId = (): string => randomUUID();

/** Human-quotable payment reference, e.g. RTN-01JD3M... (time-sortable, 26 chars Crockford base32). */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function newReference(prefix = "RTN", now: number = Date.now()): string {
  let time = "";
  let t = now;
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32] + time;
    t = Math.floor(t / 32);
  }
  const rand = randomBytes(16);
  let r = "";
  for (let i = 0; i < 16; i++) r += CROCKFORD[rand[i]! % 32];
  return `${prefix}-${time}${r}`;
}

/** Secret tokens for invitations/resets (SEC-06): 32 bytes, url-safe; only the hash is stored. */
export function newSecretToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");
