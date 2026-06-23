import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readServerEnv, safeReadServerEnv } from "@/lib/environment/env";

const COOKIE_NAME = "tara30_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
};

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildCookieValue(secret: string) {
  const payload = encodePayload({
    exp: Date.now() + SESSION_TTL_MS
  });
  const signature = signPayload(payload, secret);

  return `${payload}.${signature}`;
}

function verifyCookieValue(value: string, secret: string) {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = signPayload(payload, secret);

  if (expected.length !== signature.length) {
    return false;
  }

  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return false;
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
  return decoded.exp > Date.now();
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export async function isAdminAuthenticated() {
  const env = safeReadServerEnv();
  if (!env.success) {
    return false;
  }

  const cookieStore = cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) {
    return false;
  }

  return verifyCookieValue(value, env.data.SESSION_SECRET);
}

export async function requireAdminSession() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  const env = readServerEnv();
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, buildCookieValue(env.SESSION_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export async function destroyAdminSession() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

