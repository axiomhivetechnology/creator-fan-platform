import { CreatorCard } from "@/components/CreatorCard";
import { SiteHeader } from "@/components/SiteHeader";
import { categories, creators } from "@/lib/catalog";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All creators");
  const displayedCreators = useMemo(() => creators.filter(creator => {
    const matchesCategory = category === "All creators" || creator.category === category;
    const searchable = `${creator.displayName} ${creator.category} ${creator.tagline}`.toLowerCase();
    return matchesCategory && searchable.includes(query.toLowerCase());
  }), [category, query]);

  return <div className="min-h-screen bg-[#0b0a0d] text-white"><SiteHeader /><main className="container pb-20 pt-14 sm:pt-20"><div className="grid gap-8 md:grid-cols-[.7fr_1.3fr] md:items-end"><div><p className="text-[10px] font-medium uppercase tracking-[.2em] text-pink-200">The collection</p><h1 className="mt-4 font-blackletter text-5xl leading-[.86] tracking-tight sm:text-7xl">Find your<br /><span className="text-pink-300">corner.</span></h1></div><p className="max-w-xl text-sm leading-7 text-zinc-500 md:justify-self-end">Independent spaces for ongoing work, shared attention, and direct support. The profiles below are illustrative until the premium network opens to verified creators and members.</p></div><div className="neon-line mt-10 opacity-60" /><div className="mt-6 flex flex-col gap-3 border-y border-white/[0.08] py-3 sm:flex-row sm:items-center"><label className="flex min-w-0 flex-1 items-center gap-3 border-b border-white/[0.1] px-1 py-2.5 text-zinc-500 focus-within:border-pink-300/60"><Search className="h-3.5 w-3.5 shrink-0" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the collection" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600" aria-label="Search creators" /></label><div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"><SlidersHorizontal className="mr-1 h-3.5 w-3.5 shrink-0 text-pink-300" />{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 px-2 py-2 text-[10px] font-medium uppercase tracking-[.12em] transition ${category === item ? "text-pink-200" : "text-zinc-600 hover:text-white"}`}>{item}</button>)}</div></div><div className="mt-9 flex items-center justify-between"><p className="text-[10px] font-medium uppercase tracking-[.16em] text-zinc-500">{displayedCreators.length} preview profiles</p><p className="hidden text-[10px] uppercase tracking-[.12em] text-zinc-700 sm:block">Private network · Premium Access required</p></div>{displayedCreators.length > 0 ? <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Creator previews">{displayedCreators.map((creator, index) => <CreatorCard key={creator.handle} creator={creator} index={index} />)}</section> : <div className="mt-5 border border-dashed border-white/[0.12] px-6 py-16 text-center"><p className="font-script text-4xl text-white">Nothing here, yet.</p><p className="mt-3 text-xs text-zinc-600">Try another category or search term.</p></div>}</main></div>;
}
