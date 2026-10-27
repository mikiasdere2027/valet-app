import { Button } from "@/components/ui/button"
import type { IconName } from "@/lib/icons/icon-names"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

const TONE = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
} as const

/** With an icon, the action is a round icon-only button (the label becomes its accessible name). */
type AttentionAction = { label: string; onClick: () => void; icon?: IconName }

type AttentionCardProps = {
  tone: keyof typeof TONE
  icon: IconName
  /** What needs attention, in words. */
  title: string
  /** Where, since when, how long unresolved. */
  meta: string
  /**
   * Up to three in-place actions. Icon actions come first as round buttons; of the rest, the
   * first is the strong one and the others are accent text.
   */
  actions: [AttentionAction, AttentionAction?, AttentionAction?]
  /**
   * `solid` is a white card like the invoice (Live Board phone, Design System sheet); `glass`
   * the translucent card; `plain` sits flat inside another card (desktop attention column).
   */
  variant?: "solid" | "glass" | "plain"
  /** Fill of the first (strong) action: ink, or brick red for the Live Board attention cards. */
  primary?: "fg" | "bad"
  /** `compact` is the desktop attention column: smaller type and 38 px buttons. */
  density?: "default" | "compact"
  /** Shows the clock-in selfie thumbnail (approval requests). */
  selfie?: boolean
  /** Actual selfie data URL — renders as a photo; falls back to the face icon when absent. */
  selfieUrl?: string | null
  className?: string
}

/** "What · how long · resolve in place" card (Design System "attention-card"). */
export function AttentionCard({
  tone,
  icon,
  title,
  meta,
  actions,
  variant = "solid",
  density = "default",
  primary = "fg",
  selfie = false,
  selfieUrl,
  className,
}: AttentionCardProps) {
  const compact = density === "compact"
  const present = actions.filter((action): action is AttentionAction => Boolean(action))
  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "glass" && "rounded-card glass-card",
        variant === "solid" && "border border-line bg-elev",
        compact ? "gap-3 rounded-r20 p-4" : "gap-3.5 p-4.5",
        variant === "solid" && !compact && "rounded-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-pill", TONE[tone])}>
          <Icon name={icon} filled size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={cn(
              "font-semibold",
              compact ? "text-15 leading-x130" : "text-17 leading-x130",
            )}
          >
            {title}
          </span>
          <span
            className={cn("text-fg-2", compact ? "text-13 leading-x140" : "text-14 leading-x135")}
          >
            {meta}
          </span>
        </div>
        {selfie && (
          <span
            role="img"
            aria-label="Clock-in selfie"
            style={selfieUrl ? { backgroundImage: `url(${selfieUrl})` } : undefined}
            className={cn(
              "flex-none overflow-hidden bg-cover bg-center",
              compact ? "size-12 rounded-r12" : "size-14 rounded-r14",
              !selfieUrl && "grid place-items-center text-white/60 selfie-thumb",
            )}
          >
            {!selfieUrl && <Icon name="face" filled size={compact ? 20 : 22} />}
          </span>
        )}
      </div>
      <div className={cn("flex", compact ? "gap-1.5" : "gap-2")}>
        {present
          .filter((action) => action.icon)
          .map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              size="compact"
              aria-label={action.label}
              className={cn("flex-none px-0 text-accent-text", compact ? "size-9.5" : "size-11")}
              onClick={action.onClick}
            >
              {action.icon && <Icon name={action.icon} filled size={compact ? 18 : 20} />}
            </Button>
          ))}
        {present
          .filter((action) => !action.icon)
          .map((action, i) => (
            <Button
              key={action.label}
              variant={i > 0 ? "ghost" : primary === "bad" ? "destructive" : "strong"}
              size="compact"
              className={cn("flex-1", i > 0 && "text-accent-text", compact && "h-9.5 text-14")}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
      </div>
    </div>
  )
}
