"use client";
import { useState } from "react";
export function Newsletter({ privacy }: { privacy: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="newsletter section">
      <p className="eyebrow">A little cozy in your inbox</p>
      <h2>Make yourself at home.</h2>
      <p>Sign up for new ideas from quietnook.</p>
      <form
        className="stack-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const form = new FormData(e.currentTarget);
            const r = await fetch("/api/newsletter/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.get("email"),
                consent: form.get("consent") === "on",
                website: form.get("website"),
              }),
            });
            const data = await r.json();
            setMessage(data.message);
          } catch {
            setMessage("Your signup could not be confirmed. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={250}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "row",
            fontWeight: 400,
            alignItems: "start",
          }}
        >
          <input
            style={{ width: 20, marginTop: 5 }}
            type="checkbox"
            required
            name="consent"
          />
          {privacy}
        </label>
        <div className="honeypot" aria-hidden="true">
          <input name="website" aria-label="Website" tabIndex={-1} />
        </div>
        <button className="button" disabled={busy}>
          {busy ? "Submitting…" : "Subscribe"}
        </button>
        <p>
          Read our <a href="/privacy/">privacy policy</a>. Confirm your email to
          complete signup.
        </p>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
