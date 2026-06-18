export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md border-b z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        
        <h1 className="font-bold text-xl tracking-tight">
          AI Interview Prep
        </h1>

        <div className="flex gap-8 text-sm text-gray-600">
          <a href="#">Topics</a>
          <a href="#">Roadmaps</a>
          <a href="#">Mock Interview</a>
          <a href="#">Dashboard</a>
        </div>

      </div>
    </nav>
  );
}