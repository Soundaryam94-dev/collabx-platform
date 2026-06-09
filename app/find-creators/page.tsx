"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, Users, TrendingUp, ArrowRight, X, Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import InviteModal from "@/components/ui/InviteModal";
import { createClient } from "@/lib/supabase/client";
import { CollabXMatcher, GOAL_WEIGHTS, matchLabel } from "@/lib/matcher";

type Creator = {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  category: string | null;
  followers: number | null;
  engagement_rate: number | null;
  rating: number | null;
  tags: string | null;
  persona_audience_age: string | null;
  persona_audience_gender: string | null;
  persona_platforms: string | null;
  persona_content_formats: string | null;
  persona_collab_rate: string | null;
  persona_languages: string | null;
};

type InvitingTarget = { id: string; name: string; avatar: string; niche: string; email?: string };

type MatchResult = Creator & {
  match_score: number;
  breakdown: { category: number; followers: number; engagement: number; rating: number; tags: number };
};

const NICHES = ["Fashion", "Tech", "Food", "Travel", "Fitness", "Beauty", "Gaming", "Finance", "Music", "Lifestyle", "Education", "Comedy", "Sports", "Photography", "Parenting", "Pets", "Automotive", "Health", "Art", "Business"];
const ALL_TAGS = ["sustainability", "luxury", "budget", "reviews", "tutorials", "vlogs", "unboxing", "fitness", "cooking", "photography", "music", "art", "travel", "tech", "fashion"];
const AUDIENCE_OPTIONS = [
  { label: "Any size", value: 0 },
  { label: "10K+", value: 10_000 },
  { label: "100K+", value: 100_000 },
  { label: "500K+", value: 500_000 },
  { label: "1M+", value: 1_000_000 },
];
const ENGAGEMENT_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4%+", value: 4 },
  { label: "7%+", value: 7 },
  { label: "10%+", value: 10 },
];
const FOLLOWER_SIZES = AUDIENCE_OPTIONS;

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

function MatchBadge({ score }: { score: number }) {
  const { label, color, bg } = matchLabel(score);
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color, background: bg }}>
      {score}% · {label}
    </span>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#A1A1AA] w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#A855F7]" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-white w-8 text-right">{value}</span>
    </div>
  );
}

