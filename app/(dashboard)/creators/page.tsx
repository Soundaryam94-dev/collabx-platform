"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Users, Mail, Sparkles, X, Globe, Zap, ChevronDown, ChevronUp, Star, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InviteModal from "@/components/ui/InviteModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { getCreatorProfiles } from "@/lib/supabase/queries";
import { GOAL_WEIGHTS, matchLabel } from "@/lib/matcher";

type CreatorProfile = {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  category: string | null;
  followers: number;
  engagement_rate: number;
  rating: number;
  tags: string;
};

type MatchResult = CreatorProfile & {
  match_score: number;
  breakdown: { category: number; followers: number; engagement: number; rating: number; tags: number };
};

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const ALL_CATEGORIES = ["Fashion", "Tech", "Food", "Travel", "Fitness", "Beauty", "Gaming", "Finance", "Music", "Lifestyle", "Education", "Comedy", "Sports", "Photography", "Parenting", "Pets", "Automotive", "Health", "Art", "Business"];
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

function MatchBadge({ score }: { score: number }) {
  const { label, color, bg } = matchLabel(score);
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color, background: bg }}>
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

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"browse" | "ai">("browse");

  // AI match state
  const [niches, setNiches] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [minFollowers, setMinFollowers] = useState(0);
  const [minEngagement, setMinEngagement] = useState(0);
  const [goal, setGoal] = useState(Object.keys(GOAL_WEIGHTS)[3]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const INITIAL_COUNT = 12;
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<{ creator: CreatorProfile; idx: number } | null>(null);
  const [inviting, setInviting] = useState<{ id: string; name: string; avatar: string; niche: string; email: string } | null>(null);

  useEffect(() => {
    getCreatorProfiles().then((data) => {
      setCreators(data as CreatorProfile[]);
      setLoading(false);
    });
  }, []);

  const filtered = creators.filter((c) => {
    const name = c.full_name ?? c.email;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      (c.bio ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  useEffect(() => { setShowAll(false); }, [search]);

  const runMatch = async () => {
    if (niches.length === 0) { setMatchError("Pick at least one content category."); return; }
    setMatchError("");
    setMatching(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_niches: niches, tags, min_followers: minFollowers, min_engagement: minEngagement, goal, top_n: 10 }),
      });
      const json = await res.json();
      setMatchResults(json.results ?? []);
    } catch {
      setMatchError("Matching failed. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Find Creators</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Discover creators and send collaboration invites</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "browse" ? "primary" : "secondary"} size="sm" onClick={() => setMode("browse")}>
            <Users size={14} /> Browse All
          </Button>
          <Button variant={mode === "ai" ? "primary" : "secondary"} size="sm" onClick={() => setMode("ai")}>
            <Zap size={14} /> AI Match
          </Button>
        </div>
      </div>

      {/* ── AI MATCH MODE ── */}
      {mode === "ai" && (
        <div className="space-y-4">
          <Card hover={false}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#A855F7]" /> Tell us about your campaign
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#A1A1AA] mb-2">Content categories needed</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNiches((prev) => prev.includes(cat) ? prev.filter((n) => n !== cat) : [...prev, cat])}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          niches.includes(cat)
                            ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#A1A1AA] mb-2">Campaign tags</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          tags.includes(tag)
                            ? "bg-[#A855F7]/30 border-[#A855F7] text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#A1A1AA] mb-2">Minimum audience size</p>
                  <div className="flex gap-2 flex-wrap">
                    {AUDIENCE_OPTIONS.map((o) => (
                      <button
                        key={o.label}
                        onClick={() => setMinFollowers(o.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          minFollowers === o.value
                            ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#A1A1AA] mb-2">Minimum engagement rate</p>
                  <div className="flex gap-2 flex-wrap">
                    {ENGAGEMENT_OPTIONS.map((o) => (
                      <button
                        key={o.label}
                        onClick={() => setMinEngagement(o.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          minEngagement === o.value
                            ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#A1A1AA] mb-2">Campaign goal</p>
                  <div className="space-y-1.5">
                    {Object.keys(GOAL_WEIGHTS).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          goal === g
                            ? "bg-[#7C5CFF]/20 border-[#7C5CFF]/50 text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/20"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {matchError && <p className="text-red-400 text-sm mt-3">{matchError}</p>}

            <div className="mt-5">
              <Button variant="primary" size="md" onClick={runMatch} disabled={matching}>
                <Sparkles size={14} /> {matching ? "Finding best matches…" : "Find Best Creators"}
              </Button>
            </div>
          </Card>

          {/* Match Results */}
          {matchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-white font-bold">Top {matchResults.length} matches for your campaign</p>
              {matchResults.map((creator, i) => {
                const displayName = creator.full_name ?? creator.email;
                const avatar = initials(creator.full_name, creator.email);
                const isExpanded = expandedId === creator.id;
                return (
                  <motion.div key={creator.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card hover={false} className="border border-white/10">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-[#7C5CFF] w-6">#{i + 1}</div>
                          <UserAvatar id={creator.id} name={creator.full_name} email={creator.email} role="creator" avatarUrl={creator.avatar_url} size={44} shape="circle" />
                          <div>
                            <p className="font-bold text-white text-sm">{displayName}</p>
                            <p className="text-xs text-[#A855F7]">{creator.category ?? "Creator"}</p>
                          </div>
                        </div>
                        <MatchBadge score={creator.match_score} />
                      </div>

                      <div className="flex gap-4 mt-3 text-xs text-[#A1A1AA]">
                        <span className="flex items-center gap-1"><Users size={11} /> {creator.followers > 0 ? `${(creator.followers / 1000).toFixed(0)}K` : "—"}</span>
                        <span className="flex items-center gap-1"><TrendingUp size={11} /> {creator.engagement_rate > 0 ? `${creator.engagement_rate}%` : "—"}</span>
                        <span className="flex items-center gap-1"><Star size={11} /> {creator.rating > 0 ? `${creator.rating}/5` : "—"}</span>
                        {creator.tags && <span className="text-[#A1A1AA]">· {creator.tags.split(",").slice(0, 3).join(", ")}</span>}
                      </div>

                      {creator.bio && <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-1">{creator.bio}</p>}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : creator.id)}
                        className="flex items-center gap-1 text-xs text-[#7C5CFF] mt-3 hover:text-[#A855F7] transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {isExpanded ? "Hide breakdown" : "Why this creator?"}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
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
                        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => setSelected({ creator, idx: i })}>
                          View Profile
                        </Button>
                        <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={() => setInviting({ id: creator.id, name: displayName, avatar, niche: creator.category ?? "Creator", email: creator.email })}>
                          Invite
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {matchResults.length === 0 && !matching && (
            <Card hover={false}>
              <div className="text-center py-10">
                <Sparkles size={32} className="text-[#A1A1AA] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Configure your campaign above</p>
                <p className="text-[#A1A1AA] text-sm">Select categories and click "Find Best Creators" to get AI-ranked matches.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── BROWSE MODE ── */}
      {mode === "browse" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search by name, email, bio, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-[#A1A1AA] text-xs">
              <SlidersHorizontal size={14} />
              <span>{filtered.length} creator{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card hover={false}>
              <div className="text-center py-14">
                <Users size={36} className="text-[#A1A1AA] mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">
                  {search ? "No creators match your search" : "No creators yet"}
                </p>
                <p className="text-[#A1A1AA] text-sm">
                  {search ? "Try a different search term." : "Creators will appear here once they sign up on CollabX."}
                </p>
              </div>
            </Card>
          ) : (
            <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map((creator, i) => {
                const displayName = creator.full_name ?? creator.email;
                const avatar = initials(creator.full_name, creator.email);
                return (
                  <motion.div key={creator.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Card className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar id={creator.id} name={creator.full_name} email={creator.email} role="creator" avatarUrl={creator.avatar_url} size={48} shape="circle" />
                          <div>
                            <p className="font-bold text-white text-sm">{displayName}</p>
                            <p className="text-xs text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                              <Mail size={10} /> {creator.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#A855F7] bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 rounded-full px-2 py-0.5">
                          <Sparkles size={9} /> {creator.category ?? "Creator"}
                        </div>
                      </div>

                      <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {creator.bio ?? "No bio added yet."}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="glass rounded-xl p-2.5 text-center">
                          <p className="text-sm font-bold text-white">
                            {creator.followers > 0 ? `${(creator.followers / 1000).toFixed(0)}K` : "—"}
                          </p>
                          <p className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1">
                            <Users size={9} /> Followers
                          </p>
                        </div>
                        <div className="glass rounded-xl p-2.5 text-center">
                          <p className="text-sm font-bold text-emerald-400">
                            {creator.engagement_rate > 0 ? `${creator.engagement_rate}%` : "—"}
                          </p>
                          <p className="text-[10px] text-[#A1A1AA]">Engagement</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => setSelected({ creator, idx: i })}>
                          View Profile
                        </Button>
                        <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={() => setInviting({ id: creator.id, name: displayName, avatar, niche: creator.category ?? "Creator", email: creator.email })}>
                          Invite
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length > INITIAL_COUNT && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Show Less" : "Show More"}
                </Button>
              </div>
            )}
            </>
          )}
        </>
      )}

      {/* Profile modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}>
                <div className="relative bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] px-6 pt-8 pb-10 text-center">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                    <X size={16} />
                  </button>
                  <UserAvatar id={selected.creator.id} name={selected.creator.full_name} email={selected.creator.email} role="creator" avatarUrl={selected.creator.avatar_url} size={80} shape="circle" className="mx-auto mb-3 border-4 border-white/20" />
                  <h3 className="text-xl font-extrabold text-white">{selected.creator.full_name ?? selected.creator.email}</h3>
                  <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1">
                    <Mail size={12} /> {selected.creator.email}
                  </p>
                  {selected.creator.category && (
                    <span className="mt-2 inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{selected.creator.category}</span>
                  )}
                </div>

                <div className="px-6 pb-6 pt-5 space-y-4">
                  <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">Bio</p>
                    <p className="text-white text-sm leading-relaxed">{selected.creator.bio ?? "This creator hasn't added a bio yet."}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-white">{selected.creator.followers > 0 ? `${(selected.creator.followers / 1000).toFixed(0)}K` : "—"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Followers</p>
                    </div>
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-emerald-400">{selected.creator.engagement_rate > 0 ? `${selected.creator.engagement_rate}%` : "—"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Engagement</p>
                    </div>
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-lg font-bold text-yellow-400">{selected.creator.rating > 0 ? `${selected.creator.rating}` : "—"}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Rating</p>
                    </div>
                  </div>

                  {selected.creator.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.creator.tags.split(",").map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#A855F7] border border-[#7C5CFF]/20">#{t.trim()}</span>
                      ))}
                    </div>
                  )}

                  {!selected.creator.followers && (
                    <p className="text-xs text-[#A1A1AA] text-center">
                      <Globe size={11} className="inline mr-1" />
                      Stats will appear once the creator updates their profile.
                    </p>
                  )}

                  <Button variant="primary" size="md" fullWidth onClick={() => {
                    const c = selected.creator;
                    setSelected(null);
                    setInviting({ id: c.id, name: c.full_name ?? c.email, avatar: initials(c.full_name, c.email), niche: c.category ?? "Creator", email: c.email });
                  }}>
                    Invite to Collaborate
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InviteModal creator={inviting} onClose={() => setInviting(null)} mode="brand-to-creator" />
    </div>
  );
}
