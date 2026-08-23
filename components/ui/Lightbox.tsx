"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { GalleryItem } from "@/lib/data";

export function Lightbox({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-lg px-6"
          onClick={onClose}
        >
          <motion.div
            layoutId={`gallery-${item.id}`}
            className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl"
            style={{
              background: `linear-gradient(150deg, ${item.tone[0]}, ${item.tone[1]}22)`,
            }}
          >
            <div className="absolute inset-0 flex items-end p-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold-bright/80">
                  {item.category}
                </p>
                <h3 className="mt-2 font-display text-3xl text-ivory">{item.title}</h3>
              </div>
            </div>
          </motion.div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-void/60 text-xl text-ivory backdrop-blur hover:bg-void/90"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
