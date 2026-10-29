import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AdsAuthError, appOrigin, clearSession, cookieOptions, oauthClient, readSession, saveSession, seal, unseal } from "@/lib/ads-session";
import { getClient } from "@/lib/google-ads";

const flowCookie = "ads-oauth-flow";
type Context = { params: Promise<{ action: string }> };

async function accounts(refreshToken: string) {
  const result = await getClient().listAccessibleCustomers(refreshToken);
  return (result.resource_names || []).map((name) => name.replace("customers/", ""));
}

export async function GET(request: NextRequest, context: Context) {
  const { action } = await context.params;
  try {
    if (action === "connect") {
      const client = oauthClient();
      const state = randomBytes(32).toString("hex");
      const verifier = await client.generateCodeVerifierAsync();
      const url = client.generateAuthUrl({ access_type: "offline", prompt: "consent select_account", scope: ["https://www.googleapis.com/auth/adwords"], state, code_challenge: verifier.codeChallenge, code_challenge_method: "S256" as import("google-auth-library").CodeChallengeMethod });
      (await cookies()).set(flowCookie, await seal({ state, verifier: verifier.codeVerifier }, 600), { ...cookieOptions, maxAge: 600 });
      return NextResponse.redirect(url);
    }
    if (action === "callback") {
      const jar = await cookies();
      const flow = await unseal(jar.get(flowCookie)?.value);
      jar.delete(flowCookie);
      if (!flow || flow.state !== request.nextUrl.searchParams.get("state") || typeof flow.verifier !== "string") throw new AdsAuthError("Invalid OAuth state");
      const code = request.nextUrl.searchParams.get("code");
      if (!code || request.nextUrl.searchParams.has("error")) throw new AdsAuthError("OAuth denied");
      const { tokens } = await oauthClient().getToken({ code, codeVerifier: flow.verifier });
      if (!tokens.refresh_token) throw new AdsAuthError("Missing refresh token");
      await saveSession({ refreshToken: tokens.refresh_token });
      return NextResponse.redirect(new URL("/", appOrigin()));
    }
    if (action === "session") {
      const session = await readSession();
      return NextResponse.json({ connected: true, customerId: session.customerId, accounts: await accounts(session.refreshToken) }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    if (action === "callback" || action === "connect") return NextResponse.redirect(new URL("/?connection=failed", appOrigin()));
    return NextResponse.json({ connected: false, error: error instanceof AdsAuthError ? error.message : "Không tải được tài khoản Google Ads. Kiểm tra quyền truy cập hoặc kết nối lại." }, { status: error instanceof AdsAuthError ? 401 : 502, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest, context: Context) {
  if (request.headers.get("origin") !== appOrigin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { action } = await context.params;
  try {
    if (action === "disconnect") {
      await clearSession();
      return NextResponse.json({ success: true });
    }
    if (action === "select") {
      const session = await readSession();
      const { customerId } = await request.json();
      if (typeof customerId !== "string" || !(await accounts(session.refreshToken)).includes(customerId)) return NextResponse.json({ error: "Tài khoản không được cấp quyền" }, { status: 403 });
      await saveSession({ ...session, customerId });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Không thể cập nhật kết nối Google Ads" }, { status: error instanceof AdsAuthError ? 401 : 502 });
  }
}
