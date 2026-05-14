"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = true,
  glow = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.02,
              boxShadow: "0 0 30px rgba(124, 92, 255, 0.25)",
            }
          : {}
      }
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        glass rounded-2xl p-6
        ${glow ? "glow" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
