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

async function assertAdmin() {
  if (!process.env["ADMIN_SESSION_SECRET"]) throw new Error("Forbidden");
  const s = await useSession<AdminSession>(cfg());
  if (!s.data.admin) throw new Error("Forbidden");
}

/** Admin: every student account with its credit balance. */
export const adminListStudents = createServerFn({ method: "POST" }).handler(async () => {
  await assertAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(error.message);
  const { data: credits } = await supabaseAdmin.from("student_credits").select("user_id, balance_cents");
  const bal = new Map((credits ?? []).map((c) => [c.user_id, c.balance_cents]));
  return users.users
    .map((u) => {
      const m = (u.user_metadata ?? {}) as Record<string, unknown>;
      return {
        id: u.id,
        email: u.email ?? "",
        name: `${String(m["first_name"] ?? "")} ${String(m["last_name"] ?? "")}`.trim(),
        balance_cents: bal.get(u.id) ?? 0,
      };
    })
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
});

/** Admin: add (or remove, if negative) credits on a student account. */
export const adminAdjustCredits = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; amountCents: number; note?: string }) => {
    const userId = String(d?.userId ?? "");
    const amountCents = Math.trunc(Number(d?.amountCents));
    if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Invalid student");
    if (!Number.isFinite(amountCents) || amountCents === 0 || Math.abs(amountCents) > 100000) throw new Error("Invalid amount");
    return { userId, amountCents, note: String(d?.note ?? "").slice(0, 200) };
  })
  .handler(async ({ data }) => {
    await assertAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reason = data.note || (data.amountCents > 0 ? "Credit added by coach" : "Adjustment by coach");
    const { data: balance, error } = await supabaseAdmin.rpc("apply_credit", {
      _user_id: data.userId,
      _amount_cents: data.amountCents,
      _reason: reason,
    });
    if (error) throw new Error(error.message);
    return { balance_cents: balance as number };
  });
