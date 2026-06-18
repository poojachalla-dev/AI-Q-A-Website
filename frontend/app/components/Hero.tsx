export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
      
      <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
        Master AI Interviews.
      </h1>

      <p className="mt-6 text-xl text-gray-500 max-w-2xl">
        700+ curated questions, ML concepts, system design,
        and AI mock interviews — all in one platform.
      </p>

      <button className="mt-10 px-8 py-4 rounded-full bg-black text-white text-lg hover:scale-105 transition">
        Start Learning
      </button>

    </section>
  );
}