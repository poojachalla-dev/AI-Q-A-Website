const categories = [
  "Python",
  "SQL",
  "Statistics",
  "NumPy",
  "Pandas",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "LLMs",
  "MLOps",
  "System Design"
];

export default function Categories() {
  return (
    <section className="px-8 py-20">
      
      <h2 className="text-4xl font-bold mb-10">
        Browse Topics
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4">

        {categories.map((item) => (
          <div
            key={item}
            className="min-w-[260px] h-[160px] rounded-2xl bg-gray-100 p-6 hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold">
              {item}
            </h3>

            <p className="text-gray-500 mt-2">
              Interview Questions
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}