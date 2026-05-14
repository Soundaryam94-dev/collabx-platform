"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Target, DollarSign, Calendar, Tag, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { createCampaign } from "@/lib/supabase/queries";

const GOALS = [
  { value: "brand_awareness", label: "Brand Awareness" },
  { value: "product_promotion", label: "Product Promotion" },
  { value: "app_installs", label: "App Installs" },
  { value: "sales_conversion", label: "Sales Conversion" },
  { value: "social_media_growth", label: "Social Media Growth" },
];

const CATEGORIES = [
  "Fashion", "Tech", "Gaming", "Fitness", "Lifestyle", "Travel", "Food", "Beauty",
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ title: "", budget: "", start_date: "", end_date: "", guidelines: "" });
  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!userId || !fields.title.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      await createCampaign(userId, {
        title: fields.title,
        goal: selectedGoal,
        category: selectedCategory,
        budget: fields.budget ? Number(fields.budget) : null,
        start_date: fields.start_date || null,
        end_date: fields.end_date || null,
        guidelines: fields.guidelines,
      });
      router.push("/campaigns");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl glass border border-white/10 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-white">New Campaign</h2>
          <p className="text-[#A1A1AA] text-sm">Fill in the details to launch your campaign</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/10"
      >
        <div className="space-y-6">
          <Input
            label="Campaign Name"
            placeholder="e.g. Summer Collection Launch"
            icon={<Tag size={15} />}
            value={fields.title}
            onChange={set("title")}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2">
              <Target size={14} /> Campaign Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setSelectedGoal(goal.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer ${
                    selectedGoal === goal.value
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white"
                      : "border-white/10 bg-white/5 text-[#A1A1AA] hover:border-white/20"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#A1A1AA]">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                    selectedCategory === cat
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white"
                      : "border-white/10 bg-white/5 text-[#A1A1AA] hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Budget ($)"
              placeholder="e.g. 2000"
              icon={<DollarSign size={15} />}
              value={fields.budget}
              onChange={set("budget")}
            />
            <Input
              type="date"
              label="Start Date"
              icon={<Calendar size={15} />}
              value={fields.start_date}
              onChange={set("start_date")}
            />
          </div>
          <Input
            type="date"
            label="End Date"
            icon={<Calendar size={15} />}
            value={fields.end_date}
            onChange={set("end_date")}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#A1A1AA] flex items-center gap-2">
              <FileText size={14} /> Campaign Guidelines
            </label>
            <textarea
              placeholder="Describe the content requirements, tone, hashtags, and any brand guidelines..."
              rows={4}
              value={fields.guidelines}
              onChange={set("guidelines")}
              className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors resize-none bg-transparent"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" size="md" fullWidth disabled={isSubmitting || !userId || !fields.title.trim()} onClick={handleSubmit}>
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
