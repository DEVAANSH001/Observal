"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/", label: "Overview", icon: "📊" },
  { href: "/mcps", label: "MCP Servers", icon: "🔧" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/admin/reviews", label: "Reviews", icon: "📋", admin: true },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", admin: true },
  { href: "/admin/users", label: "Users", icon: "👥", admin: true },
];

export function Sidebar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) return null;

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold">Observal</h1>
        <p className="text-xs text-gray-500">{user.name}</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {nav.filter(n => !n.admin || user.role === "admin").map(n => (
          <Link key={n.href} href={n.href}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${(n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
            <span>{n.icon}</span>{n.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
      </div>
    </aside>
  );
}
