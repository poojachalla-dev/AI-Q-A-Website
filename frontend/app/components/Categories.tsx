"use client";

import { motion } from "framer-motion";

const categories = [
  "Python",
  "SQL",
  "Statistics",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "LLMs",
  "MLOps",
];

export default function Categories() {
  return (
    <section className="px-8 py-24 bg-white">

      <h2 className="text-4xl font-bold mb-10">
        Browse Topics
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4">

        {categories.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="min-w-[260px] h-[160px] rounded-2xl 
            bg-gray-100/70 backdrop-blur-md 
            border border-gray-200
            p-6 hover:scale-105 transition shadow-sm"
          >
            <h3 className="text-xl font-semibold">
              {item}
            </h3>

            <p className="text-gray-500 mt-2">
              Interview Questions
            </p>
          </motion.div>
        ))}

      </div>

    </section>
  );
}