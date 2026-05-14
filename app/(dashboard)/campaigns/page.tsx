"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Megaphone, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const campaigns = [
  {
    id: "1",
    name: "Summer Collection Launch",
    goal: "Product Promotion",
    budget: "$3,200",
    creators: 6,
    reach: "480K",
    status: "active",
    category: "Fashion",
    startDate: "Jun 1",
    endDate: "Jun 30",
  },
  {
    id: "2",
    name: "App Install Drive Q2",
    goal: "App Installs",
    budget: "$2,100",
    creators: 4,
    reach: "310K",
    status: "active",
    category: "Tech",
    startDate: "May 15",
    endDate: "Jun 15",
  },
  {
    id: "3",
    name: "Brand Awareness Campaign",
    goal: "Brand Awareness",
    budget: "$4,800",
    creators: 8,
    reach: "720K",
    status: "active",
    category: "Lifestyle",
    startDate: "Jun 5",
    endDate: "Jul 5",
  },
  {
    id: "4",
    name: "Holiday Season Push",
    goal: "Sales Conversion",
    budget: "$2,800",
    creators: 0,
    reach: "—",
    status: "draft",
    category: "Fashion",
    startDate: "Dec 1",
    endDate: "Dec 25",
  },
  {
    id: "5",
    name: "Social Media Growth",
    goal: "Social Media Growth",
    budget: "$1,500",
    creators: 3,
    reach: "180K",
    status: "paused",
    category: "Lifestyle",
    startDate: "May 1",
    endDate: "May 31",
  },
];

const statusVariant: Record<string, "green" | "gray" | "orange" | "purple"> = {
  active: "green",
  draft: "gray",
  paused: "orange",
  completed: "purple",
};

const FILTERS = ["All", "Active", "Draft", "Paused", "Completed"];

export default function CampaignsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = campaigns.filter((c) => {
    const matchesFilter = filter === "All" || c.status === filter.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Campaigns</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Manage all your influencer campaigns</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push("/campaigns/new")}>
          <Plus size={16} />
          New Campaign
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA] border border-white/10 focus:border-[#7C5CFF] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#7C5CFF]/20 text-white border border-[#7C5CFF]/40"
                  : "glass text-[#A1A1AA] border border-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign cards */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card
              className="cursor-pointer"
              onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center">
                  <Megaphone size={18} className="text-[#A855F7]" />
                </div>
                <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
              </div>

              <h3 className="font-bold text-white mb-1">{campaign.name}</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">{campaign.goal} · {campaign.category}</p>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="glass rounded-xl p-2">
                  <p className="text-sm font-bold text-white">{campaign.budget}</p>
                  <p className="text-[10px] text-[#A1A1AA]">Budget</p>
                </div>
                <div className="glass rounded-xl p-2">
                  <p className="text-sm font-bold text-white">{campaign.creators}</p>
                  <p className="text-[10px] text-[#A1A1AA]">Creators</p>
                </div>
                <div className="glass rounded-xl p-2">
                  <p className="text-sm font-bold text-white">{campaign.reach}</p>
                  <p className="text-[10px] text-[#A1A1AA]">Reach</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>{campaign.startDate} → {campaign.endDate}</span>
                <span className="flex items-center gap-1 text-[#7C5CFF]">
                  <Users size={12} /> {campaign.creators} creators
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Megaphone size={40} className="text-[#A1A1AA] mx-auto mb-3" />
          <p className="text-[#A1A1AA]">No campaigns found</p>
          <Button variant="primary" size="md" onClick={() => router.push("/campaigns/new")} className="mt-4">
            Create your first campaign
          </Button>
        </div>
      )}
    </div>
  );
}
