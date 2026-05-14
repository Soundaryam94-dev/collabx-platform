"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Download, CheckCircle, Clock, AlertCircle,
  ArrowUpRight, CreditCard, TrendingUp, FileText,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const invoices = [
  { id: "INV-001", campaign: "Summer Run Series", brand: "Nike", amount: 800, status: "paid", date: "Jun 20, 2025", dueDate: "Jun 20, 2025" },
  { id: "INV-002", campaign: "AirPods Pro Launch", brand: "Apple", amount: 1200, status: "paid", date: "Jun 15, 2025", dueDate: "Jun 15, 2025" },
  { id: "INV-003", campaign: "Wrapped Early Access", brand: "Spotify", amount: 600, status: "pending", date: "Jun 30, 2025", dueDate: "Jun 30, 2025" },
  { id: "INV-004", campaign: "Galaxy S25 Review", brand: "Samsung", amount: 950, status: "pending", date: "Jul 5, 2025", dueDate: "Jul 5, 2025" },
  { id: "INV-005", campaign: "Productivity Series", brand: "Notion", amount: 500, status: "paid", date: "May 31, 2025", dueDate: "May 31, 2025" },
  { id: "INV-006", campaign: "Summer Collab", brand: "H&M", amount: 700, status: "overdue", date: "May 15, 2025", dueDate: "May 15, 2025" },
];

const FILTERS = ["All", "Paid", "Pending", "Overdue"];

const statusVariant: Record<string, "green" | "orange" | "gray"> = {
  paid: "green",
  pending: "orange",
  overdue: "gray",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "paid") return <CheckCircle size={14} className="text-emerald-400" />;
  if (status === "pending") return <Clock size={14} className="text-orange-400" />;
  return <AlertCircle size={14} className="text-red-400" />;
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = invoices.filter((inv) =>
    filter === "All" ? true : inv.status === filter.toLowerCase()
  );

  const totalEarned = invoices.filter((i) => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((a, b) => a + b.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Payments</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Manage invoices and track your earnings</p>
        </div>
        <Button variant="primary" size="md">
          <FileText size={15} /> Generate Invoice
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: `$${totalEarned.toLocaleString()}`, icon: DollarSign, color: "#10B981", change: "+$600 this month" },
          { label: "Pending", value: `$${totalPending.toLocaleString()}`, icon: Clock, color: "#F59E0B", change: `${invoices.filter((i) => i.status === "pending").length} invoices` },
          { label: "Overdue", value: `$${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: "#EF4444", change: "Action needed" },
          { label: "This Month", value: "$2,000", icon: TrendingUp, color: "#7C5CFF", change: "+18% vs last month" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#A1A1AA]">{s.label}</p>
                  <p className="text-xl font-extrabold text-white mt-1">{s.value}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">{s.change}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payout method */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card hover={false} className="border border-[#7C5CFF]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center">
                <CreditCard size={22} className="text-[#A855F7]" />
              </div>
              <div>
                <p className="font-bold text-white">Payout Method</p>
                <p className="text-sm text-[#A1A1AA]">Bank Account •••• 4242 · USD</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              filter === f
                ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white"
                : "border-white/10 text-[#A1A1AA] hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[#A1A1AA]">
                  <th className="text-left pb-3 font-medium">Invoice</th>
                  <th className="text-left pb-3 font-medium">Campaign</th>
                  <th className="text-left pb-3 font-medium">Brand</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3">
                      <p className="font-mono text-xs text-[#7C5CFF]">{inv.id}</p>
                    </td>
                    <td className="py-3 font-medium text-white max-w-[180px] truncate">{inv.campaign}</td>
                    <td className="py-3 text-[#A1A1AA]">{inv.brand}</td>
                    <td className="py-3">
                      <span className={`font-bold ${inv.status === "paid" ? "text-emerald-400" : "text-white"}`}>
                        ${inv.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-[#A1A1AA]">{inv.date}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={inv.status} />
                        <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                      </div>
                    </td>
                    <td className="py-3">
                      <button className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors">
                        <Download size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
