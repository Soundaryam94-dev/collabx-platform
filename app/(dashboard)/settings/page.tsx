"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Link2, Save, CheckCircle, Building2, MapPin, Phone, ChevronDown, Check, Camera, Target, Globe, Users, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/supabase/queries";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "persona", label: "Persona", icon: Target },
  { id: "security", label: "Security", icon: Shield },
];



const ALL_CATEGORIES = ["Fashion", "Tech", "Food", "Travel", "Fitness", "Beauty", "Gaming", "Finance", "Music", "Lifestyle", "Education", "Comedy", "Sports", "Photography", "Parenting", "Pets", "Automotive", "Health", "Art", "Business"];
const ALL_INDUSTRIES = ["Fashion & Apparel", "Beauty & Cosmetics", "Food & Beverage", "Technology", "Health & Fitness", "Travel & Hospitality", "Finance", "Education", "Entertainment", "Retail", "Automotive", "Real Estate"];

const AGE_OPTIONS = ["13-17", "18-24", "25-34", "35-44", "45+"];
const GENDER_OPTIONS_BRAND = ["Male", "Female", "Both"];
const GENDER_OPTIONS_CREATOR = ["Male", "Female", "Mixed"];
const BRAND_VOICE_OPTIONS = ["Professional", "Playful", "Inspirational", "Educational", "Bold"];
const PLATFORM_OPTIONS = ["Instagram", "YouTube", "TikTok", "Twitter", "LinkedIn"];
const GOAL_OPTIONS = ["Brand Awareness", "Sales", "Engagement", "Community Growth"];
const BUDGET_OPTIONS = ["₹5K-₹20K", "₹20K-₹50K", "₹50K-₹1L", "₹1L+"];
const FORMAT_OPTIONS = ["Reels", "Stories", "Posts", "Reviews", "Tutorials", "Vlogs"];
const RATE_OPTIONS = ["₹1K-₹5K", "₹5K-₹15K", "₹15K-₹50K", "₹50K+"];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi"];

