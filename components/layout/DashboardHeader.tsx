"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Zap, LayoutDashboard, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  title: string;
  role?: string;
  userEmail?: string;
  onLogout: () => void;
}

const brandNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Collaborations", href: "/collaborations", icon: FileText },
];

const creatorNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Collaborations", href: "/collaborations", icon: FileText },
];

export default function DashboardHeader({ title, role, userEmail, onLogout }: DashboardHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = role === "brand" ? brandNav : creatorNav;

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-bold text-white hidden lg:block">{title}</h1>

        <div className="flex items-center gap-2 ml-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-xs font-bold text-white">
            {userEmail?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 glass border-r border-white/10 p-4 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="font-bold text-lg">Collab<span className="gradient-text">X</span></span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-[#A1A1AA] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/30" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"}`}>
                        <item.icon size={17} className={active ? "text-[#A855F7]" : ""} />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-[#A1A1AA] px-3 mb-2 truncate">{userEmail}</p>
                <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5 w-full transition-colors">
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
