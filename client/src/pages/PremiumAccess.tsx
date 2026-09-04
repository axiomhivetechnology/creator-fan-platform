import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Check, LockKeyhole } from "lucide-react";

export default function PremiumAccess() {
  const plans = trpc.premium.plans.useQuery();
  return (
    <div className="min-h-screen bg-[#0b0a0d] text-white">
      <SiteHeader />
      <main className="container py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[.2em] text-pink-200">Private membership</p>
            <h1 className="mt-4 font-blackletter text-5xl leading-[.88] sm:text-7xl">Premium<br /><span className="text-pink-300">Access.</span></h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-zinc-400">Premium Access is the paid entry authorization for the Creator Hub network. An active entitlement is required before an account can browse real creator spaces, view creator details, contact creators, purchase paid content, participate in live rooms, or request event entry.</p>
            <div className="mt-8 border-l border-pink-300/50 pl-4 text-xs leading-6 text-zinc-500">Creator subscriptions, paid drops, live-room gifts, and event tickets are separate creator-level purchases. Token, power, and gift mechanics remain provider-dependent and will be defined with pricing, redemption, moderation, and payout terms before launch.</div>
          </div>
          <section className="grid gap-4 sm:grid-cols-2">
            {plans.isLoading ? (
              <><PlanSkeleton /><PlanSkeleton /></>
            ) : plans.data?.length ? (
              plans.data.map(plan => <article key={plan.id} className="flex min-h-80 flex-col border border-white/[0.1] bg-white/[0.025] p-6"><p className="text-[10px] font-medium uppercase tracking-[.16em] text-pink-200">Premium Access</p><h2 className="mt-5 text-2xl font-medium">{plan.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{plan.description || "Private network membership with server-verified access."}</p><div className="mt-7"><p className="text-3xl font-semibold">{plan.monthlyPrice ? `${plan.currency} ${plan.monthlyPrice}` : "Plan details"}</p><p className="mt-1 text-xs text-zinc-600">{plan.monthlyPrice ? "per month · recurring" : "Pricing configured before launch"}</p></div><ul className="mt-7 space-y-3 text-xs text-zinc-400"><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-pink-300" />Private creator discovery</li><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-pink-300" />Creator engagement eligibility</li><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-pink-300" />Private creator details after access</li><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-pink-300" />Server-verified network entry</li></ul><Button onClick={() => startLogin()} className="mt-auto rounded-sm border border-pink-300/35 bg-pink-300/[0.12] text-pink-100 hover:bg-pink-300/[0.2]">Continue securely</Button></article>)
            ) : <EmptyPlanState />}
          </section>
        </div>
        <div className="mt-14 grid gap-3 border-t border-white/[0.08] pt-7 sm:grid-cols-3"><Detail label="Clear terms" copy="Price, cadence, cancellation route, and account state appear before a supported checkout starts." /><Detail label="Private by default" copy="Real creator details, live-room participation, and interaction stay behind the current Premium Access entitlement." /><Detail label="Provider approval" copy="Payment is activated only with an approved provider that accepts the adult-entertainment use case." /></div>
      </main>
    </div>
  );
}

function EmptyPlanState() { return <div className="border border-dashed border-white/[0.12] p-7 sm:col-span-2"><LockKeyhole className="h-5 w-5 text-pink-200" /><h2 className="mt-5 text-xl font-medium">Membership plans are being configured.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-zinc-500">The platform will not collect payment details until an adult-industry payment provider, current terms, and the Premium Access plan have been configured and approved.</p><Button onClick={() => startLogin()} variant="outline" className="mt-6 rounded-sm border-white/[0.15] bg-transparent text-white hover:bg-white/[0.07] hover:text-white">Sign in to check your status</Button></div>; }
function PlanSkeleton() { return <div className="min-h-80 animate-pulse border border-white/[0.08] bg-white/[0.025] p-6"><div className="h-3 w-24 bg-white/[0.08]" /><div className="mt-6 h-7 w-40 bg-white/[0.08]" /><div className="mt-5 h-12 w-full bg-white/[0.05]" /></div>; }
function Detail({ label, copy }: { label: string; copy: string }) { return <div><p className="text-[10px] font-medium uppercase tracking-[.15em] text-pink-200">{label}</p><p className="mt-2 text-xs leading-6 text-zinc-600">{copy}</p></div>; }
