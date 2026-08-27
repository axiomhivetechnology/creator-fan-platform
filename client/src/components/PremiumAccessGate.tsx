import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";

export function PremiumAccessGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const premium = trpc.premium.status.useQuery(undefined, { enabled: isAuthenticated });

  if (authLoading || (isAuthenticated && premium.isLoading)) return <GateShell title="Checking your access" copy="We are securely confirming your membership authorization." />;
  if (!isAuthenticated) return <GateShell title="Sign in to enter" copy="The creator network is reserved for verified Premium Access members." action="Sign in" onAction={() => startLogin()} />;
  if (premium.isError) return <GateShell title="Access could not be confirmed" copy="Your private network access is unavailable right now. Please try again or contact support." action="Try again" onAction={() => premium.refetch()} />;
  if (premium.data?.allowed) return <>{children}</>;

  const isRecovery = premium.data?.nextStep === "recover_billing";
  const isSupport = premium.data?.nextStep === "contact_support";
  return <GateShell
    title={isSupport ? "Your access needs support" : isRecovery ? "Renew Premium Access" : "Premium Access required"}
    copy={isSupport ? "This account cannot enter the creator network right now. Contact support for the next appropriate step." : isRecovery ? "Your membership is not currently active. Renew or update billing to return to the private creator network." : "Premium Access is the entry membership for the private creator network. Creator subscriptions and paid drops are available after access is active."}
    action={isSupport ? "View safety and support" : isRecovery ? "Manage membership" : "View Premium Access"}
    href={isSupport ? "/safety" : "/join"}
  />;
}

function GateShell({ title, copy, action, onAction, href }: { title: string; copy: string; action?: string; onAction?: () => void; href?: string }) {
  return <main className="min-h-[calc(100vh-94px)] bg-[#0b0a0d] px-5 py-16 text-white"><div className="mx-auto max-w-xl border border-white/[0.1] bg-white/[0.025] p-7 sm:p-10"><span className="grid h-11 w-11 place-items-center rounded-full border border-pink-300/25 bg-pink-300/[0.08] text-pink-200"><LockKeyhole className="h-4 w-4" /></span><p className="mt-7 text-[10px] font-medium uppercase tracking-[.18em] text-pink-200">Private creator network</p><h1 className="mt-4 font-blackletter text-4xl leading-[.95] sm:text-5xl">{title}</h1><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">{copy}</p>{action && (href ? <Link href={href}><Button className="mt-8 rounded-sm border border-pink-300/35 bg-pink-300/[0.12] text-pink-100 hover:bg-pink-300/[0.2]">{action}</Button></Link> : <Button onClick={onAction} className="mt-8 rounded-sm border border-pink-300/35 bg-pink-300/[0.12] text-pink-100 hover:bg-pink-300/[0.2]">{action}</Button>)}<div className="mt-8 flex gap-2 border-t border-white/[0.08] pt-5 text-xs leading-5 text-zinc-600"><ShieldCheck className="h-4 w-4 shrink-0 text-pink-300" />Premium Access is confirmed by the server. It does not replace creator-specific memberships, PPV purchases, contact settings, or ticket requirements.</div></div></main>;
}
