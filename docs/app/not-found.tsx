import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section">
      <h1>Page not found</h1>
      <p className="lede">That URL is not on this site.</p>
      <p>
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/docs">Docs</Link>
        {" · "}
        <Link href="/examples">Examples</Link>
      </p>
    </div>
  );
}
