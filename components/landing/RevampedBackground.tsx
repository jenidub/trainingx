"use client";

import { motion } from "framer-motion";

export default function RevampedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#FAFAFA]">
      {/* Dynamic Light Background Mesh */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-linear-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          scale: [1, 1.1, 1],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-linear-to-tl from-teal-200/40 to-emerald-200/40 rounded-full blur-[120px]"
      />
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
    </div>
  );
}
