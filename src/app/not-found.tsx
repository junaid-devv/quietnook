import Link from "next/link";
export default function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">A little off the beaten path</p>
      <h1>This corner isn’t here.</h1>
      <p>The page may have moved, or the link may be a little out of season.</p>
      <Link href="/" className="button">
        Make your way home →
      </Link>
      <Link href="/search/" className="text-link">
        Search for something cozy
      </Link>
    </div>
  );
}
