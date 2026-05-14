"use client";

import { motion } from "framer-motion";

const creators = [
  { name: "Alex", niche: "Tech", color: "#7C5CFF", initials: "AX", x: 0, y: -160, size: 56 },
  { name: "Maya", niche: "Fashion", color: "#A855F7", initials: "MY", x: 152, y: -50, size: 48 },
  { name: "Jake", niche: "Gaming", color: "#6366F1", initials: "JK", x: 130, y: 110, size: 52 },
  { name: "Sara", niche: "Fitness", color: "#8B5CF6", initials: "SR", x: -30, y: 165, size: 44 },
  { name: "Kai", niche: "Travel", color: "#7C3AED", initials: "KI", x: -160, y: 80, size: 50 },
  { name: "Zoe", niche: "Food", color: "#9333EA", initials: "ZO", x: -145, y: -80, size: 46 },
];

const orbitRadii = [120, 185, 240];

export default function CreatorNetwork() {
  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Orbit rings */}
      {orbitRadii.map((r, i) => (
        <div
          key={r}
          className="absolute rounded-full"
          style={{
            width: r * 2,
            height: r * 2,
            border: `1px solid rgba(124, 92, 255, ${0.18 - i * 0.04})`,
            boxShadow: `0 0 ${10 + i * 4}px rgba(124, 92, 255, ${0.06 - i * 0.01})`,
          }}
        />
      ))}

      {/* Center hub */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#A855F7] flex flex-col items-center justify-center glow z-10 shadow-2xl"
      >
        <span className="text-xl font-extrabold text-white">CX</span>
        <span className="text-[10px] text-white/70">Platform</span>
      </motion.div>

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
        {creators.map((c, i) => (
          <motion.line
            key={c.name}
            x1="250"
            y1="250"
            x2={250 + c.x}
            y2={250 + c.y}
            stroke="#7C5CFF"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.25, 0.65, 0.25] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </svg>

      {/* Creator avatars */}
      {creators.map((creator, i) => (
        <motion.div
          key={creator.name}
          className="absolute flex flex-col items-center gap-1 cursor-pointer group"
          style={{
            left: `calc(50% + ${creator.x}px - ${creator.size / 2}px)`,
            top: `calc(50% + ${creator.y}px - ${creator.size / 2}px)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          whileHover={{ scale: 1.15, zIndex: 20 }}
        >
          {/* Floating animation */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            className="flex flex-col items-center gap-1"
          >
            {/* Avatar */}
            <div
              className="rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20 group-hover:border-white/50 transition-all"
              style={{
                width: creator.size,
                height: creator.size,
                background: `linear-gradient(135deg, ${creator.color}, #A855F7)`,
                boxShadow: `0 0 20px ${creator.color}40`,
                fontSize: creator.size * 0.28,
              }}
            >
              {creator.initials}
            </div>
            {/* Label */}
            <div className="glass rounded-full px-2 py-0.5 border border-white/10">
              <p className="text-white text-[10px] font-semibold leading-none">
                {creator.name}
              </p>
              <p className="text-[#A1A1AA] text-[9px] leading-none text-center">
                {creator.niche}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* AI recommendation badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-0 glass rounded-xl px-3 py-2 border border-[#7C5CFF]/30 glow-sm"
      >
        <p className="text-[10px] text-[#A855F7] font-semibold">⚡ AI Match</p>
        <p className="text-xs text-white font-bold">98% Fit Score</p>
      </motion.div>

      {/* Active campaign badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute top-8 left-0 glass rounded-xl px-3 py-2 border border-emerald-500/30"
      >
        <p className="text-[10px] text-emerald-400 font-semibold">● Live</p>
        <p className="text-xs text-white font-bold">12 Campaigns</p>
      </motion.div>
    </div>
  );
}
