import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

export function SiteHeader() {
  const [location] = useLocation();
  const navItems = [
    { href: "/explore", label: "Discover" },
    { href: "/#how-it-works", label: "The approach" },
    { href: "/safety", label: "Safety" },
  ];

  return <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0b0a0d]/90 backdrop-blur-xl"><div className="border-b border-white/[0.055]"><div className="container flex h-6 items-center justify-between gap-3 text-[8px] font-medium uppercase tracking-[0.18em] text-zinc-600"><span className="truncate">Developing · designed by <span className="text-pink-200/80">AXIOM-HIVE TECHNOLOGY</span></span><span className="hidden shrink-0 text-zinc-700 sm:inline">Private creative membership</span></div></div><div className="container flex h-[4.1rem] items-center justify-between gap-4"><Link href="/" className="group flex items-center gap-3 text-white"><span className="grid h-8 w-8 place-items-center rounded-full border border-pink-300/35 bg-pink-400/[0.13] text-pink-200 transition group-hover:border-pink-300/70 group-hover:bg-pink-400/[0.2]"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /></span><span className="font-blackletter text-[1.35rem] leading-none tracking-wide">Creator Hub</span></Link><nav className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500 md:flex" aria-label="Primary navigation">{navItems.map(item => <Link key={item.href} href={item.href} className={`transition-colors hover:text-pink-200 ${location === item.href ? "text-pink-200" : ""}`}>{item.label}</Link>)}</nav><div className="flex items-center gap-3"><Button onClick={() => startLogin()} variant="ghost" className="hidden h-9 text-xs text-zinc-400 hover:bg-transparent hover:text-white sm:inline-flex">Sign in</Button><Button onClick={() => startLogin()} className="h-9 rounded-sm border border-pink-300/30 bg-pink-400/[0.12] px-4 text-xs font-medium text-pink-100 shadow-none hover:border-pink-300/60 hover:bg-pink-400/[0.2]"><span className="hidden sm:inline">Enter the space</span><Menu className="h-4 w-4 sm:hidden" /></Button></div></div></header>;
}
