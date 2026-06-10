import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-zinc-950">
          BISF
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/" className="transition hover:text-zinc-950">
            Home
          </Link>
          <Link href="/about" className="transition hover:text-zinc-950">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-zinc-950">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
