import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

const cfg = () => ({
  password: process.env["ADMIN_SESSION_SECRET"]!,
  name: "ytc-admin",
  maxAge: 60 * 60 * 24 * 365 * 5, // 5 years
  cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
});

function matches(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => ({ key: String(d?.key ?? "").slice(0, 500) }))
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_ACCESS_KEY"];
    if (!expected || !data.key || !matches(data.key, expected)) return { ok: false as const };
    const s = await useSession<AdminSession>(cfg());
    await s.update({ admin: true });
    return { ok: true as const };
  });

export const isAdmin = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env["ADMIN_SESSION_SECRET"]) return { admin: false };
  const s = await useSession<AdminSession>(cfg());
  return { admin: !!s.data.admin };
});
