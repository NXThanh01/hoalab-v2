import type { z } from "zod";

export function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const protocol = process.env.VERCEL ? "https:" : url.protocol;
  return origin === `${protocol}//${host.toLowerCase()}`;
}

export function authJson(data: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  return Response.json(data, { status, headers: responseHeaders });
}

export function fieldErrors(error: z.ZodError) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]));
}
