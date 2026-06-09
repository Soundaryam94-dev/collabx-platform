"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-12 text-center border border-[#7C5CFF]/20 relative overflow-hidden"
        >
          {/* Glow blobs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#7C5CFF]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#A855F7]/20 blur-3xl pointer-events-none" />

          <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 relative">
            Ready to{" "}
            <span className="gradient-text">grow together?</span>
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-8 max-w-xl mx-auto relative">
            Join brands and creators already using CollabX to build
            successful collaborations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/signup?role=brand")}
              className="group"
            >
              I&apos;m a Brand
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push("/signup?role=creator")}
            >
              I&apos;m a Creator
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
