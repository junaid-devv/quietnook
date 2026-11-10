"use client";

import { useRef } from "react";

export function ArticleIndex({ items }: { items: { id: string; text: string }[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (items.length < 3) return null;
  function navigate(id: string) {
    dialog.current?.close();
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      history.replaceState(null, "", `#${id}`);
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
    });
  }
  return (
    <>
      <button className="article-index-button" type="button" aria-haspopup="dialog" aria-controls="article-index" onClick={() => dialog.current?.showModal()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" />
        </svg>
        Index
      </button>
      <dialog id="article-index" className="article-index-dialog" ref={dialog} aria-labelledby="article-index-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
        <div className="article-index-header">
          <div><h2 id="article-index-title">In this guide</h2><p>Jump to an idea</p></div>
          <button type="button" aria-label="Close index" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <nav aria-label="Article index" className="article-index-links">
          {items.map(item => <a key={item.id} href={`#${item.id}`} onClick={e => { e.preventDefault(); navigate(item.id); }}>{item.text}</a>)}
        </nav>
      </dialog>
    </>
  );
}
