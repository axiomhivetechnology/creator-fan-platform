import { CreatorCard } from "@/components/CreatorCard";
import { SiteHeader } from "@/components/SiteHeader";
import { categories, creators } from "@/lib/catalog";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All creators");
  const displayedCreators = useMemo(
    () =>
      creators.filter(creator => {
        const matchesCategory = category === "All creators" || creator.category === category;
        const searchable = `${creator.displayName} ${creator.category} ${creator.tagline}`.toLowerCase();
        return matchesCategory && searchable.includes(query.toLowerCase());
      }),
    [category, query],
  );

  return (
    <div className="min-h-screen bg-[#0b0a10] text-white">
      <SiteHeader />
      <main className="container pb-20 pt-12 sm:pt-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Find your corner</p>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Creators, closer than the feed.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">Discover independent spaces built for ongoing work, shared attention, and direct support.</p>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-zinc-950/60 px-4 py-3 text-zinc-400 focus-within:ring-2 focus-within:ring-rose-400/70">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search creators or categories"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              aria-label="Search creators"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto px-1 pb-1 sm:pb-0">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-zinc-500" />
            {categories.map(item => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${category === item ? "bg-white text-zinc-900" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-zinc-400">{displayedCreators.length} preview profiles</p>
          <p className="hidden text-xs text-zinc-600 sm:block">Profile previews are illustrative until creators join.</p>
        </div>

        {displayedCreators.length > 0 ? (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Creator previews">
            {displayedCreators.map((creator, index) => <CreatorCard key={creator.handle} creator={creator} index={index} />)}
          </section>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <p className="font-medium text-white">No preview profiles match that search.</p>
            <p className="mt-2 text-sm text-zinc-500">Try another category or search term.</p>
          </div>
        )}
      </main>
    </div>
  );
}
