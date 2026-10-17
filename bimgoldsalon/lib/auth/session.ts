import "server-only";
import { cookies } from "next/headers";
import { decodeToken, encodeToken } from "./token";

export const SESSION_COOKIE = "bg_session";
export const RECOVERY_COOKIE = "bg_recovery";
export const SESSION_MAX_AGE = 60 * 60 * 8;
export const RECOVERY_MAX_AGE = 60 * 15;
const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
export async function startSession(userId: string) {
  (await cookies()).set(
    SESSION_COOKIE,
    encodeToken(userId, "session", SESSION_MAX_AGE),
    { ...base, maxAge: SESSION_MAX_AGE },
  );
}
export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
export async function readSession() {
  return decodeToken((await cookies()).get(SESSION_COOKIE)?.value, "session");
}
export async function startRecovery(userId: string) {
  (await cookies()).set(
    RECOVERY_COOKIE,
    encodeToken(userId, "recovery", RECOVERY_MAX_AGE),
    { ...base, maxAge: RECOVERY_MAX_AGE },
  );
}
export async function readRecovery() {
  return decodeToken((await cookies()).get(RECOVERY_COOKIE)?.value, "recovery");
}
export async function endRecovery() {
  (await cookies()).delete(RECOVERY_COOKIE);
}
