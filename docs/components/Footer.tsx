import Link from "next/link";
import { FOOTER, type FooterLink } from "@/lib/footer";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>ChartKit</strong>
        <p>One JSON spec. SVG out. Any framework.</p>
      </div>
      <div className="footer-columns">
        {FOOTER.map((column) => (
          <nav key={column.title} aria-label={column.title} className={column.title === "For agents" ? "footer-col footer-agents" : "footer-col"}>
            <details open>
              <summary>
                <h2>{column.title}</h2>
              </summary>
              {column.note ? <p className="footer-note">{column.note}</p> : null}
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                    <span className="footer-hint">{link.hint}</span>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
        ))}
      </div>
      <p className="legal">© 2026 ChartKit. MIT license.</p>
    </footer>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external || /\.(txt|json|md)$/.test(link.href)) {
    return <a href={link.href}>{link.label}</a>;
  }
  return <Link href={link.href}>{link.label}</Link>;
}
