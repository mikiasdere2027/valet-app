import { Icon } from "@/components/shared"
import type { IconName } from "@/lib/icons/icon-names"
import { formatMoney } from "@/lib/money/format"
import { ADMIN_STATUS } from "@/lib/status/admin"
import type { StatusSpec } from "@/lib/status/presets"
import { cn } from "@/lib/utils"

import { invoiceNumber } from "./invoice-pdf"

/** Phone and tablet: the actions pin to the bottom edge (the tab bar steps aside, admin-shell). */
export const ACTION_BAR =
  "fixed inset-x-0 bottom-0 z-20 flex gap-2.5 bg-elev/90 px-5 pt-3 pb-[calc(var(--safe-bottom)+12px)] backdrop-blur-xl desktop:static desktop:bg-transparent desktop:p-0 desktop:backdrop-blur-none"

type MoneyProps = {
  cents: number
  className?: string
  /** Text size of the cents, set smaller than the dollars (Regency mockups). */
  centsClassName?: string
}

/** An amount with its cents set smaller: $5,282 then .00, on one baseline. */
export function Money({ cents, className, centsClassName = "text-12" }: MoneyProps) {
  const text = formatMoney(cents)
  const dot = text.lastIndexOf(".")
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {text.slice(0, dot)}
      <span className={cn("ml-0.5 tracking-p020", centsClassName)}>{text.slice(dot)}</span>
    </span>
  )
}

const STATUS_WORD: Record<string, StatusSpec> = {
  DRAFT: ADMIN_STATUS.draft,
  SENT: ADMIN_STATUS.sent,
  PAID: ADMIN_STATUS.paid,
  // The detail's label drops the day count ("Overdue 6d" becomes OVERDUE).
  OVERDUE: { ...ADMIN_STATUS.overdue(0), label: "Overdue" },
}

/** "INV-2026-0142 · DRAFT" as the bare number and its status chip (null if unrecognised). */
export function splitInvoiceNumber(label: string): { number: string; status: StatusSpec | null } {
  const word = label.split(" · ")[1]?.trim().toUpperCase()
  return { number: invoiceNumber(label), status: (word && STATUS_WORD[word]) || null }
}

/**
 * The detail's header line as icon rows. An event invoice's summary is
 * "Wedding · Sat Nov 7 · 6:00 – 11:00 PM · 4 of 5 staff" (ADR-019): what and when on the
 * first row, time and crew on the second. Anything else stays one row.
 */
export function InvoiceFacts({ period, event }: { period: string; event: boolean }) {
  const parts = period.split(" · ")
  const rows: [IconName, string][] =
    event && parts.length >= 4
      ? [
          ["calendar_month", parts.slice(0, 2).join(" · ")],
          ["schedule", parts.slice(2).join(" · ")],
        ]
      : [["calendar_month", period]]
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {rows.map(([icon, text]) => (
        <li key={icon} className="flex items-center gap-2 text-14 text-fg-2">
          <Icon name={icon} filled size={16} className="text-accent-text" />
          {text}
        </li>
      ))}
    </ul>
  )
}
