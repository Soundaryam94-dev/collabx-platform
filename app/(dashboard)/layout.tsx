"use client";

import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface UserProfile {
  email: string;
  role?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser({
        email: user.email ?? "",
        role: user.user_metadata?.role as string,
      });
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/campaigns": "Campaigns",
    "/creators": "Find Creators",
    "/collaborations": "Collaborations",
    "/brands": "Find Brands",
    "/messages": "Messages",
    "/settings": "Settings",
  };
  const pageTitle = pageTitles[pathname] ?? pageTitles[Object.keys(pageTitles).find(k => k !== "/dashboard" && pathname.startsWith(k)) ?? ""] ?? "Dashboard";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user?.role} userEmail={user?.email} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title={pageTitle}
          role={user?.role}
          userEmail={user?.email}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
