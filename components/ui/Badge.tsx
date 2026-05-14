import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "purple" | "green" | "blue" | "gray" | "orange";
  className?: string;
}

const variants = {
  purple: "bg-[#7C5CFF]/20 text-[#A855F7] border border-[#7C5CFF]/30",
  green: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  gray: "bg-white/10 text-[#A1A1AA] border border-white/10",
  orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

export default function Badge({
  children,
  variant = "purple",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
