import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { unlockAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin-access")({
  head: () => ({
    meta: [
      { title: "Admin access — Youpi Tennis Club" },
      { name: "description", content: "Private admin access." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin access — Youpi Tennis Club" },
      { property: "og:description", content: "Private admin access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAccess,
});

function AdminAccess() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Checking…");
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("key") ?? "";
    unlockAdmin({ data: { key } }).then((r) => {
      if (r.ok) navigate({ to: "/book", replace: true });
      else setMsg("Invalid link.");
    });
  }, [navigate]);
  return <main className="p-10 text-center">{msg}</main>;
}
