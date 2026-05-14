import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? {
        email: user.email ?? "",
        role: user.user_metadata?.role as string | undefined,
      }
    : null;

  return (
    <>
      <Navbar user={profile} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-[#A1A1AA] text-sm">
          © 2025 CollabX. Built for the creator economy.
        </p>
      </footer>
    </>
  );
}
