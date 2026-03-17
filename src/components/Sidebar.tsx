"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Phone,
  MessageSquareHeart,
  Settings,
  ChefHat,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/calls", label: "Call Logs", icon: Phone },
  { href: "/feedback", label: "Feedback", icon: MessageSquareHeart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ChefHat className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">VoiceTable</h1>
          <p className="text-xs text-muted-foreground">AI Restaurant Ops</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://bolna.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Bolna Voice AI
          </a>
        </p>
      </div>
    </aside>
  );
}
