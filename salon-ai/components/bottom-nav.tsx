"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: "🏠", label: "ホーム", badge: 0 },
  { href: "/dashboard/reservations", icon: "📅", label: "予約", badge: 2 },
  { href: "/dashboard/sns", icon: "📸", label: "SNS", badge: 2 },
  { href: "/dashboard/karte", icon: "📋", label: "カルテ", badge: 0 },
  { href: "/dashboard/reports", icon: "📊", label: "レポート", badge: 0 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 flex border-t border-line bg-white pb-2">
      {items.map((it) => {
        const active =
          it.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className="relative flex flex-1 flex-col items-center px-1 pb-1 pt-2.5"
          >
            <span className="mb-0.5 text-[22px] leading-none">{it.icon}</span>
            <span
              className={
                active
                  ? "text-[10px] font-bold text-gold"
                  : "text-[10px] text-muted"
              }
            >
              {it.label}
            </span>
            {it.badge > 0 && (
              <span className="absolute right-[calc(50%-20px)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-lg bg-danger px-1 text-[9px] font-bold text-white">
                {it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
