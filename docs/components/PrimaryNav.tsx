"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";

export function PrimaryNav({ className, label }: { className?: string; label: string }) {
  const path = usePathname() ?? "/";

  return (
    <nav className={className} aria-label={label}>
      {NAV.map((item) => {
        const on = path === item.href || path.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
