import Link from "next/link";
import { Breadcrumbs } from "./public";

// Plain text only: blank lines separate paragraphs; ## introduces a section.
// Policy settings never execute HTML or arbitrary Markdown links.
export function PolicyPage({ title, text, contact }: { title: string; text: string; contact: string }) {
  return (
    <div className="reading info-page">
      <Breadcrumbs items={[{ label: title }]} />
      <h1>{title}</h1>
      <div className="policy-copy">
        {text.trim().split(/\n\s*\n/).map((block, i) => {
          const lines = block.trim().split("\n");
          return <section key={i}>
            {lines[0].startsWith("## ") ? <><h2>{lines[0].slice(3)}</h2>{lines.length > 1 && <p>{lines.slice(1).join("\n")}</p>}</> : <p>{block}</p>}
          </section>;
        })}
      </div>
      <nav aria-label="Related policies" className="pill-links">
        <Link href="/privacy/">Privacy Policy</Link>
        <Link href="/terms/">Terms of Use</Link>
        <Link href="/affiliate-disclosure/">Affiliate Disclosure</Link>
      </nav>
      <p>Questions? <Link href="/contact/">Contact quietnook</Link>{contact && <> at <a href={`mailto:${contact}`}>{contact}</a></>}.</p>
    </div>
  );
}
