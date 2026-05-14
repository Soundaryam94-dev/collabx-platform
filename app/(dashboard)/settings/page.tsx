"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Link2, Save, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updateProfile } from "@/lib/supabase/queries";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Link2 },
];

const SOCIALS = [
  { name: "Instagram", placeholder: "@yourhandle" },
  { name: "YouTube", placeholder: "Channel URL" },
  { name: "TikTok", placeholder: "@yourhandle" },
  { name: "Twitter/X", placeholder: "@yourhandle" },
  { name: "LinkedIn", placeholder: "Profile URL" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? "bg-gradient-to-r from-[#7C5CFF] to-[#A855F7]" : "bg-white/20"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}


export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("creator");
  const [profile, setProfile] = useState({ full_name: "", email: "", bio: "", website: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    campaignInvites: true, messages: true, approvals: true,
    payments: true, weeklyReport: false, productUpdates: false,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const data = await getProfile(user.id);
      if (data) {
        setRole(data.role ?? "creator");
        setProfile({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          bio: data.bio ?? "",
          website: data.website ?? "",
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
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // keep saving=false so user can retry
    } finally {
      setSaving(false);
    }
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

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`flex-shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] text-xl glow-sm ${role === "brand" ? "rounded-2xl" : "rounded-full"}`}
                  style={{ width: 64, height: 64 }}
                >
                  {profile.full_name
                    ? profile.full_name.trim().split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
                    : profile.email.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Profile Photo</p>
                  <p className="text-xs text-[#A1A1AA]">JPG, PNG or GIF · Max 2MB</p>
                </div>
              </div>

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

          {tab === "notifications" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-5">Notification Preferences</h3>
              <div className="space-y-4">
                {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => {
                  const labels: Record<string, { title: string; desc: string }> = {
                    campaignInvites: { title: "Campaign Invites", desc: "When a brand sends you a collaboration invitation" },
                    messages: { title: "New Messages", desc: "When you receive a direct message from a brand" },
                    approvals: { title: "Content Approvals", desc: "When your submitted content is approved or rejected" },
                    payments: { title: "Payments", desc: "When a payment is processed or an invoice is due" },
                    weeklyReport: { title: "Weekly Report", desc: "Summary of your performance and earnings every Monday" },
                    productUpdates: { title: "Product Updates", desc: "News and feature announcements from CollabX" },
                  };
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-white">{labels[key].title}</p>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">{labels[key].desc}</p>
                      </div>
                      <Toggle checked={val} onChange={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))} />
                    </div>
                  );
                })}
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
                    <Input type="password" label="Current Password" placeholder="••••••••" />
                    <Input type="password" label="New Password" placeholder="Min. 8 characters" />
                    <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                    <Button variant="primary" size="md">Update Password</Button>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-white mb-1">Two-Factor Authentication</p>
                  <p className="text-xs text-[#A1A1AA] mb-3">Add an extra layer of security to your account.</p>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
                  <p className="text-xs text-[#A1A1AA] mb-3">Once you delete your account, there is no going back.</p>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10">Delete Account</Button>
                </div>
              </div>
            </Card>
          )}

          {tab === "integrations" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-5">Social Integrations</h3>
              <div className="space-y-4">
                {SOCIALS.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-[#A1A1AA]">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.name}</p>
                        <p className="text-xs text-[#A1A1AA]">{s.placeholder}</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">Connect</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "appearance" && (
            <Card hover={false}>
              <h3 className="font-bold text-white mb-5">Appearance</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["Dark", "Darker", "Midnight"].map((t) => (
                      <button
                        key={t}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          t === "Dark"
                            ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white"
                            : "border-white/10 text-[#A1A1AA] hover:border-white/20"
                        }`}
                      >
                        <div className="w-full h-8 rounded-lg mb-2" style={{
                          background: t === "Dark" ? "linear-gradient(135deg, #0B1020, #151B35)"
                            : t === "Darker" ? "linear-gradient(135deg, #050810, #0B1020)"
                            : "linear-gradient(135deg, #000000, #0B0F1A)"
                        }} />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {["#7C5CFF", "#A855F7", "#6366F1", "#EC4899", "#10B981"].map((c) => (
                      <button
                        key={c}
                        className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/50 transition-all cursor-pointer"
                        style={{ background: c, boxShadow: c === "#7C5CFF" ? `0 0 15px ${c}60` : "none", borderColor: c === "#7C5CFF" ? "white" : "transparent" }}
                      />
                    ))}
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
