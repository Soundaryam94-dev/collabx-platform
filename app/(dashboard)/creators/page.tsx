"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Users, Mail, Sparkles, X, Globe } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InviteModal from "@/components/ui/InviteModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { getCreatorProfiles } from "@/lib/supabase/queries";

type CreatorProfile = {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  avatar_url: string | null;
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

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Find Creators</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">
          Discover creators registered on CollabX and send collaboration invites
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search by name, email, or bio..."
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
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((creator, i) => {
            const displayName = creator.full_name ?? creator.email;
            const avatar = initials(creator.full_name, creator.email);
            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        id={creator.id}
                        name={creator.full_name}
                        email={creator.email}
                        role="creator"
                        avatarUrl={creator.avatar_url}
                        size={48}
                        shape="circle"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{displayName}</p>
                        <p className="text-xs text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {creator.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-[#A855F7] bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 rounded-full px-2 py-0.5">
                      <Sparkles size={9} /> Creator
                    </div>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {creator.bio ?? "No bio added yet."}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass rounded-xl p-2.5 text-center">
                      <p className="text-sm font-bold text-white">—</p>
                      <p className="text-[10px] text-[#A1A1AA] flex items-center justify-center gap-1">
                        <Users size={9} /> Followers
                      </p>
                    </div>
                    <div className="glass rounded-xl p-2.5 text-center">
                      <p className="text-sm font-bold text-emerald-400">—</p>
                      <p className="text-[10px] text-[#A1A1AA]">Engagement</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setSelected({ creator, idx: i })}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setInviting({ id: creator.id, name: displayName, avatar, niche: "Creator", email: creator.email })
                      }
                    >
                      Invite
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Profile modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}>

                {/* Header gradient */}
                <div className="relative bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] px-6 pt-8 pb-10 text-center">
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <UserAvatar
                    id={selected.creator.id}
                    name={selected.creator.full_name}
                    email={selected.creator.email}
                    role="creator"
                    avatarUrl={selected.creator.avatar_url}
                    size={80}
                    shape="circle"
                    className="mx-auto mb-3 border-4 border-white/20"
                    style={{ boxShadow: "0 0 30px rgba(0,0,0,0.3)" }}
                  />
                  <h3 className="text-xl font-extrabold text-white">
                    {selected.creator.full_name ?? selected.creator.email}
                  </h3>
                  <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-1">
                    <Mail size={12} /> {selected.creator.email}
                  </p>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 pt-5 space-y-4">
                  {/* Bio */}
                  <div className="rounded-xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="text-[#A1A1AA] text-[11px] font-semibold uppercase tracking-widest mb-2">Bio</p>
                    <p className="text-white text-sm leading-relaxed">
                      {selected.creator.bio ?? "This creator hasn't added a bio yet."}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-xl font-bold text-white">—</p>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5 flex items-center justify-center gap-1">
                        <Users size={10} /> Followers
                      </p>
                    </div>
                    <div className="rounded-xl p-3 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-xl font-bold text-emerald-400">—</p>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5">Engagement</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#A1A1AA] text-center">
                    <Globe size={11} className="inline mr-1" />
                    Social stats will appear once the creator links their accounts.
                  </p>

                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => {
                      const c = selected.creator;
                      const av = initials(c.full_name, c.email);
                      setSelected(null);
                      setInviting({ id: c.id, name: c.full_name ?? c.email, avatar: av, niche: "Creator", email: c.email });
                    }}
                  >
                    Invite to Collaborate
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InviteModal
        creator={inviting}
        onClose={() => setInviting(null)}
        mode="brand-to-creator"
      />
    </div>
  );
}
