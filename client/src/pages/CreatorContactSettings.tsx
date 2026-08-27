import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { MessageCircleMore, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Policy = "premium_members" | "creator_members" | "disabled";
const options: { value: Policy; title: string; description: string }[] = [
  { value: "premium_members", title: "Any Premium member", description: "Any active Premium Access member can request a conversation, subject to blocks and account status." },
  { value: "creator_members", title: "Your active members", description: "Only fans with a current membership to your creator space can request a conversation." },
  { value: "disabled", title: "No new conversations", description: "Fans cannot initiate new conversations. Existing conversations may still require separate moderation action." },
];

export default function CreatorContactSettings() {
  const status = trpc.creator.publishingStatus.useQuery();
  const [policy, setPolicy] = useState<Policy>("creator_members");
  const [allowTips, setAllowTips] = useState(true);
  useEffect(() => { if (status.data?.creator) { setPolicy(status.data.creator.messagePolicy); setAllowTips(status.data.creator.allowTips); } }, [status.data]);
  const save = trpc.creator.updateContactSettings.useMutation({ onSuccess: () => { status.refetch(); toast.success("Contact settings saved."); }, onError: error => toast.error(error.message) });
  if (!status.data?.enabled) return <DashboardLayout><div className="mx-auto max-w-2xl px-2 py-10"><div className="border border-white/[0.1] bg-white/[0.025] p-8"><ShieldCheck className="h-6 w-6 text-pink-300" /><h1 className="mt-5 font-blackletter text-4xl">Approval required</h1><p className="mt-4 text-sm leading-7 text-zinc-500">Contact settings are available after an approved creator profile is active.</p></div></div></DashboardLayout>;
  return <DashboardLayout><div className="mx-auto max-w-3xl px-2 py-5 sm:px-5 sm:py-8"><p className="text-[10px] font-medium uppercase tracking-[.18em] text-pink-300">Creator settings</p><h1 className="mt-3 font-blackletter text-4xl">Set the boundary.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500">Contact policy is enforced when a fan opens a new conversation. All messaging remains subject to Premium Access, account status, safety actions, and bilateral blocks.</p><section className="mt-8 border border-white/[0.1] bg-white/[0.025] p-6"><div className="flex gap-3"><MessageCircleMore className="mt-0.5 h-5 w-5 text-pink-300" /><div><h2 className="font-medium">Who can start a conversation?</h2><p className="mt-1 text-xs leading-6 text-zinc-600">Choose the audience that can request a new private thread.</p></div></div><div className="mt-6 space-y-2">{options.map(option => <button key={option.value} type="button" onClick={() => setPolicy(option.value)} className={`w-full border-l p-4 text-left ${policy === option.value ? "border-pink-300 bg-pink-300/[0.07]" : "border-transparent bg-white/[0.015] hover:bg-white/[0.04]"}`}><p className="text-sm text-white">{option.title}</p><p className="mt-1 text-xs leading-5 text-zinc-600">{option.description}</p></button>)}</div><div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5"><div><Label htmlFor="allow-tips" className="text-sm text-white">Allow tips</Label><p className="mt-1 max-w-md text-xs leading-5 text-zinc-600">This setting controls whether a tip checkout may be offered after an approved adult-industry payment provider is configured.</p></div><Switch id="allow-tips" checked={allowTips} onCheckedChange={setAllowTips} /></div><Button onClick={() => save.mutate({ messagePolicy: policy, allowTips })} disabled={save.isPending} className="mt-7 rounded-sm border border-pink-300/35 bg-pink-300/[0.12] text-pink-100 hover:bg-pink-300/[0.2]">{save.isPending ? "Saving…" : "Save contact settings"}</Button></section></div></DashboardLayout>;
}
