"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export async function post(action: string, data: unknown) {
  const r = await fetch(`/api/admin/${action}/`, {
    method: "POST",
    headers:
      data instanceof FormData
        ? undefined
        : { "Content-Type": "application/json" },
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
  const result = await r.json();
  if (!r.ok) throw Error(result.message || "Request failed");
  return result;
}
export function AuthForm({ mode }: { mode: "login" | "recover" | "password" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const data = await post(
            mode,
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          setMessage(data.message || "");
          if (data.redirect) {
            router.push(data.redirect);
            router.refresh();
          }
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {mode !== "password" && (
        <label>
          Email address
          <input type="email" name="email" autoComplete="email" required />
        </label>
      )}
      {mode !== "recover" && (
        <label>
          {mode === "password" ? "New password" : "Password"}
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "password" ? "new-password" : "current-password"
            }
            minLength={mode === "password" ? 12 : 1}
            maxLength={200}
            required
          />
        </label>
      )}
      <button className="button" disabled={busy}>
        {busy
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : mode === "recover"
              ? "Send recovery email"
              : "Update password"}
      </button>
      <p role="status" className="form-message">
        {message}
      </p>
    </form>
  );
}
export function Logout() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await post("logout", {});
        router.push("/admin/login/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
export function RecordForm({
  action,
  children,
  transform,
  submit = "Save",
}: {
  action: string;
  children: React.ReactNode;
  transform?: (data: Record<string, FormDataEntryValue>) => unknown;
  submit?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const values = Object.fromEntries(new FormData(e.currentTarget));
          const result = await post(
            action,
            transform ? transform(values) : values,
          );
          setMessage(result.message);
          router.refresh();
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : submit}
      </button>
      <p role="status" className="form-message">
        {message}
      </p>
    </form>
  );
}
