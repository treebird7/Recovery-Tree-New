export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-4">
          Rooting Routine
        </h1>
        <p className="text-xl text-green-700 mb-8">
          Daily nature walks with recovery step work
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Login
          </a>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
