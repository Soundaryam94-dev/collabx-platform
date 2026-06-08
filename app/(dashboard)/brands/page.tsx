"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, Globe, Sparkles, Mail, X, ExternalLink, Building2, Pencil, CheckCircle, MessageSquare } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InviteModal from "@/components/ui/InviteModal";
import { getBrandProfiles, updateProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";
import UserAvatar from "@/components/ui/UserAvatar";

type BrandProfile = {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  persona_audience_age: string | null;
  persona_audience_gender: string | null;
  persona_brand_voice: string | null;
  persona_platforms: string | null;
  persona_campaign_goals: string | null;
  persona_budget_range: string | null;
};

const gradients = [
  ["#7C5CFF", "#A855F7"],
  ["#6366F1", "#7C5CFF"],
  ["#A855F7", "#EC4899"],
  ["#7C3AED", "#6366F1"],
  ["#8B5CF6", "#A855F7"],
  ["#9333EA", "#7C5CFF"],
];

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatWebsite(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ brand: BrandProfile; idx: number } | null>(null);
  const [proposing, setProposing] = useState<{ id: string; name: string; avatar: string; niche: string; email: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
    getBrandProfiles().then((data) => {
      setBrands(data as BrandProfile[]);
      setLoading(false);
    });
  }, []);

  const handleSaveBio = async () => {
    if (!selected || !currentUserId) return;
    setSavingBio(true);
    await updateProfile(currentUserId, { bio: bioValue });
    setBrands((prev) => prev.map((b) => b.id === selected.brand.id ? { ...b, bio: bioValue } : b));
    setSelected((prev) => prev ? { ...prev, brand: { ...prev.brand, bio: bioValue } } : prev);
    setSavingBio(false);
    setEditingBio(false);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2500);
  };

  const INITIAL_COUNT = 6;

  useEffect(() => { setShowAll(false); }, [search]);

  const filtered = brands.filter((b) => {
    const name = b.full_name ?? b.email;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      (b.bio ?? "").toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Discover Brands</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">
          Find brands registered on CollabX and send them a collaboration proposal
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search by company name, email, or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-[#A1A1AA] text-xs">
          <Building2 size={14} />
          <span>{filtered.length} brand{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card hover={false}>
          <div className="text-center py-14">
            <Building2 size={36} className="text-[#A1A1AA] mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">
              {search ? "No brands match your search" : "No brands yet"}
            </p>
            <p className="text-[#A1A1AA] text-sm">
              {search ? "Try a different search term." : "Brands will appear here once they sign up on CollabX."}
            </p>
          </div>
        </Card>
      ) : (
        <>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((brand, i) => {
            const displayName = brand.full_name ?? brand.email;
            const avatar = initials(brand.full_name, brand.email);
            const [c1, c2] = gradients[i % gradients.length];
            return (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="flex flex-col gap-4">
                  {/* Top row: avatar + name + badge */}
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      id={brand.id}
                      name={brand.full_name}
                      email={brand.email}
                      role="brand"
                      avatarUrl={brand.avatar_url}
                      size={48}
                      shape="square"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{displayName}</p>
                      <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 truncate mt-0.5">
                        <Mail size={10} className="flex-shrink-0" /> {brand.email}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
                      style={{ background: `${c1}20`, color: c2, border: `1px solid ${c1}40` }}
                    >
                      <Sparkles size={9} /> Brand
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {brand.bio ?? "No company description added yet."}
                  </p>

                  {/* Website */}
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Globe size={12} className="text-[#A1A1AA] flex-shrink-0" />
                    {brand.website ? (
                      <a
                        href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#A855F7] hover:text-white transition-colors flex items-center gap-1 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {formatWebsite(brand.website)}
                        <ExternalLink size={9} className="flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-white/25">No website added</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => setSelected({ brand, idx: i })}>
                      View Profile
                    </Button>
                    <Button
                      variant="primary" size="sm" className="flex-1 text-xs"
                      onClick={() => setProposing({ id: brand.id, name: displayName, avatar, niche: "Brand", email: brand.email })}
                    >
                      <Briefcase size={12} /> Propose
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length > INITIAL_COUNT && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="px-8 py-3 rounded-full border border-[#7C5CFF]/50 text-white text-sm font-semibold bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 transition-all cursor-pointer"
            >
              {showAll ? "Show Less" : `Show More (${filtered.length - INITIAL_COUNT} more)`}
            </button>
          </div>
        )}
        </>
      )}

      {/* Profile modal */}
      <AnimatePresence>
        {selected && (() => {
          const [c1, c2] = gradients[selected.idx % gradients.length];
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
                <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}>

                  <div className="relative px-6 pt-8 pb-8 text-center"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    <button onClick={() => setSelected(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                      <X size={16} />
                    </button>
                    <UserAvatar
                      id={selected.brand.id}
                      name={selected.brand.full_name}
                      email={selected.brand.email}
                      role="brand"
                      avatarUrl={selected.brand.avatar_url}
                      size={80}
                      shape="square"
                      className="mx-auto mb-3 border-4 border-white/20"
                      style={{ boxShadow: "0 0 30px rgba(0,0,0,0.3)" }}
                    />
                    <h3 className="text-xl font-extrabold text-white">
                      {selected.brand.full_name ?? selected.brand.email}
                    </h3>
                    <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1">
                      <Mail size={12} /> {selected.brand.email}
                    </p>
                    {selected.brand.website && (
                      <a
                        href={selected.brand.website.startsWith("http") ? selected.brand.website : `https://${selected.brand.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-white/80 text-xs mt-1.5 hover:text-white transition-colors"
                      >
                        <Globe size={11} /> {formatWebsite(selected.brand.website)} <ExternalLink size={9} />
                      </a>
                    )}
                  </div>

                  <div className="px-6 pb-6 pt-5 space-y-4">
                    <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest">About</p>
                        {currentUserId === selected.brand.id && !editingBio && (
                          <button
                            onClick={() => { setEditingBio(true); setBioValue(selected.brand.bio ?? ""); }}
                            className="flex items-center gap-1 text-[10px] text-[#A855F7] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                        )}
                        {bioSaved && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle size={11} /> Saved
                          </span>
                        )}
                      </div>
                      {editingBio && currentUserId === selected.brand.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={4}
                            value={bioValue}
                            onChange={(e) => setBioValue(e.target.value)}
                            placeholder="Describe your brand, products, and what you're looking for in creators..."
                            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-[#A1A1AA] border border-[#7C5CFF]/40 focus:border-[#7C5CFF] focus:outline-none resize-none transition-colors"
                          />
                          <div className="flex gap-2">
                            <Button variant="primary" size="sm" className="flex-1" onClick={handleSaveBio} disabled={savingBio}>
                              {savingBio ? "Saving…" : "Save"}
                            </Button>
                            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditingBio(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white text-sm leading-relaxed">
                          {selected.brand.bio ?? (
                            currentUserId === selected.brand.id
                              ? <span className="text-[#A1A1AA] italic">Click Edit to add your company description.</span>
                              : "This brand hasn't added a description yet."
                          )}
                        </p>
                      )}
                    </div>
                    {/* Brand Persona */}
                    {(selected.brand.persona_audience_age || selected.brand.persona_platforms || selected.brand.persona_brand_voice || selected.brand.persona_campaign_goals || selected.brand.persona_budget_range) && (
                      <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-3">Brand Persona</p>
                        <div className="space-y-2">
                          {selected.brand.persona_audience_age && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Audience</span>
                              {[selected.brand.persona_audience_age, selected.brand.persona_audience_gender].filter(Boolean).map(v => (
                                <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{v}</span>
                              ))}
                            </div>
                          )}
                          {selected.brand.persona_brand_voice && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Voice</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{selected.brand.persona_brand_voice}</span>
                            </div>
                          )}
                          {selected.brand.persona_platforms && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Platforms</span>
                              {selected.brand.persona_platforms.split(",").map(p => (
                                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{p}</span>
                              ))}
                            </div>
                          )}
                          {selected.brand.persona_campaign_goals && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Goals</span>
                              {selected.brand.persona_campaign_goals.split(",").map(g => (
                                <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#A855F7]">{g}</span>
                              ))}
                            </div>
                          )}
                          {selected.brand.persona_budget_range && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#A1A1AA] w-16 shrink-0">Budget</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{selected.brand.persona_budget_range}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentUserId !== selected.brand.id && (
                      <div className="flex gap-2">
                        <Button variant="secondary" size="md" className="flex-1"
                          onClick={() => { setSelected(null); router.push(`/messages?with=${selected.brand.id}`); }}>
                          <MessageSquare size={14} /> Message
                        </Button>
                        <Button variant="primary" size="md" className="flex-1"
                          onClick={() => {
                            const b = selected.brand;
                            setSelected(null);
                            setProposing({ id: b.id, name: b.full_name ?? b.email, avatar: initials(b.full_name, b.email), niche: "Brand", email: b.email });
                          }}>
                          <Briefcase size={14} /> Propose
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      <InviteModal
        creator={proposing}
        onClose={() => setProposing(null)}
        mode="creator-to-brand"
        brandEmail={proposing?.email}
      />
    </div>
  );
}
