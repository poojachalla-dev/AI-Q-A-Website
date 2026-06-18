"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Categories() {
  const [categories, setCategories] = useState<string[]>([]);

 useEffect(() => {
  fetch("http://127.0.0.1:8000/categories")
    .then((res) => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .then((data) => setCategories(data))
    .catch((err) => console.error("Fetch error:", err));
}, []);

  return (
    <section className="px-8 py-24">

      {/* Section Title */}
      <h2 className="text-4xl font-bold mb-10 tracking-tight">
        Browse Topics
      </h2>

      {/* Scroll Container */}
      <div className="flex gap-6 overflow-x-auto pb-4">

        {categories.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08
            }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="min-w-[260px]"
          >
            <Link
              href={`/topics?name=${item}`}
              className="
                block h-[170px] rounded-2xl
                bg-gradient-to-br from-gray-100 to-gray-200
                border border-gray-200
                p-6 shadow-sm
                hover:shadow-md
                transition
              "
            >
              <h3 className="text-xl font-semibold">
                {item}
              </h3>

              <p className="text-gray-500 mt-2 text-sm">
                100+ Interview Questions
              </p>

              {/* subtle Apple-style indicator */}
              <div className="mt-6 text-xs text-gray-400">
                Explore →
              </div>
            </Link>
          </motion.div>
        ))}

      </div>
    </section>
  );
}