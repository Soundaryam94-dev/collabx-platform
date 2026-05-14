"use client";

import Image from "next/image";
import { getAvatarSrc } from "@/lib/avatarImage";

interface UserAvatarProps {
  id: string;
  name: string | null;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  size?: number;
  shape?: "circle" | "square";
  className?: string;
  style?: React.CSSProperties;
}

function getInitials(name: string | null, email?: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return (email ?? "?").slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  id,
  name,
  email,
  role = "creator",
  avatarUrl,
  size = 40,
  shape = "circle",
  className = "",
  style,
}: UserAvatarProps) {
  const src = getAvatarSrc(id, role, avatarUrl);
  const radius = shape === "circle" ? "9999px" : "12px";

  if (src) {
    return (
      <div
        className={`flex-shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size, borderRadius: radius, ...style }}
      >
        <Image
          src={src}
          alt={name ?? email ?? "avatar"}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] ${className}`}
      style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.3, ...style }}
    >
      {getInitials(name, email)}
    </div>
  );
}
