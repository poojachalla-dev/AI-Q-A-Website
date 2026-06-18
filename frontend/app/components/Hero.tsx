"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-white to-gray-100">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-6xl md:text-7xl font-bold tracking-tight"
      >
        Master AI Interviews.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mt-6 text-xl text-gray-500 max-w-2xl"
      >
        700+ curated questions, ML concepts, system design,
        and AI mock interviews — all in one platform.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-10 px-8 py-4 rounded-full bg-black text-white text-lg hover:scale-105 transition"
      >
        Start Learning
      </motion.button>

    </section>
  );
}