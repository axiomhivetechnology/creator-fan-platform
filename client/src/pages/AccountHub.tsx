import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { BadgeCheck, CalendarDays, CreditCard, Heart, ShieldCheck, WalletCards } from "lucide-react";

export default function AccountHub() {
  const { user } = useAuth();
  const roleLabel = user?.role === "creator" ? "Creator workspace" : user?.role === "admin" ? "Platform administration" : "Fan account";
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-2 py-5 sm:px-5 sm:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">{roleLabel}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome to your space.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Memberships, purchases, event access, and account controls appear here when your account is active.</p></div><Button className="w-fit rounded-xl">Explore creators</Button></div>
        <section className="grid gap-4 md:grid-cols-3">
          <StatusCard icon={<Heart className="h-4 w-4" />} label="Memberships" title="No active memberships" copy="Discover creators and join the spaces you value." />
          <StatusCard icon={<WalletCards className="h-4 w-4" />} label="Purchases" title="Your library is ready" copy="Paid posts and event tickets are listed here after access is confirmed." />
          <StatusCard icon={<CalendarDays className="h-4 w-4" />} label="Live events" title="No upcoming entry" copy="Eligible events will appear with their access and start information." />
        </section>
        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-3xl border bg-card p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500"><CreditCard className="h-5 w-5" /></span><div><h2 className="font-semibold">Payments and receipts</h2><p className="mt-1 text-sm text-muted-foreground">Payment methods are managed through the configured payment provider.</p></div></div><Button variant="outline" className="mt-6 rounded-xl">View purchase history</Button></div><div className="rounded-3xl border bg-card p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold">Account safety</h2><p className="mt-1 text-sm text-muted-foreground">Manage your access, privacy, and contact preferences.</p></div></div><Button variant="outline" className="mt-6 rounded-xl">Review settings</Button></div></section>
        {user?.role === "creator" && <section className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.035] p-6"><div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-5 w-5 text-rose-500" /><div><h2 className="font-semibold">Creator workspace</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Build your profile, configure memberships, publish posts, and complete payout-provider onboarding before accepting payments. Financial activity is shown only after verified provider events are recorded.</p><Button className="mt-5 rounded-xl">Open creator settings</Button></div></div></section>}
      </div>
    </DashboardLayout>
  );
}

function StatusCard({ icon, label, title, copy }: { icon: React.ReactNode; label: string; title: string; copy: string }) {
  return <article className="rounded-3xl border bg-card p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">{icon}</span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><h2 className="mt-2 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article>;
}
