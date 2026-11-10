"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export function CompleteInvitation() {
  const started = useRef(false);
  const [message, setMessage] = useState("Verifying your invitation…");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const access_token = fragment.get("access_token");
    const refresh_token = fragment.get("refresh_token");
    // Remove credentials from browser history before making any request.
    window.history.replaceState(null, "", "/auth/complete/");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key || !access_token || !refresh_token) {
      setMessage("This sign-in link is missing or expired. Request a fresh link from the sign-in page.");
      return;
    }
    const db = createBrowserClient(url, key);
    void db.auth.setSession({ access_token, refresh_token }).then(async ({error}) => {
      if (error) throw error;
      const { data, error: userError } = await db.auth.getUser();
      if (userError || !data.user) throw Error("Invalid session");
      window.location.replace("/admin/password/");
    }).catch(() => setMessage("This sign-in link could not be verified. Request a fresh link from the sign-in page."));
  }, []);
  return <><p role="status">{message}</p><Link className="text-link" href="/admin/login/">Return to sign in</Link></>;
}
