import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Compass, Menu, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

export function SiteHeader() {
  const [location] = useLocation();

  const navItems = [
    { href: "/explore", label: "Explore" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/safety", label: "Safety" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0a10]/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-fuchsia-600 shadow-lg shadow-fuchsia-600/30">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>Creator Hub</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex" aria-label="Primary navigation">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-white ${location === item.href ? "text-white" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/explore" className="md:hidden">
            <Button size="icon" variant="ghost" className="text-zinc-200 hover:bg-white/10 hover:text-white" aria-label="Explore creators">
              <Compass className="h-4 w-4" />
            </Button>
          </Link>
          <Button onClick={() => startLogin()} variant="ghost" className="hidden text-zinc-300 hover:bg-white/10 hover:text-white sm:inline-flex">
            Sign in
          </Button>
          <Button onClick={() => startLogin()} className="rounded-xl bg-white px-4 text-zinc-900 shadow-none hover:bg-zinc-200">
            <span className="hidden sm:inline">Get started</span>
            <Menu className="h-4 w-4 sm:hidden" />
          </Button>
        </div>
      </div>
    </header>
  );
}
