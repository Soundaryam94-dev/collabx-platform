"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";

type Creator = {
  id: string;
  full_name: string | null;
  bio: string | null;
  category: string | null;
  followers: number | null;
  engagement_rate: number | null;
  rating: number | null;
  tags: string | null;
};

const NICHES = ["All", "Fashion", "Tech", "Food", "Travel", "Fitness", "Beauty", "Gaming", "Finance", "Music", "Lifestyle", "Education", "Comedy", "Sports", "Photography", "Parenting", "Pets", "Automotive", "Health", "Art", "Business"];

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatFollowers(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function FindCreatorsPage() {
  const INITIAL_COUNT = 12;
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name, bio, category, followers, engagement_rate, rating, tags")
      .eq("role", "creator")
      .order("followers", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("find-creators:", error.message);
        setCreators(data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("find-creators fetch failed:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => { setShowAll(false); }, [search, activeNiche]);

  const filtered = creators.filter((c) => {
    const name = c.full_name?.toLowerCase() ?? "";
    const cat = c.category?.toLowerCase() ?? "";
    const bio = c.bio?.toLowerCase() ?? "";
    const matchesSearch = !search || name.includes(search.toLowerCase()) || cat.includes(search.toLowerCase()) || bio.includes(search.toLowerCase());
    const matchesNiche = activeNiche === "All" || c.category === activeNiche;
    return matchesSearch && matchesNiche;
  });
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#7C5CFF]/15 text-[#A855F7] border border-[#7C5CFF]/25 mb-6">
              <Users size={12} /> Verified Creators
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Find the Perfect <span className="gradient-text">Creator</span> for Your Brand
            </h1>
            <p className="text-[#A1A1AA] text-lg mb-8 max-w-2xl mx-auto">
              Browse verified creators across every niche. Filter by audience size, engagement rate, and platform.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative max-w-xl mx-auto mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search by name, niche, or bio…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass rounded-2xl pl-12 pr-4 py-4 text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors text-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Filter size={14} className="text-[#A1A1AA]" />
            {NICHES.map((niche) => (
              <button key={niche} onClick={() => setActiveNiche(niche)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeNiche === niche
                    ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                    : "border-white/10 text-[#A1A1AA] hover:border-white/20 hover:text-white"
                }`}>
                {niche}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <p className="text-[#A1A1AA] text-sm mb-6 text-center">{filtered.length} creator{filtered.length !== 1 ? "s" : ""} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {visible.map((creator, i) => (
                  <motion.div key={creator.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="glass rounded-2xl p-5 border border-white/8 hover:border-[#7C5CFF]/30 transition-all group flex flex-col gap-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {initials(creator.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{creator.full_name ?? "Creator"}</p>
                          <p className="text-xs text-[#A1A1AA]">{creator.category ?? "—"}</p>
                        </div>
                        {creator.rating ? (
                          <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                            <Star size={11} fill="currentColor" />
                            <span className="text-xs font-semibold text-white">{creator.rating}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[#A855F7] mb-0.5">
                            <Users size={11} />
                          </div>
                          <p className="text-white text-sm font-bold">{formatFollowers(creator.followers)}</p>
                          <p className="text-[#A1A1AA] text-xs">Followers</p>
                        </div>
                        <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                            <TrendingUp size={11} />
                          </div>
                          <p className="text-white text-sm font-bold">{creator.engagement_rate ? `${creator.engagement_rate}%` : "—"}</p>
                          <p className="text-[#A1A1AA] text-xs">Engagement</p>
                        </div>
                      </div>

                      {/* Tags */}
                      {creator.tags && (
                        <div className="flex flex-wrap gap-1">
                          {creator.tags.split(",").slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#A855F7] border border-[#7C5CFF]/20">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <Link href="/signup">
                        <Button variant="primary" size="sm" fullWidth className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Invite Creator <ArrowRight size={12} />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filtered.length > INITIAL_COUNT && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="px-8 py-3 rounded-full border border-[#7C5CFF]/50 text-white text-sm font-semibold bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 transition-all"
                  >
                    {showAll ? "Show Less" : `Show More`}
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-[#A1A1AA] text-sm">
              No creators found for &quot;{search || activeNiche}&quot;. Try a different filter.
            </div>
          )}

          {/* Sign up CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center glass rounded-3xl p-10 border border-[#7C5CFF]/20">
            <h2 className="text-2xl font-extrabold text-white mb-2">Ready to collaborate?</h2>
            <p className="text-[#A1A1AA] text-sm mb-6">Sign up as a brand to invite creators, manage campaigns, and track performance.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup">
                <Button variant="primary" size="lg">Get Started Free</Button>
              </Link>
              <Link href="/for-brands">
                <Button variant="secondary" size="lg">Learn More</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
