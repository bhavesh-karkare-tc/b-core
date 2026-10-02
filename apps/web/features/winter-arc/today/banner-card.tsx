import { cn } from "@b-core/ui/lib/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type BannerCardProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  tone?: "accent" | "ember" | "neutral";
  action?: ReactNode;
  className?: string;
};

/** Status banner: icon + title text (meaning never by colour alone). */
export function BannerCard({
  icon: Icon,
  title,
  body,
  tone = "neutral",
  action,
  className,
}: BannerCardProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-row border px-4 py-3",
        tone === "ember" && "border-ember-line bg-ember-surface text-ember-soft",
        tone === "accent" && "border-accent-1 bg-accent-surface text-accent",
        tone === "neutral" && "border-line bg-surface text-text",
        className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {body ? <p className="text-[13px] text-text-muted">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
