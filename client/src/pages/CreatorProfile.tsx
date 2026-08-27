import { SiteHeader } from "@/components/SiteHeader";
import { creators } from "@/lib/catalog";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CalendarDays, Flag, LockKeyhole, MessageCircle, Radio, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function CreatorProfile() {
  const [, params] = useRoute("/creator/:handle");
  const creator = creators.find(item => item.handle === params?.handle) ?? creators[0];

  return (
    <div className="min-h-screen bg-[#0b0a10] text-white">
      <SiteHeader />
      <main className="container pb-20 pt-8 sm:pt-12">
        <Link href="/explore" className="text-sm text-zinc-500 transition hover:text-white">← Back to explore</Link>
        <section className="relative mt-7 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]">
          <div className={`relative h-52 bg-gradient-to-br ${creator.accent} sm:h-64`}>
            <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(11,10,16,.72),transparent_60%)]" />
            <div className="absolute right-[12%] top-6 h-24 w-24 rounded-full border border-white/35 bg-white/10 backdrop-blur-sm" />
            <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-[#0b0a10]/80 to-transparent" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="grid h-24 w-24 place-items-center rounded-[1.6rem] border-4 border-[#0b0a10] bg-zinc-950 text-xl font-semibold shadow-xl sm:h-28 sm:w-28">{creator.initials}</div>
                <div className="pb-1">
                  <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{creator.displayName}</h1><BadgeCheck className="h-5 w-5 text-sky-300" aria-label="Verified creator" /></div>
                  <p className="mt-1 text-sm text-zinc-400">@{creator.handle} · {creator.category}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:pb-1">
                <Button variant="ghost" size="icon" className="rounded-xl border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white" aria-label="Report profile"><Flag className="h-4 w-4" /></Button>
                <Button onClick={() => startLogin()} className="rounded-xl bg-white px-5 text-zinc-900 hover:bg-zinc-200">Subscribe</Button>
              </div>
            </div>
            <div className="mt-7 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="max-w-2xl text-base leading-7 text-zinc-300">{creator.tagline} This preview demonstrates a direct, paid membership space. Account sign-in and payment setup are required before any real purchase, messaging, or protected media is available.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <Feature icon={<LockKeyhole className="h-4 w-4" />} title="Members’ feed" copy="Posts and media are unlocked from the creator’s membership." />
                  <Feature icon={<MessageCircle className="h-4 w-4" />} title="Direct connection" copy="Member messaging is subject to creator settings and platform rules." />
                  <Feature icon={<Radio className="h-4 w-4" />} title="Live sessions" copy="Entry is confirmed against your event access before playback." />
                </div>
              </div>
              <aside className="rounded-2xl border border-white/10 bg-zinc-950/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">Membership</p>
                <p className="mt-3 text-3xl font-semibold">{creator.membershipPrice.replace(" / month", "")}</p>
                <p className="mt-1 text-sm text-zinc-500">per month · cancel before renewal</p>
                <Button onClick={() => startLogin()} className="mt-5 w-full rounded-xl bg-rose-400 text-zinc-950 hover:bg-rose-300">Join this space</Button>
                <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />Payments and access are confirmed server-side. Do not share protected links.</div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">Latest preview</p><h2 className="mt-2 text-xl font-semibold">The public edge of the feed</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-400">Public</span></div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Creators can share a public introduction while reserving complete posts and assets for active members or individual purchase.</p>
            <div className={`mt-5 aspect-[16/7] rounded-2xl bg-gradient-to-br ${creator.accent} p-5`}><div className="h-full rounded-xl border border-white/20 bg-zinc-950/15 p-4 backdrop-blur-sm"><p className="text-xs font-medium text-white/80">Creator feed preview</p><p className="mt-auto text-sm font-medium text-white">Original work, on the creator’s terms.</p></div></div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">Upcoming</p>
            <div className="mt-5 flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-rose-200"><CalendarDays className="h-4 w-4" /></div><div><p className="font-medium text-white">{creator.nextEvent}</p><p className="mt-1 text-sm leading-6 text-zinc-500">Schedule and audience access are managed in the live-event workflow.</p></div></div>
            <Button onClick={() => startLogin()} variant="outline" className="mt-6 w-full rounded-xl border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">Sign in for access</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl border border-white/10 bg-zinc-950/45 p-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-rose-200">{icon}</span><p className="mt-3 text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p></div>;
}
