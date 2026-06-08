"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageSquare,
  Settings,
  Zap,
  FileText,
  LogOut,
} from "lucide-react";

const brandNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Find Creators", href: "/creators", icon: Users },
  { label: "Collaborations", href: "/collaborations", icon: FileText },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

const creatorNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Collaborations", href: "/collaborations", icon: FileText },
  { label: "Find Brands", href: "/brands", icon: Megaphone },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  role?: string;
  userEmail?: string;
  onLogout: () => void;
}

export default function Sidebar({ role, userEmail, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "brand" ? brandNav : creatorNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 overflow-y-auto glass border-r border-white/10 p-4 flex-shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-2 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center glow-sm">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg">
          Collab<span className="gradient-text">X</span>
        </span>
      </Link>

      {/* Role badge */}
      <div className="px-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#7C5CFF]/20 text-[#A855F7] border border-[#7C5CFF]/30 capitalize">
          {role || "creator"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/30"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={17} className={active ? "text-[#A855F7]" : ""} />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-[#A1A1AA] truncate">{userEmail}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5 w-full transition-colors cursor-pointer"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
