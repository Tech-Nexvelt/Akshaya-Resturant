"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MenuItem } from "@/lib/data";

const spiceLabel = ["Mild", "Light Heat", "Spiced", "Fiery"];

export function MenuModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-md px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative w-full max-w-lg overflow-hidden rounded-3xl"
          >
            <div
              className="flex h-56 items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(232,195,126,0.35), transparent 60%), linear-gradient(140deg, #1a140f, #0b0f14)",
              }}
            >
              <span className="font-display text-6xl italic text-gold/30">Akshaya</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-void/60 text-ivory backdrop-blur transition-colors hover:bg-void/90"
            >
              &times;
            </button>

            <div className="p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-3xl font-medium text-ivory">{item.name}</h3>
                <span className="whitespace-nowrap font-display text-2xl text-gold-bright">
                  &#8377;{item.price}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-smoke">{item.description}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-gold/10 pt-5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-smoke">Spice Level</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 w-6 rounded-full ${
                        idx < item.spice ? "bg-gold" : "bg-ivory/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gold-bright/80">{spiceLabel[item.spice]}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
