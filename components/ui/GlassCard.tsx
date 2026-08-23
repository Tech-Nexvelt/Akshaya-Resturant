"use client";

import { motion } from "framer-motion";

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`glass-panel rounded-2xl transition-shadow duration-500 hover:shadow-[0_0_40px_-10px_rgba(201,161,90,0.35)] ${className}`}
    >
      {children}
    </motion.div>
  );
}
