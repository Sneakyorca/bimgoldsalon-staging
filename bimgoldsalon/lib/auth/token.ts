// Pure crypto so proxy.ts and server code can use it.
import { createHmac, timingSafeEqual } from "node:crypto";

export type TokenPayload = { sub: string; iat: number; exp: number; k: string };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32)
    throw new Error("Set AUTH_SECRET (32+ random characters) in .env.local");
  return value;
}
const sign = (data: string) =>
  createHmac("sha256", secret()).update(data).digest("base64url");
export function encodeToken(sub: string, kind: string, maxAgeSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({ sub, iat: now, exp: now + maxAgeSec, k: kind }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function decodeToken(
  token: string | undefined | null,
  kind: string,
): TokenPayload | null {
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given))
    return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as TokenPayload;
    return payload.k === kind &&
      typeof payload.sub === "string" &&
      payload.exp >= Math.floor(Date.now() / 1000)
      ? payload
      : null;
  } catch {
    return null;
  }
}
