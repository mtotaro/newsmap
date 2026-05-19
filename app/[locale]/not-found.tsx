import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-white/10 mb-4">404</p>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-white/50 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
