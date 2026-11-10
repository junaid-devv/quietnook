"use client";
import { useState } from "react";
export function ContactForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const response = await fetch("/api/contact/", {
            method: "POST",
            body: JSON.stringify(
              Object.fromEntries(new FormData(e.currentTarget)),
            ),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          setMessage(data.message);
        } catch {
          setMessage("Delivery could not be confirmed. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Your name
        <input name="name" required maxLength={100} />
      </label>
      <label>
        Email address
        <input name="email" type="email" required maxLength={250} />
      </label>
      <label>
        Your message
        <textarea name="message" required maxLength={5000} rows={6} />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p>
        See our <a href="/privacy/">privacy policy</a> for how messages are
        handled.
      </p>
      <button disabled={busy} className="button">
        {busy ? "Sending…" : "Send message"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
