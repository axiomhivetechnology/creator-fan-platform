import type { CreatorPreview } from "@/lib/catalog";
import { ArrowUpRight, Radio } from "lucide-react";
import { Link } from "wouter";

export function CreatorCard({ creator, index = 0 }: { creator: CreatorPreview; index?: number }) {
  return (
    <Link
      href={`/creator/${creator.handle}`}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.075]"
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <div className={`relative mb-5 flex aspect-[5/3] overflow-hidden rounded-2xl bg-gradient-to-br ${creator.accent}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.8),transparent_20%),linear-gradient(135deg,transparent_20%,rgba(10,10,16,.5))]" />
        <div className="absolute -bottom-8 -left-2 h-28 w-28 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm" />
        <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950/70 text-sm font-semibold tracking-wide text-white shadow-xl backdrop-blur">
          {creator.initials}
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-zinc-950/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {creator.status === "Live now" && <Radio className="mr-1 inline h-3 w-3 text-rose-300" />}
          {creator.status}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{creator.displayName}</p>
          <p className="mt-1 text-xs text-zinc-400">{creator.category}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-400 transition group-hover:border-white/25 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-300">{creator.tagline}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
        <span className="text-zinc-500">Membership from</span>
        <span className="font-medium text-white">{creator.membershipPrice}</span>
      </div>
    </Link>
  );
}
