"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, Globe, Sparkles, X, ExternalLink, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import InviteModal from "@/components/ui/InviteModal";
import { createClient } from "@/lib/supabase/client";

type Brand = {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
  category: string | null;
  tags: string | null;
  persona_audience_age: string | null;
  persona_audience_gender: string | null;
  persona_brand_voice: string | null;
  persona_platforms: string | null;
  persona_campaign_goals: string | null;
  persona_budget_range: string | null;
};

type ProposingTarget = { id: string; name: string; avatar: string; niche: string; email?: string };

const gradients = [
  ["#7C5CFF", "#A855F7"],
  ["#6366F1", "#7C5CFF"],
  ["#A855F7", "#EC4899"],
  ["#7C3AED", "#6366F1"],
  ["#8B5CF6", "#A855F7"],
  ["#9333EA", "#7C5CFF"],
];

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatWebsite(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export default function FindBrandsPage() {
  const INITIAL_COUNT = 12;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<{ brand: Brand; idx: number } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [proposing, setProposing] = useState<ProposingTarget | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        // Fetch brands and check auth in parallel
        const [brandsRes, userRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, email, bio, website, category, tags, persona_audience_age, persona_audience_gender, persona_brand_voice, persona_platforms, persona_campaign_goals, persona_budget_range")
            .eq("role", "brand")
            .order("full_name", { ascending: true }),
          supabase.auth.getUser(),
        ]);

        if (brandsRes.error) console.error("find-brands:", brandsRes.error.message);
        setBrands(brandsRes.data ?? []);

        if (userRes.data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userRes.data.user.id)
            .single();
          setUserRole(profile?.role ?? null);
        }
      } catch (err) {
        console.error("find-brands fetch failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { setShowAll(false); }, [search]);

  const handlePropose = useCallback((brand: Brand) => {
    if (userRole === "creator") {
      setSelected(null);
      setProposing({
        id: brand.id,
        name: brand.full_name ?? "Brand",
        avatar: initials(brand.full_name),
        niche: brand.category ?? "Brand",
        email: brand.email ?? undefined,
      });
    } else {
      window.location.href = `/signup?role=creator&brand_id=${brand.id}&brand_name=${encodeURIComponent(brand.full_name ?? "Brand")}`;
    }
  }, [userRole]);

  const filtered = brands.filter((b) => {
    const name = b.full_name?.toLowerCase() ?? "";
    const cat = b.category?.toLowerCase() ?? "";
    const bio = b.bio?.toLowerCase() ?? "";
    return !search || name.includes(search.toLowerCase()) || cat.includes(search.toLowerCase()) || bio.includes(search.toLowerCase());
  });
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/25 mb-6">
              <Briefcase size={12} /> Active Brands
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Find Brands <span className="gradient-text">Looking for Creators</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg mb-8 max-w-2xl mx-auto">
              Browse brands across every industry. Sign up as a creator to propose a collaboration or wait to get invited.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="space-y-2">
            <div className="relative max-w-xl mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search by brand name, industry, or bio…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass rounded-2xl pl-12 pr-10 py-4 text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors text-xs cursor-pointer">
                  ✕
                </button>
              )}
            </div>
            {search && (
              <p className="text-xs text-[#A1A1AA] text-center">
                Showing results for <span className="text-white font-medium">&quot;{search}&quot;</span>
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Brand Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={36} className="text-[#A1A1AA] mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">
                {search ? "No brands match your search" : "No brands yet"}
              </p>
              <p className="text-[#A1A1AA] text-sm">
                {search ? "Try a different search term." : "Brands will appear here once they sign up on CollabX."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#A1A1AA] text-sm mb-6 text-center">
                {filtered.length} brand{filtered.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((brand, i) => {
                  const [c1, c2] = gradients[i % gradients.length];
                  return (
                    <motion.div key={brand.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="glass rounded-2xl p-5 border border-white/8 hover:border-[#A855F7]/30 transition-all flex flex-col gap-4">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                            {initials(brand.full_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{brand.full_name ?? "Brand"}</p>
                            <p className="text-xs text-[#A1A1AA]">{brand.category ?? "—"}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
                            style={{ background: `${c1}20`, color: c2, border: `1px solid ${c1}40` }}>
                            <Sparkles size={9} /> Brand
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                          {brand.bio ?? "No company description added yet."}
                        </p>

                        {/* Website */}
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <Globe size={12} className="text-[#A1A1AA] flex-shrink-0" />
                          {brand.website ? (
                            <a href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-[#A855F7] hover:text-white transition-colors flex items-center gap-1 truncate"
                              onClick={(e) => e.stopPropagation()}>
                              {formatWebsite(brand.website)}
                              <ExternalLink size={9} className="flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-white/25">No website added</span>
                          )}
                        </div>

                        {/* Persona chips */}
                        {(brand.persona_budget_range || brand.persona_campaign_goals || brand.persona_platforms) && (
                          <div className="flex flex-wrap gap-1">
                            {brand.persona_budget_range && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {brand.persona_budget_range}
                              </span>
                            )}
                            {brand.persona_campaign_goals && brand.persona_campaign_goals.split(",").slice(0, 1).map(g => (
                              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A1A1AA] border border-white/8">{g.trim()}</span>
                            ))}
                            {brand.persona_platforms && brand.persona_platforms.split(",").slice(0, 2).map(p => (
                              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#A855F7] border border-[#7C5CFF]/20">{p.trim()}</span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={() => setSelected({ brand, idx: i })}
                            className="flex-1 py-2 rounded-xl border border-white/15 text-white text-xs font-semibold hover:border-white/30 transition-all cursor-pointer">
                            View Profile
                          </button>
                          <button
                            onClick={() => handlePropose(brand)}
                            className="flex-1 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                            <Briefcase size={11} /> Propose
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filtered.length > INITIAL_COUNT && (
                <div className="mt-10 flex justify-center">
                  <button onClick={() => setShowAll((v) => !v)}
                    className="px-8 py-3 rounded-full border border-[#7C5CFF]/50 text-white text-sm font-semibold bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 transition-all cursor-pointer">
                    {showAll ? "Show Less" : `Show More (${filtered.length - INITIAL_COUNT} more)`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Sign up CTA — only for guests */}
          {!loading && !userRole && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-16 text-center glass rounded-3xl p-10 border border-[#A855F7]/20">
              <h2 className="text-2xl font-extrabold text-white mb-2">Ready to partner with brands?</h2>
              <p className="text-[#A1A1AA] text-sm mb-6">Sign up as a creator to send proposals, accept brand invites, and manage your collabs.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/signup?role=creator"><Button variant="primary" size="lg">Join as Creator</Button></Link>
                <Link href="/for-creators"><Button variant="secondary" size="lg">Learn More</Button></Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Profile modal */}
      <AnimatePresence>
        {selected && (() => {
          const [c1, c2] = gradients[selected.idx % gradients.length];
          const b = selected.brand;
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
                  style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}>

                  {/* Header */}
                  <div className="relative px-6 pt-8 pb-8 text-center"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <button onClick={() => setSelected(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                      <X size={16} />
                    </button>
                    <div className="w-20 h-20 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                      {initials(b.full_name)}
                    </div>
                    <h3 className="text-xl font-extrabold text-white">{b.full_name ?? "Brand"}</h3>
                    {b.category && (
                      <span className="mt-2 inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{b.category}</span>
                    )}
                    {b.website && (
                      <div className="mt-2">
                        <a href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-white/80 text-xs hover:text-white transition-colors">
                          <Globe size={11} /> {formatWebsite(b.website)} <ExternalLink size={9} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6 pt-5 space-y-4">
                    {/* About */}
                    <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">About</p>
                      <p className="text-white text-sm leading-relaxed">
                        {b.bio ?? "This brand hasn't added a description yet."}
                      </p>
                    </div>

                    {/* Tags */}
                    {b.tags && (
                      <div className="flex flex-wrap gap-1.5">
                        {b.tags.split(",").map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/20">
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Brand Persona */}
                    {(b.persona_audience_age || b.persona_platforms || b.persona_brand_voice || b.persona_campaign_goals || b.persona_budget_range) && (
                      <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-3">Brand Persona</p>
                        <div className="space-y-2">
                          {b.persona_audience_age && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Audience</span>
                              {[b.persona_audience_age, b.persona_audience_gender].filter(Boolean).map(v => (
                                <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{v}</span>
                              ))}
                            </div>
                          )}
                          {b.persona_brand_voice && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Voice</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{b.persona_brand_voice}</span>
                            </div>
                          )}
                          {b.persona_platforms && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Platforms</span>
                              {b.persona_platforms.split(",").map(p => (
                                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{p.trim()}</span>
                              ))}
                            </div>
                          )}
                          {b.persona_campaign_goals && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Goals</span>
                              {b.persona_campaign_goals.split(",").map(g => (
                                <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{g.trim()}</span>
                              ))}
                            </div>
                          )}
                          {b.persona_budget_range && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Budget</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{b.persona_budget_range}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <button onClick={() => handlePropose(b)} className="w-full">
                      <Button variant="primary" size="md" fullWidth>
                        {userRole === "creator" ? (
                          <><Briefcase size={14} /> Propose to {b.full_name ?? "Brand"}</>
                        ) : (
                          <>Sign Up to Propose <ArrowRight size={14} /></>
                        )}
                      </Button>
                    </button>
                    {!userRole && (
                      <p className="text-center text-xs text-[#A1A1AA]">Free to join · No credit card required</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Propose modal (for logged-in creators) */}
      <InviteModal
        creator={proposing}
        onClose={() => setProposing(null)}
        mode="creator-to-brand"
        brandEmail={proposing?.email}
      />
    </div>
  );
}
