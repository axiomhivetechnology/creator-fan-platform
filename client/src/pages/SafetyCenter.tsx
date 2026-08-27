import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, Eye, Flag, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const subjectTypes = [
  { value: "profile", label: "Creator profile" },
  { value: "post", label: "Post" },
  { value: "asset", label: "Media asset" },
  { value: "message", label: "Message" },
  { value: "live_event", label: "Live event" },
  { value: "ad", label: "Sponsored placement" },
] as const;

export default function SafetyCenter() {
  const [submitted, setSubmitted] = useState<number | null>(null);
  const report = trpc.safety.report.useMutation({
    onSuccess: result => {
      setSubmitted(result.id);
      toast.success("Report submitted for review.");
    },
    onError: error => toast.error(error.message || "The report could not be submitted."),
  });
  return <div className="min-h-screen bg-[#0b0a10] text-white"><SiteHeader /><main className="container max-w-5xl py-12 sm:py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Trust and safety</p><h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Clear standards make direct connection possible.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">Creator Hub is designed for adults and requires account, content, promotion, and community controls before a production launch. Formal policy, age-assurance, privacy, and payment-provider requirements must be finalized for each launch jurisdiction.</p><section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SafetyCard icon={<ShieldCheck className="h-5 w-5" />} title="Account eligibility" copy="Age acknowledgement, account status, and creator-review states gate applicable features." /><SafetyCard icon={<LockKeyhole className="h-5 w-5" />} title="Access integrity" copy="Protected posts and live entry require a server-side ownership and entitlement decision." /><SafetyCard icon={<Eye className="h-5 w-5" />} title="Human review" copy="Reported assets, messages, events, and promotions enter a moderated review workflow." /><SafetyCard icon={<AlertTriangle className="h-5 w-5" />} title="Escalation" copy="Moderation actions, suspensions, and disputes should produce auditable operational records." /></section><section className="mt-12 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-3xl border border-rose-300/15 bg-rose-300/[0.05] p-6"><Flag className="h-5 w-5 text-rose-200" /><h2 className="mt-5 text-xl font-semibold">Report a concern</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Reports identify the resource type and ID, reason, supporting detail, and a moderation-status trail. Do not use this form for emergency services.</p><div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-xs leading-5 text-zinc-500">This form submits to the platform’s report queue. Moderation decisions remain human-led, scoped to the assigned staff role, and audit-recorded.</div></div><form onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); report.mutate({ subjectType: data.get("subjectType") as (typeof subjectTypes)[number]["value"], subjectId: Number(data.get("subjectId")), reason: String(data.get("reason")), detail: String(data.get("detail") || "") || undefined }); }} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="subject-type">What are you reporting?</Label><select name="subjectType" id="subject-type" className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-rose-400" defaultValue="post">{subjectTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div><div><Label htmlFor="subject-id">Resource ID</Label><Input name="subjectId" id="subject-id" type="number" min="1" className="mt-2 rounded-xl" placeholder="e.g., 128" required /></div></div><div className="mt-4"><Label htmlFor="reason">Reason</Label><Input name="reason" id="reason" className="mt-2 rounded-xl" placeholder="Describe the concern briefly" minLength={3} maxLength={120} required /></div><div className="mt-4"><Label htmlFor="detail">Details</Label><Textarea name="detail" id="detail" className="mt-2 min-h-28 rounded-xl" placeholder="Share context that will help a moderator review the report." maxLength={5000} /></div>{submitted && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-300/10 px-4 py-3 text-sm text-emerald-200"><CheckCircle2 className="h-4 w-4" />Report #{submitted} was submitted for review.</p>}<Button type="submit" disabled={report.isPending} className="mt-6 rounded-xl bg-rose-400 text-zinc-950 hover:bg-rose-300">{report.isPending ? "Submitting…" : "Submit report"}</Button></form></section></main></div>;
}

function SafetyCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.07] text-rose-200">{icon}</span><h2 className="mt-5 text-sm font-semibold">{title}</h2><p className="mt-2 text-xs leading-5 text-zinc-500">{copy}</p></article>; }
