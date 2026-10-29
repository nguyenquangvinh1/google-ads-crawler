import { cookies } from "next/headers";
import { encode, decode } from "next-auth/jwt";
import { OAuth2Client } from "google-auth-library";

const cookieName = "ads-session";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export class AdsAuthError extends Error {}

function secret() {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value || value.length < 32) throw new Error("NEXTAUTH_SECRET cần ít nhất 32 ký tự ngẫu nhiên");
  return value;
}

export function appOrigin() {
  return new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").origin;
}

export function oauthClient() {
  if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET) {
    throw new Error("Chưa cấu hình OAuth của công ty");
  }
  return new OAuth2Client(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET, `${appOrigin()}/api/ads-auth/callback`);
}

export async function seal(payload: Record<string, unknown>, maxAge: number) {
  return encode({ token: payload, secret: secret(), maxAge });
}

export async function unseal(token?: string) {
  try { return await decode({ token, secret: secret() }); } catch { return null; }
}

export async function readSession() {
  const session = await unseal((await cookies()).get(cookieName)?.value);
  if (!session || typeof session.refreshToken !== "string") throw new AdsAuthError("Vui lòng kết nối lại Google Ads");
  return { refreshToken: session.refreshToken, customerId: typeof session.customerId === "string" ? session.customerId : undefined };
}

export async function saveSession(session: { refreshToken: string; customerId?: string }) {
  const maxAge = 30 * 24 * 60 * 60;
  (await cookies()).set(cookieName, await seal(session, maxAge), { ...cookieOptions, maxAge });
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}
