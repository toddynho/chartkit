'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { navigation, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.items && item.items.length > 0;
  const isParentActive = hasChildren && item.items?.some((child) => pathname === child.href);
  const [isOpen, setIsOpen] = useState(isParentActive || isActive);

  return (
    <div>
      <div className="flex items-center">
        <Link
          href={item.href}
          className={cn(
            'flex-1 py-1.5 text-sm transition-colors flex items-center gap-2',
            depth === 0 ? 'font-medium' : 'pl-4',
            isActive
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.title}
          {item.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
              {item.badge}
            </span>
          )}
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-muted rounded"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1 ml-2 border-l border-border pl-2">
          {item.items?.map((child) => (
            <NavLink key={child.href} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn('pb-12', className)}>
      <div className="space-y-1">
        {navigation.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    </aside>
  );
}