export default function FindCreatorsPage() {
  const INITIAL_COUNT = 12;
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"browse" | "ai">("browse");
  const [selected, setSelected] = useState<Creator | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [inviting, setInviting] = useState<InvitingTarget | null>(null);

  // Browse state
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState("All");
  const [followerFilter, setFollowerFilter] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // AI Match state
  const [niches, setNiches] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minEngagement, setMinEngagement] = useState(0);
  const [goal, setGoal] = useState(Object.keys(GOAL_WEIGHTS)[3]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const [creatorsRes, userRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, email, bio, category, followers, engagement_rate, rating, tags, persona_audience_age, persona_audience_gender, persona_platforms, persona_content_formats, persona_collab_rate, persona_languages")
            .eq("role", "creator")
            .order("followers", { ascending: false }),
          supabase.auth.getUser(),
        ]);
        if (creatorsRes.error) console.error("find-creators:", creatorsRes.error.message);
        setCreators(creatorsRes.data ?? []);

        if (userRes.data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userRes.data.user.id)
            .single();
          setUserRole(profile?.role ?? null);
        }
      } catch (err) {
        console.error("find-creators fetch failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { setShowAll(false); }, [search, activeNiche, followerFilter]);

  const handleInvite = useCallback((creator: Creator) => {
    if (userRole === "brand") {
      setSelected(null);
      setInviting({
        id: creator.id,
        name: creator.full_name ?? "Creator",
        avatar: initials(creator.full_name),
        niche: creator.category ?? "Creator",
        email: creator.email ?? undefined,
      });
    } else {
      window.location.href = `/signup?role=brand&creator_id=${creator.id}&creator_name=${encodeURIComponent(creator.full_name ?? "Creator")}`;
    }
  }, [userRole]);

  const filtered = creators.filter((c) => {
    const name = c.full_name?.toLowerCase() ?? "";
    const cat = c.category?.toLowerCase() ?? "";
    const bio = c.bio?.toLowerCase() ?? "";
    const matchesSearch = !search || name.includes(search.toLowerCase()) || cat.includes(search.toLowerCase()) || bio.includes(search.toLowerCase());
    const matchesNiche = activeNiche === "All" || c.category === activeNiche;
    const matchesFollowers = followerFilter === 0 || (c.followers ?? 0) >= followerFilter;
    return matchesSearch && matchesNiche && matchesFollowers;
  });
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  const runMatch = () => {
    if (niches.length === 0) { setMatchError("Pick at least one content category."); return; }
    setMatchError("");
    setMatching(true);
    try {
      const creatorData = creators.map((c) => ({
        id: c.id,
        full_name: c.full_name,
        email: "",
        bio: c.bio,
        avatar_url: null,
        category: c.category,
        followers: c.followers ?? 0,
        engagement_rate: c.engagement_rate ?? 0,
        rating: c.rating ?? 0,
        tags: c.tags ?? "",
      }));
      const matcher = new CollabXMatcher(creatorData);
      const weights = GOAL_WEIGHTS[goal] ?? GOAL_WEIGHTS["Balanced — All factors matter equally"];
      const brand = { target_niches: niches, tags, min_followers: minFollowers, min_engagement: minEngagement };
      const scored = matcher.match(brand, weights, 10);
      const creatorMap = new Map(creators.map((c) => [c.id, c]));
      const results: MatchResult[] = scored.map((s) => ({
        ...(creatorMap.get(s.id) as Creator),
        match_score: s.match_score,
        breakdown: s.breakdown,
      }));
      setMatchResults(results);
    } catch (err) {
      console.error("match error:", err);
      setMatchError("Matching failed. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#7C5CFF]/15 text-[#A855F7] border border-[#7C5CFF]/25 mb-6">
              <Users size={12} /> Verified Creators
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Find the Perfect <span className="gradient-text">Creator</span> for Your Brand
            </h1>
            <p className="text-[#A1A1AA] text-lg mb-8 max-w-2xl mx-auto">
              Browse verified creators across every niche — or use AI Match to get ranked recommendations based on your collaboration goals.
            </p>
          </motion.div>

          {/* Mode toggle */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex justify-center gap-2 mb-6">
            <button onClick={() => setMode("browse")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                mode === "browse" ? "bg-[#7C5CFF] border-[#7C5CFF] text-white" : "border-white/20 text-[#A1A1AA] hover:border-white/30 hover:text-white"
              }`}>
              <Users size={14} /> Browse All
            </button>
            <button onClick={() => setMode("ai")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                mode === "ai" ? "bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] border-[#7C5CFF] text-white" : "border-[#7C5CFF]/40 text-[#A855F7] hover:border-[#7C5CFF] hover:bg-[#7C5CFF]/10"
              }`}>
              <Zap size={14} /> AI Match
            </button>
          </motion.div>

          {/* Search bar (browse only) */}
          {mode === "browse" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="relative max-w-xl mx-auto">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                <input type="text" placeholder="Search by creator name, niche, or bio…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass rounded-2xl pl-12 pr-10 py-4 text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors text-sm" />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors text-xs">
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
          )}
        </div>
      </section>

      {/* ── AI MATCH MODE ── */}
      {mode === "ai" && (
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="glass rounded-2xl p-6 border border-[#7C5CFF]/20">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <Sparkles size={16} className="text-[#A855F7]" /> Tell us what you're looking for
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-[#A1A1AA] mb-2">Content categories needed</p>
                    <div className="flex flex-wrap gap-2">
                      {NICHES.map((cat) => (
                        <button key={cat}
                          onClick={() => setNiches((prev) => prev.includes(cat) ? prev.filter((n) => n !== cat) : [...prev, cat])}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            niches.includes(cat)
                              ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                              : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                          }`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#A1A1AA] mb-2">Collaboration tags</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TAGS.map((tag) => (
                        <button key={tag}
                          onClick={() => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            tags.includes(tag)
                              ? "bg-[#A855F7]/30 border-[#A855F7] text-white"
                              : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                          }`}>
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-[#A1A1AA] mb-2">Minimum audience size</p>
                    <div className="flex gap-2 flex-wrap">
                      {AUDIENCE_OPTIONS.map((o) => (
                        <button key={o.label} onClick={() => setMinFollowers(o.value)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            minFollowers === o.value
                              ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                              : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                          }`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#A1A1AA] mb-2">Minimum engagement rate</p>
                    <div className="flex gap-2 flex-wrap">
                      {ENGAGEMENT_OPTIONS.map((o) => (
                        <button key={o.label} onClick={() => setMinEngagement(o.value)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            minEngagement === o.value
                              ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                              : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                          }`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#A1A1AA] mb-2">Collaboration goal</p>
                    <div className="space-y-1.5">
                      {Object.keys(GOAL_WEIGHTS).map((g) => (
                        <button key={g} onClick={() => setGoal(g)}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                            goal === g
                              ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                              : "border-white/10 text-[#A1A1AA] hover:border-white/20"
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {matchError && <p className="text-red-400 text-sm mt-3">{matchError}</p>}

              <div className="mt-5">
                <button onClick={runMatch} disabled={matching}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer">
                  <Sparkles size={15} /> {matching ? "Finding best matches…" : "Find Best Creators"}
                </button>
              </div>
            </div>

            {/* Match Results */}
            {matchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-white font-bold">Top {matchResults.length} matches for your collaboration</p>
                {matchResults.map((creator, i) => {
                  const isExpanded = expandedId === creator.id;
                  return (
                    <motion.div key={creator.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="glass rounded-2xl p-5 border border-white/10 hover:border-[#7C5CFF]/30 transition-all">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-[#7C5CFF] w-6">#{i + 1}</div>
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white">
                              {initials(creator.full_name)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{creator.full_name ?? "Creator"}</p>
                              <p className="text-xs text-[#A855F7]">{creator.category ?? "Creator"}</p>
                            </div>
                          </div>
                          <MatchBadge score={creator.match_score} />
                        </div>

                        <div className="flex gap-4 mt-3 text-xs text-[#A1A1AA]">
                          <span className="flex items-center gap-1"><Users size={11} /> {formatFollowers(creator.followers)}</span>
                          <span className="flex items-center gap-1"><TrendingUp size={11} /> {creator.engagement_rate ? `${creator.engagement_rate}%` : "—"}</span>
                          <span className="flex items-center gap-1"><Star size={11} /> {creator.rating ? `${creator.rating}/5` : "—"}</span>
                        </div>

                        {creator.bio && <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-2">{creator.bio}</p>}

                        <button onClick={() => setExpandedId(isExpanded ? null : creator.id)}
                          className="flex items-center gap-1 text-xs text-[#7C5CFF] mt-3 hover:text-[#A855F7] transition-colors cursor-pointer">
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {isExpanded ? "Hide breakdown" : "Why this creator?"}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="mt-3 p-3 rounded-xl border-l-2 border-[#7C5CFF] space-y-2" style={{ background: "rgba(124,92,255,0.07)" }}>
                                <p className="text-xs font-semibold text-white mb-2">Score Breakdown</p>
                                <BreakdownBar label="Category" value={creator.breakdown.category} />
                                <BreakdownBar label="Followers" value={creator.breakdown.followers} />
                                <BreakdownBar label="Engagement" value={creator.breakdown.engagement} />
                                <BreakdownBar label="Rating" value={creator.breakdown.rating} />
                                <BreakdownBar label="Tag Match" value={creator.breakdown.tags} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-2 mt-4">
                          <button onClick={() => setSelected(creator)}
                            className="flex-1 py-2 rounded-xl border border-white/15 text-white text-xs font-semibold hover:border-white/30 transition-all cursor-pointer">
                            View Profile
                          </button>
                          <button onClick={() => handleInvite(creator)}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                            {userRole === "brand" ? "Invite" : "Sign Up to Invite"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {matchResults.length === 0 && !matching && (
              <div className="glass rounded-2xl p-10 border border-white/8 text-center">
                <Sparkles size={32} className="text-[#A1A1AA] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Configure your criteria above</p>
                <p className="text-[#A1A1AA] text-sm">Select categories and click &quot;Find Best Creators&quot; to get AI-ranked matches.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── BROWSE MODE ── */}
      {mode === "browse" && (
        <>
          <section className="px-4 pb-6">
            <div className="max-w-6xl mx-auto space-y-3">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Filter size={14} className="text-[#A1A1AA]" />
                {["All", ...NICHES].map((niche) => (
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
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Users size={14} className="text-[#A1A1AA]" />
                {FOLLOWER_SIZES.map((o) => (
                  <button key={o.label} onClick={() => setFollowerFilter(o.value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      followerFilter === o.value
                        ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                        : "border-white/10 text-[#A1A1AA] hover:border-white/20 hover:text-white"
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

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
                        <div onClick={() => setSelected(creator)}
                          className="glass rounded-2xl p-5 border border-white/8 hover:border-[#7C5CFF]/40 transition-all flex flex-col gap-3 cursor-pointer h-full">
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

                          {creator.bio && (
                            <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">{creator.bio}</p>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                              <p className="text-white text-sm font-bold">{formatFollowers(creator.followers)}</p>
                              <p className="text-[#A1A1AA] text-xs flex items-center justify-center gap-1"><Users size={9} /> Followers</p>
                            </div>
                            <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
                              <p className="text-emerald-400 text-sm font-bold">{creator.engagement_rate ? `${creator.engagement_rate}%` : "—"}</p>
                              <p className="text-[#A1A1AA] text-xs flex items-center justify-center gap-1"><TrendingUp size={9} /> Engagement</p>
                            </div>
                          </div>

                          {creator.tags && (
                            <div className="flex flex-wrap gap-1">
                              {creator.tags.split(",").slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#A855F7] border border-[#7C5CFF]/20">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {(creator.persona_audience_age || creator.persona_collab_rate) && (
                            <div className="flex flex-wrap gap-1">
                              {creator.persona_audience_age && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A1A1AA] border border-white/8">
                                  {creator.persona_audience_age}{creator.persona_audience_gender ? ` · ${creator.persona_audience_gender}` : ""}
                                </span>
                              )}
                              {creator.persona_collab_rate && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {creator.persona_collab_rate}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-1 text-xs text-[#7C5CFF] font-medium pt-1 mt-auto">
                            View Profile <ArrowRight size={11} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filtered.length > INITIAL_COUNT && (
                    <div className="mt-10 flex justify-center">
                      <button onClick={() => setShowAll((v) => !v)}
                        className="px-8 py-3 rounded-full border border-[#7C5CFF]/50 text-white text-sm font-semibold bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 transition-all cursor-pointer">
                        {showAll ? "Show Less" : "Show More"}
                      </button>
                    </div>
                  )}

                  {filtered.length === 0 && (
                    <div className="text-center py-16 text-[#A1A1AA] text-sm">
                      No creators found for &quot;{search || activeNiche}&quot;. Try a different filter.
                    </div>
                  )}
                </>
              )}

              {/* Sign up CTA — guests only */}
              {!userRole && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="mt-16 text-center glass rounded-3xl p-10 border border-[#7C5CFF]/20">
                  <h2 className="text-2xl font-extrabold text-white mb-2">Ready to collaborate?</h2>
                  <p className="text-[#A1A1AA] text-sm mb-6">Sign up as a brand to invite creators and manage your collaborations.</p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/signup?role=brand"><Button variant="primary" size="lg">Get Started Free</Button></Link>
                    <Link href="/find-brands"><Button variant="secondary" size="lg">Browse Brands</Button></Link>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Invite modal (logged-in brands) */}
      <InviteModal
        creator={inviting}
        onClose={() => setInviting(null)}
        mode="brand-to-creator"
      />

      {/* Profile modal */}
      <AnimatePresence>
        {selected && (
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

                <div className="relative bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] px-6 pt-8 pb-10 text-center">
                  <button onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                    <X size={16} />
                  </button>
                  <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                    {initials(selected.full_name)}
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{selected.full_name ?? "Creator"}</h3>
                  {selected.category && (
                    <span className="mt-2 inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{selected.category}</span>
                  )}
                  {selected.rating ? (
                    <div className="mt-2 flex items-center justify-center gap-1 text-yellow-300">
                      <Star size={13} fill="currentColor" />
                      <span className="text-sm font-semibold">{selected.rating} / 5</span>
                    </div>
                  ) : null}
                </div>

                <div className="px-6 pb-6 pt-5 space-y-4">
                  <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">Bio</p>
                    <p className="text-white text-sm leading-relaxed">{selected.bio ?? "This creator hasn't added a bio yet."}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-white">{formatFollowers(selected.followers)}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5 flex items-center justify-center gap-1"><Users size={9} /> Followers</p>
                    </div>
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-emerald-400">{selected.engagement_rate ? `${selected.engagement_rate}%` : "—"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Engagement</p>
                    </div>
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-yellow-400">{selected.rating ? `${selected.rating}` : "—"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Rating</p>
                    </div>
                  </div>

                  {selected.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.split(",").map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#A855F7] border border-[#7C5CFF]/20">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {(selected.persona_audience_age || selected.persona_platforms || selected.persona_content_formats || selected.persona_collab_rate || selected.persona_languages) && (
                    <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-3">Creator Persona</p>
                      <div className="space-y-2">
                        {selected.persona_audience_age && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Audience</span>
                            {[selected.persona_audience_age, selected.persona_audience_gender].filter(Boolean).map(v => (
                              <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{v}</span>
                            ))}
                          </div>
                        )}
                        {selected.persona_platforms && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Platforms</span>
                            {selected.persona_platforms.split(",").map(p => (
                              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{p.trim()}</span>
                            ))}
                          </div>
                        )}
                        {selected.persona_content_formats && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Formats</span>
                            {selected.persona_content_formats.split(",").map(f => (
                              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{f.trim()}</span>
                            ))}
                          </div>
                        )}
                        {selected.persona_collab_rate && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Rate</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{selected.persona_collab_rate}</span>
                          </div>
                        )}
                        {selected.persona_languages && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Languages</span>
                            {selected.persona_languages.split(",").map(l => (
                              <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{l.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button onClick={() => handleInvite(selected)} className="w-full">
                    <Button variant="primary" size="md" fullWidth>
                      {userRole === "brand" ? (
                        <><Users size={14} /> Invite {selected.full_name ?? "Creator"}</>
                      ) : (
                        <>Sign Up to Invite <ArrowRight size={14} /></>
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
        )}
      </AnimatePresence>
    </div>
  );
}