function CustomSelect({ label, icon: Icon, value, onChange, options, placeholder }: {
  label: string;
  icon?: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
        {Icon && <Icon size={12} />} {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
            open ? "border-[#7C5CFF] bg-[#7C5CFF]/10" : "border-white/10 hover:border-white/20"
          } glass text-left`}
        >
          <span className={value ? "text-white" : "text-[#A1A1AA]"}>{value || placeholder}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} className="text-[#A1A1AA]" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1.5 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(135deg, #111827, #1a2035)" }}
            >
              <div className="max-h-52 overflow-y-auto py-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer text-left ${
                      value === opt
                        ? "bg-[#7C5CFF]/20 text-white"
                        : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {opt}
                    {value === opt && <Check size={13} className="text-[#A855F7]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("creator");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    full_name: "", email: "", bio: "", website: "",
    category: "", followers: "", engagement_rate: "", rating: "", tags: "",
    industry: "", location: "", phone: "", instagram: "", youtube: "", linkedin: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [persona, setPersona] = useState({
    audience_age: "", audience_gender: "", brand_voice: "",
    platforms: [] as string[], campaign_goals: [] as string[], budget_range: "",
    content_formats: [] as string[], collab_rate: "", languages: [] as string[],
  });
  const [personaSaving, setPersonaSaving] = useState(false);
  const [personaSaved, setPersonaSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const data = await getProfile(user.id);
      if (data) {
        setRole(data.role ?? "creator");
        setAvatarUrl((data as { avatar_url?: string | null }).avatar_url ?? null);
        setProfile({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          bio: data.bio ?? "",
          website: data.website ?? "",
          category: (data as { category?: string }).category ?? "",
          followers: String((data as { followers?: number }).followers ?? ""),
          engagement_rate: String((data as { engagement_rate?: number }).engagement_rate ?? ""),
          rating: String((data as { rating?: number }).rating ?? ""),
          tags: (data as { tags?: string }).tags ?? "",
          industry: (data as { industry?: string }).industry ?? "",
          location: (data as { location?: string }).location ?? "",
          phone: (data as { phone?: string }).phone ?? "",
          instagram: (data as { instagram?: string }).instagram ?? "",
          youtube: (data as { youtube?: string }).youtube ?? "",
          linkedin: (data as { linkedin?: string }).linkedin ?? "",
        });
        const d = data as Record<string, string | null>;
        setPersona({
          audience_age: d.persona_audience_age ?? "",
          audience_gender: d.persona_audience_gender ?? "",
          brand_voice: d.persona_brand_voice ?? "",
          platforms: (d.persona_platforms ?? "").split(",").filter(Boolean),
          campaign_goals: (d.persona_campaign_goals ?? "").split(",").filter(Boolean),
          budget_range: d.persona_budget_range ?? "",
          content_formats: (d.persona_content_formats ?? "").split(",").filter(Boolean),
          collab_rate: d.persona_collab_rate ?? "",
          languages: (d.persona_languages ?? "").split(",").filter(Boolean),
        });
      }
    });
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateProfile(userId, {
        full_name: profile.full_name,
        bio: profile.bio,
        website: profile.website,
        ...(role === "creator" && {
          category: profile.category || undefined,
          followers: profile.followers ? parseInt(profile.followers) : undefined,
          engagement_rate: profile.engagement_rate ? parseFloat(profile.engagement_rate) : undefined,
          rating: profile.rating ? parseFloat(profile.rating) : undefined,
          tags: profile.tags || undefined,
        }),
        ...(role === "brand" && {
          industry: profile.industry || undefined,
          location: profile.location || undefined,
          phone: profile.phone || undefined,
          instagram: profile.instagram || undefined,
          youtube: profile.youtube || undefined,
          linkedin: profile.linkedin || undefined,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // keep saving=false so user can retry
    } finally {
      setSaving(false);
    }
  };


  const handlePersonaSave = async () => {
    if (!userId) return;
    setPersonaSaving(true);
    try {
      await updateProfile(userId, {
        persona_audience_age: persona.audience_age || undefined,
        persona_audience_gender: persona.audience_gender || undefined,
        persona_platforms: persona.platforms.join(",") || undefined,
        ...(role === "brand" && {
          persona_brand_voice: persona.brand_voice || undefined,
          persona_campaign_goals: persona.campaign_goals.join(",") || undefined,
          persona_budget_range: persona.budget_range || undefined,
        }),
        ...(role === "creator" && {
          persona_content_formats: persona.content_formats.join(",") || undefined,
          persona_collab_rate: persona.collab_rate || undefined,
          persona_languages: persona.languages.join(",") || undefined,
        }),
      });
      setPersonaSaved(true);
      setTimeout(() => setPersonaSaved(false), 3000);
    } finally {
      setPersonaSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) { alert("File must be under 2MB"); return; }
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      setAvatarUrl(publicUrl + "?t=" + Date.now());
    }
    setUploadingAvatar(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.newPwd.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (passwords.newPwd !== passwords.confirm) { setPwError("Passwords do not match."); return; }
    setPwSaving(true);
    setPwError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwords.newPwd });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setPasswords({ current: "", newPwd: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Settings</h2>
        <p className="text-[#A1A1AA] text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-48 flex-shrink-0">
          <Card hover={false} className="p-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                  tab === t.id
                    ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/30"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                <t.icon size={15} className={tab === t.id ? "text-[#A855F7]" : ""} />
                {t.label}
              </button>
            ))}
          </Card>
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {tab === "profile" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-5">Profile Information</h3>

              {(() => {
                const initials = profile.full_name
                  ? profile.full_name.trim().split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
                  : profile.email.slice(0, 2).toUpperCase();
                const displayName = profile.full_name || profile.email;
                return (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-shrink-0 group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className={`w-16 h-16 object-cover ${role === "brand" ? "rounded-2xl" : "rounded-full"}`}
                        />
                      ) : (
                        <motion.div
                          key={initials}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          className={`flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] text-xl shadow-lg shadow-[#7C5CFF]/30 ${role === "brand" ? "rounded-2xl" : "rounded-full"}`}
                          style={{ width: 64, height: 64 }}
                        >
                          {initials}
                        </motion.div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className={`absolute inset-0 ${role === "brand" ? "rounded-2xl" : "rounded-full"} bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}
                      >
                        {uploadingAvatar
                          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Camera size={18} className="text-white" />}
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <motion.p
                        key={displayName}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-base font-bold text-white"
                      >
                        {displayName}
                      </motion.p>
                      <p className="text-xs text-[#A855F7] font-medium capitalize mt-0.5">{role}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">Click avatar to upload · JPG, PNG · Max 2MB</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4">
                <Input
                  label={role === "brand" ? "Company Name" : "Full Name"}
                  placeholder={role === "brand" ? "Your company name" : "Your full name"}
                  value={profile.full_name}
                  onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                />
                <Input
                  type="email"
                  label="Email"
                  value={profile.email}
                  disabled
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#A1A1AA]">
                    {role === "brand" ? "Company Description" : "Bio"}
                  </label>
                  <textarea
                    placeholder={role === "brand"
                      ? "Describe your brand, products, and what you're looking for in creators..."
                      : "Tell brands about yourself, your niche, and your audience..."}
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors resize-none bg-transparent"
                  />
                </div>
                <Input
                  label={role === "brand" ? "Company Website" : "Website"}
                  placeholder="https://yourwebsite.com"
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                />

                {role === "brand" && (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <p className="text-sm font-bold text-white pt-2 flex items-center gap-2">
                      <Building2 size={15} className="text-[#A855F7]" /> Brand Details
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <CustomSelect
                        label="Industry"
                        icon={Building2}
                        value={profile.industry}
                        onChange={(v) => setProfile((p) => ({ ...p, industry: v }))}
                        options={ALL_INDUSTRIES}
                        placeholder="Select industry"
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
                          <MapPin size={12} /> Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mumbai, India"
                          value={profile.location}
                          onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
                        <Phone size={12} /> Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                      />
                    </div>

                    <p className="text-sm font-bold text-white pt-2 flex items-center gap-2">
                      <Link2 size={14} className="text-[#A855F7]" /> Social Media
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E1306C]/20 flex items-center justify-center shrink-0 text-[#E1306C] font-bold text-xs">
                          IG
                        </div>
                        <input
                          type="text"
                          placeholder="https://instagram.com/yourbrand"
                          value={profile.instagram}
                          onChange={(e) => setProfile((p) => ({ ...p, instagram: e.target.value }))}
                          className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF0000]/20 flex items-center justify-center shrink-0 text-[#FF0000] font-bold text-xs">
                          YT
                        </div>
                        <input
                          type="text"
                          placeholder="https://youtube.com/@yourbrand"
                          value={profile.youtube}
                          onChange={(e) => setProfile((p) => ({ ...p, youtube: e.target.value }))}
                          className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/20 flex items-center justify-center shrink-0">
                          <Link2 size={15} className="text-[#0A66C2]" />
                        </div>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/company/yourbrand"
                          value={profile.linkedin}
                          onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                          className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === "creator" && (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <p className="text-sm font-bold text-white pt-2 flex items-center gap-2">
                      <span className="text-[#A855F7]">⚡</span> Creator Stats
                      <span className="text-[10px] font-normal text-[#A1A1AA] bg-[#7C5CFF]/10 px-2 py-0.5 rounded-full">Used for AI matching</span>
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#A1A1AA]">Content Category (Niche)</label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p, category: p.category === cat ? "" : cat }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                              profile.category === cat
                                ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white"
                                : "border-white/10 text-[#A1A1AA] hover:border-white/30"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        label="Followers"
                        placeholder="e.g. 150000"
                        value={profile.followers}
                        onChange={(e) => setProfile((p) => ({ ...p, followers: e.target.value }))}
                      />
                      <Input
                        type="number"
                        label="Engagement Rate (%)"
                        placeholder="e.g. 6.5"
                        value={profile.engagement_rate}
                        onChange={(e) => setProfile((p) => ({ ...p, engagement_rate: e.target.value }))}
                      />
                    </div>

                    <Input
                      type="number"
                      label="Rating (out of 5)"
                      placeholder="e.g. 4.8"
                      value={profile.rating}
                      onChange={(e) => setProfile((p) => ({ ...p, rating: e.target.value }))}
                    />

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#A1A1AA]">Tags <span className="text-[11px]">(comma separated)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. fashion, luxury, reviews, tutorials"
                        value={profile.tags}
                        onChange={(e) => setProfile((p) => ({ ...p, tags: e.target.value }))}
                        className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
                  </Button>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium"
                    >
                      <CheckCircle size={14} /> Saved!
                    </motion.span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {tab === "persona" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-1">
                {role === "brand" ? "Brand Persona" : "Creator Persona"}
              </h3>
              <p className="text-[#A1A1AA] text-xs mb-6">
                {role === "brand"
                  ? "Define your audience and campaign preferences — helps creators identify the best fit."
                  : "Describe your audience and content style — helps brands find the perfect match."}
              </p>

              <div className="space-y-6">
                {/* Audience */}
                <div className="space-y-4">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={14} className="text-[#A855F7]" /> Target Audience
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A1AA]">Audience Age Range</label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_OPTIONS.map((age) => (
                        <button key={age} type="button"
                          onClick={() => setPersona(p => ({ ...p, audience_age: p.audience_age === age ? "" : age }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.audience_age === age ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                        >{age}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A1AA]">Audience Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {(role === "brand" ? GENDER_OPTIONS_BRAND : GENDER_OPTIONS_CREATOR).map((g) => (
                        <button key={g} type="button"
                          onClick={() => setPersona(p => ({ ...p, audience_gender: p.audience_gender === g ? "" : g }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.audience_gender === g ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                        >{g}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brand Identity */}
                {role === "brand" && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={14} className="text-[#A855F7]" /> Brand Identity
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#A1A1AA]">Brand Voice</label>
                      <div className="flex flex-wrap gap-2">
                        {BRAND_VOICE_OPTIONS.map((v) => (
                          <button key={v} type="button"
                            onClick={() => setPersona(p => ({ ...p, brand_voice: p.brand_voice === v ? "" : v }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.brand_voice === v ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                          >{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Platforms & Campaign / Content */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe size={14} className="text-[#A855F7]" /> {role === "brand" ? "Platform & Campaign" : "Content"}
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A1AA]">Preferred Platforms <span className="text-[10px] text-[#A1A1AA]/60">(select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORM_OPTIONS.map((p) => (
                        <button key={p} type="button"
                          onClick={() => setPersona(prev => ({ ...prev, platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p] }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.platforms.includes(p) ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                        >{p}</button>
                      ))}
                    </div>
                  </div>

                  {role === "brand" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#A1A1AA]">Campaign Goals <span className="text-[10px] text-[#A1A1AA]/60">(select all that apply)</span></label>
                        <div className="flex flex-wrap gap-2">
                          {GOAL_OPTIONS.map((g) => (
                            <button key={g} type="button"
                              onClick={() => setPersona(prev => ({ ...prev, campaign_goals: prev.campaign_goals.includes(g) ? prev.campaign_goals.filter(x => x !== g) : [...prev.campaign_goals, g] }))}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.campaign_goals.includes(g) ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                            >{g}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#A1A1AA]">Campaign Budget Range</label>
                        <div className="flex flex-wrap gap-2">
                          {BUDGET_OPTIONS.map((b) => (
                            <button key={b} type="button"
                              onClick={() => setPersona(p => ({ ...p, budget_range: p.budget_range === b ? "" : b }))}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.budget_range === b ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                            >{b}</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {role === "creator" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#A1A1AA]">Content Formats <span className="text-[10px] text-[#A1A1AA]/60">(select all that apply)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {FORMAT_OPTIONS.map((f) => (
                          <button key={f} type="button"
                            onClick={() => setPersona(prev => ({ ...prev, content_formats: prev.content_formats.includes(f) ? prev.content_formats.filter(x => x !== f) : [...prev.content_formats, f] }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.content_formats.includes(f) ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                          >{f}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Creator Collaboration */}
                {role === "creator" && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Target size={14} className="text-[#A855F7]" /> Collaboration
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#A1A1AA]">Rate per Post / Collaboration</label>
                      <div className="flex flex-wrap gap-2">
                        {RATE_OPTIONS.map((r) => (
                          <button key={r} type="button"
                            onClick={() => setPersona(p => ({ ...p, collab_rate: p.collab_rate === r ? "" : r }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.collab_rate === r ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                          >{r}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#A1A1AA]">Content Languages <span className="text-[10px] text-[#A1A1AA]/60">(select all that apply)</span></label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGE_OPTIONS.map((l) => (
                          <button key={l} type="button"
                            onClick={() => setPersona(prev => ({ ...prev, languages: prev.languages.includes(l) ? prev.languages.filter(x => x !== l) : [...prev.languages, l] }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${persona.languages.includes(l) ? "bg-[#7C5CFF]/30 border-[#7C5CFF] text-white" : "border-white/10 text-[#A1A1AA] hover:border-white/30 hover:text-white"}`}
                          >{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <Button variant="primary" size="md" onClick={handlePersonaSave} disabled={personaSaving}>
                    <Save size={14} /> {personaSaving ? "Saving…" : "Save Persona"}
                  </Button>
                  {personaSaved && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                      <CheckCircle size={14} /> Saved!
                    </motion.span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {tab === "security" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-5">Security</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Change Password</p>
                  <div className="space-y-3">
                    <Input type="password" label="Current Password" placeholder="••••••••"
                      value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
                    <Input type="password" label="New Password" placeholder="Min. 8 characters"
                      value={passwords.newPwd} onChange={(e) => setPasswords((p) => ({ ...p, newPwd: e.target.value }))} />
                    <Input type="password" label="Confirm New Password" placeholder="••••••••"
                      value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
                    {pwError && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{pwError}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <Button variant="primary" size="md" onClick={handlePasswordChange}
                        disabled={pwSaving || !passwords.newPwd || !passwords.confirm}>
                        {pwSaving ? "Updating…" : "Update Password"}
                      </Button>
                      {pwSaved && (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                          <CheckCircle size={14} /> Password updated!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  );
}
