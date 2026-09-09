import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

const styles = {
  info: { icon: Info, wrapper: "border-sky-300/20 bg-sky-300/[0.06] text-sky-100" },
  success: { icon: CheckCircle2, wrapper: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100" },
  warning: { icon: TriangleAlert, wrapper: "border-amber-300/25 bg-amber-300/[0.07] text-amber-100" },
  urgent: { icon: TriangleAlert, wrapper: "border-pink-300/35 bg-pink-300/[0.09] text-pink-100" },
} as const;

export default function GlobalNotificationBanner() {
  const notificationsQuery = trpc.notifications.current.useQuery(undefined, { staleTime: 30_000 });
  const [dismissed, setDismissed] = useState<number[]>([]);
  const notifications = (notificationsQuery.data ?? []).filter(notification => !dismissed.includes(notification.id)).slice(0, 3);

  if (!notifications.length) return null;

  return <div className="border-b border-white/[0.08] bg-[#0b0a0d] px-3 py-2 sm:px-5" aria-label="Site notifications">
    <div className="mx-auto flex max-w-6xl flex-col gap-2">
      {notifications.map(notification => {
        const style = styles[notification.severity];
        const Icon = style.icon;
        return <div key={notification.id} className={`flex items-start gap-3 border px-3 py-2.5 ${style.wrapper}`} role={notification.severity === "urgent" || notification.severity === "warning" ? "alert" : "status"}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1"><p className="text-xs font-medium">{notification.title}</p><p className="mt-0.5 text-xs leading-5 opacity-80">{notification.body}</p></div>
          <button type="button" onClick={() => setDismissed(current => [...current, notification.id])} className="rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100" aria-label={`Dismiss ${notification.title}`}><X className="h-3.5 w-3.5" /></button>
        </div>;
      })}
    </div>
  </div>;
}
