import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { defaultSiteSettings, type SiteSettingsInput } from "@shared/siteSettings";
import { notificationAudiences, notificationSeverities } from "@shared/notifications";
import { canUseDeveloperEditor } from "@shared/rolePolicy";
import { Code2, Eye, FileCode2, FileLock2, LockKeyhole, RotateCcw, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const inputClass = "mt-2 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-700 focus-visible:ring-pink-300/40";

export default function DeveloperEditor() {
  const { loading, user } = useAuth();
  const canEdit = canUseDeveloperEditor(user);
  const settingsQuery = trpc.siteSettings.current.useQuery(undefined, { enabled: canEdit });
  const updateSettings = trpc.siteSettings.update.useMutation({
    onSuccess: settings => {
      setDraft(settings);
      settingsQuery.refetch();
      toast.success("Site settings saved");
    },
    onError: error => toast.error(error.message || "Unable to save site settings"),
  });
  const [draft, setDraft] = useState<SiteSettingsInput>(defaultSiteSettings);

  useEffect(() => {
    if (settingsQuery.data) setDraft(settingsQuery.data);
  }, [settingsQuery.data]);

  const baseline = settingsQuery.data ?? defaultSiteSettings;
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [baseline, draft]);

  if (loading) return <DashboardLayout><div className="mx-auto max-w-3xl py-12 text-sm text-zinc-500">Checking developer access…</div></DashboardLayout>;
  if (!canEdit) return <DashboardLayout><AccessDenied /></DashboardLayout>;

  const updateField = <K extends keyof SiteSettingsInput>(field: K, value: SiteSettingsInput[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
  };

  return <DashboardLayout>
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-5 sm:px-5 sm:py-8">
      <header className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.18em] text-pink-300"><Code2 className="h-3.5 w-3.5" />Developer workspace</div>
          <h1 className="mt-3 font-blackletter text-4xl text-white sm:text-5xl">Shape the space.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">A safe, human-reviewed editor for public presentation copy and visibility controls. Changes are persisted as an auditable site-settings record.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setDraft(baseline)} disabled={!isDirty || updateSettings.isPending} className="rounded-sm text-zinc-400 hover:bg-white/[0.04] hover:text-white"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
          <Button onClick={() => updateSettings.mutate(draft)} disabled={!isDirty || updateSettings.isPending} className="rounded-sm border border-pink-300/30 bg-pink-400/[0.14] text-pink-100 hover:bg-pink-400/[0.22]"><Save className="mr-2 h-4 w-4" />{updateSettings.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
      </header>

      {settingsQuery.isError ? <AccessDenied /> : <div className="grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)_300px]">
        <aside className="space-y-3 border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 px-2 py-2 text-[10px] font-medium uppercase tracking-[.16em] text-zinc-500"><FileCode2 className="h-3.5 w-3.5 text-pink-300" />Project files</div>
          <div className="space-y-1 text-xs">
            <div className="rounded-sm bg-pink-300/[0.1] px-3 py-2 text-pink-100">site.config</div>
            <div className="px-3 py-2 text-zinc-500">content / hero</div>
            <div className="px-3 py-2 text-zinc-500">visibility.flags</div>
            <div className="flex items-center gap-2 px-3 py-2 text-zinc-700"><FileLock2 className="h-3.5 w-3.5" />identity.locked</div>
            <div className="flex items-center gap-2 px-3 py-2 text-zinc-700"><FileLock2 className="h-3.5 w-3.5" />payments.locked</div>
          </div>
          <div className="mt-5 border-t border-white/[0.08] px-2 pt-4 text-[11px] leading-5 text-zinc-600">Only public copy and visibility flags are editable here. Provider credentials, payout settings, creator identity, and compliance evidence stay outside this workspace.</div>
        </aside>

        <main className="space-y-4">
          <section className="border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-pink-300">site.config</p><h2 className="mt-2 text-xl font-medium text-white">Public shell</h2></div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[.13em] text-emerald-200">safe to edit</span></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><Label htmlFor="brand-name" className="text-xs text-zinc-400">Brand name</Label><Input id="brand-name" value={draft.brandName} onChange={event => updateField("brandName", event.target.value)} className={inputClass} /></div>
              <div><Label htmlFor="membership-label" className="text-xs text-zinc-400">Membership label</Label><Input id="membership-label" value={draft.membershipLabel} onChange={event => updateField("membershipLabel", event.target.value)} className={inputClass} /></div>
              <div className="sm:col-span-2"><Label htmlFor="attribution-line" className="text-xs text-zinc-400">Header attribution</Label><Input id="attribution-line" value={draft.attributionLine} onChange={event => updateField("attributionLine", event.target.value)} className={inputClass} /></div>
            </div>
          </section>

          <section className="border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-pink-300">content / hero</p><h2 className="mt-2 text-xl font-medium text-white">Hero narrative</h2></div><Sparkles className="h-5 w-5 text-pink-300" /></div>
            <div className="space-y-5">
              <div><Label htmlFor="hero-eyebrow" className="text-xs text-zinc-400">Eyebrow</Label><Input id="hero-eyebrow" value={draft.heroEyebrow} onChange={event => updateField("heroEyebrow", event.target.value)} className={inputClass} /></div>
              <div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="hero-title" className="text-xs text-zinc-400">Title line</Label><Input id="hero-title" value={draft.heroTitle} onChange={event => updateField("heroTitle", event.target.value)} className={inputClass} /></div><div><Label htmlFor="hero-accent" className="text-xs text-zinc-400">Accent line</Label><Input id="hero-accent" value={draft.heroAccent} onChange={event => updateField("heroAccent", event.target.value)} className={inputClass} /></div></div>
              <div><Label htmlFor="hero-copy" className="text-xs text-zinc-400">Hero description</Label><Textarea id="hero-copy" value={draft.heroCopy} onChange={event => updateField("heroCopy", event.target.value)} className={`${inputClass} min-h-28`} /></div>
            </div>
          </section>

          <section className="border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
            <div className="mb-5"><p className="text-[10px] font-medium uppercase tracking-[.16em] text-pink-300">visibility.flags</p><h2 className="mt-2 text-xl font-medium text-white">Release controls</h2></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleCard label="Early circle panel" copy="Show the beta creator and feedback panel on the homepage." enabled={draft.showEarlyCircle} onToggle={() => updateField("showEarlyCircle", !draft.showEarlyCircle)} />
              <ToggleCard label="Safety panel" copy="Keep the public safety and Premium Access boundary visible." enabled={draft.showSafetyPanel} onToggle={() => updateField("showSafetyPanel", !draft.showSafetyPanel)} />
            </div>
          </section>
          <NotificationStudio />
        </main>

        <aside className="space-y-4">
          <section className="border border-pink-300/20 bg-pink-300/[0.04] p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.16em] text-pink-200"><Eye className="h-3.5 w-3.5" />Live preview</div><span className="text-[10px] text-zinc-600">unsaved draft</span></div><div className="mt-5 overflow-hidden rounded-sm border border-white/[0.1] bg-[#0b0a0d] p-5"><p className="text-[9px] uppercase tracking-[.16em] text-pink-200/80">{draft.heroEyebrow}</p><p className="mt-6 font-blackletter text-4xl leading-[.9] text-white">{draft.heroTitle}<br /><span className="text-pink-300">{draft.heroAccent}</span></p><p className="mt-5 text-xs leading-5 text-zinc-500">{draft.heroCopy}</p><div className="mt-6 border-t border-white/[0.1] pt-3 text-[9px] uppercase tracking-[.14em] text-zinc-600">{draft.brandName} · {draft.membershipLabel}</div></div></section>
          <section className="border border-white/[0.08] bg-white/[0.02] p-5"><div className="flex items-center gap-2 text-xs font-medium text-white"><LockKeyhole className="h-4 w-4 text-pink-300" />Protected boundaries</div><p className="mt-3 text-xs leading-6 text-zinc-600">The editor cannot change creator identity, payout readiness, payment provider credentials, moderation evidence, Premium Access rules, or server authorization logic.</p><div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" />Admin-only and audit logged</div></section>
        </aside>
      </div>}
    </div>
  </DashboardLayout>;
}

function ToggleCard({ label, copy, enabled, onToggle }: { label: string; copy: string; enabled: boolean; onToggle: () => void }) {
  return <button type="button" onClick={onToggle} className={`flex items-start justify-between gap-4 border p-4 text-left transition-colors ${enabled ? "border-pink-300/25 bg-pink-300/[0.05]" : "border-white/[0.08] bg-white/[0.02]"}`}><span><span className="block text-sm text-white">{label}</span><span className="mt-1 block text-xs leading-5 text-zinc-600">{copy}</span></span><span className={`mt-0.5 h-5 w-9 rounded-full p-0.5 ${enabled ? "bg-pink-300" : "bg-zinc-800"}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} /></span></button>;
}

function NotificationStudio() {
  const notificationsQuery = trpc.notifications.adminList.useQuery();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState<(typeof notificationSeverities)[number]>("info");
  const [audience, setAudience] = useState<(typeof notificationAudiences)[number]>("everyone");
  const createNotification = trpc.notifications.create.useMutation({
    onSuccess: () => {
      setTitle(""); setBody(""); setSeverity("info"); setAudience("everyone");
      notificationsQuery.refetch();
      toast.success("Notification published");
    },
    onError: error => toast.error(error.message || "Unable to publish notification"),
  });
  const setActive = trpc.notifications.setActive.useMutation({
    onSuccess: () => notificationsQuery.refetch(),
    onError: error => toast.error(error.message || "Unable to update notification"),
  });

  return <section className="border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-pink-300">notifications</p><h2 className="mt-2 text-xl font-medium text-white">Custom announcements</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-600">Publish a short site banner for a specific audience. Every publish and deactivate action is admin-only and audit logged.</p></div><BellIcon /></div>
    <form onSubmit={event => { event.preventDefault(); createNotification.mutate({ title, body, severity, audience, isActive: true, startsAt: null, endsAt: null }); }} className="grid gap-4 lg:grid-cols-2">
      <div><Label htmlFor="notification-title" className="text-xs text-zinc-400">Title</Label><Input id="notification-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required className={inputClass} placeholder="A clear announcement" /></div>
      <div><Label htmlFor="notification-audience" className="text-xs text-zinc-400">Audience</Label><select id="notification-audience" value={audience} onChange={event => setAudience(event.target.value as typeof audience)} className={`${inputClass} flex h-9 w-full rounded-md px-3 py-1 text-sm`} >{notificationAudiences.map(option => <option key={option} value={option} className="bg-[#151217]">{option}</option>)}</select></div>
      <div className="lg:col-span-2"><Label htmlFor="notification-body" className="text-xs text-zinc-400">Message</Label><Textarea id="notification-body" value={body} onChange={event => setBody(event.target.value)} maxLength={1000} required className={`${inputClass} min-h-24`} placeholder="Keep members informed without exposing protected details." /></div>
      <div><Label htmlFor="notification-severity" className="text-xs text-zinc-400">Severity</Label><select id="notification-severity" value={severity} onChange={event => setSeverity(event.target.value as typeof severity)} className={`${inputClass} flex h-9 w-full rounded-md px-3 py-1 text-sm`} >{notificationSeverities.map(option => <option key={option} value={option} className="bg-[#151217]">{option}</option>)}</select></div>
      <div className="flex items-end lg:justify-end"><Button type="submit" disabled={createNotification.isPending} className="w-full rounded-sm border border-pink-300/30 bg-pink-400/[0.14] text-pink-100 hover:bg-pink-400/[0.22] lg:w-auto">{createNotification.isPending ? "Publishing…" : "Publish notification"}</Button></div>
    </form>
    <div className="mt-6 space-y-2">{(notificationsQuery.data ?? []).slice(0, 5).map(notification => <div key={notification.id} className="flex flex-col gap-3 border border-white/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm text-white">{notification.title}</p><span className="text-[10px] uppercase tracking-[.12em] text-pink-200">{notification.severity}</span><span className="text-[10px] uppercase tracking-[.12em] text-zinc-600">{notification.audience}</span></div><p className="mt-1 truncate text-xs text-zinc-600">{notification.body}</p></div><Button type="button" variant="ghost" onClick={() => setActive.mutate({ id: notification.id, isActive: !notification.isActive })} className="shrink-0 rounded-sm text-xs text-zinc-400 hover:bg-white/[0.05] hover:text-white">{notification.isActive ? "Deactivate" : "Reactivate"}</Button></div>)}</div>
  </section>;
}

function BellIcon() {
  return <div className="grid h-9 w-9 place-items-center rounded-sm bg-pink-300/[0.08]"><Sparkles className="h-4 w-4 text-pink-300" /></div>;
}

function AccessDenied() {
  return <div className="border border-pink-300/20 bg-pink-300/[0.04] p-8"><LockKeyhole className="h-6 w-6 text-pink-300" /><h2 className="mt-5 font-blackletter text-4xl text-white">Developer access required.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">This workspace is restricted to active administrator accounts. Ask the platform owner to grant the correct role before editing public site settings.</p></div>;
}
