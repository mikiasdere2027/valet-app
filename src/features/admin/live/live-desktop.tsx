"use client"

import { useState } from "react"
import Link from "next/link"

import { AttentionCard, ChipGroup, Icon, StatusBadge, ToastPill } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LiveSlot } from "@/lib/data/admin/ops-schemas"

import { sheetSlots, type EventSummary, type Pulse } from "@/lib/live/model"
import { attentionActions, LiveDot, SlotBar, SlotRow, Trend } from "./live-parts"
import { StaffLocationModal } from "./staff-location-modal"
import type { LiveBoard } from "./use-live-board"

type Day = "today" | "tomorrow" | "pick"
const DAYS: { value: Day; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "pick", label: "Pick date" },
]

function Kpi({
  label,
  kpi,
  pulse,
  yesterday,
  tone,
  first,
}: {
  label: string
  kpi: keyof Pulse
  pulse: Pulse
  yesterday: Pulse | null
  tone?: "bad"
  first?: boolean
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-1.5 border-r border-line last:border-r-0",
        first ? "px-8 py-4.5" : "px-6 py-4.5",
      )}
    >
      <span
        className={cn(
          "font-display text-40 leading-x100 font-bold tracking-n040 tabular-nums",
          tone === "bad" && "text-bad",
        )}
      >
        {pulse[kpi]}
      </span>
      <span className="text-14 font-medium text-fg-2">{label}</span>
      <Trend kpi={kpi} pulse={pulse} yesterday={yesterday} className="absolute top-4.5 right-5" />
    </div>
  )
}

function DesktopEventRow({
  event,
  selected,
  onSelect,
}: {
  event: EventSummary
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-current={selected || undefined}
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-r16 border-0 px-4 py-3.5 text-left text-fg transition-[transform,background-color] duration-160 active:scale-98",
        selected
          ? "bg-surface shadow-[inset_0_0_0_1px_var(--line)]"
          : "bg-transparent hover:bg-surface/60",
      )}
    >
      <div className="flex w-full items-start gap-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.75">
          <span className="text-16 leading-x125 font-semibold">{event.venue}</span>
          <span className="text-13 text-fg-2">
            {event.time} · {event.rel}
          </span>
        </div>
        <StatusBadge status={event.health.status} size="sm" />
      </div>
      <SlotBar bar={event.bar} label={event.legend} className="h-2" />
      <div className="flex w-full justify-between text-13 font-medium text-fg-2">
        <span>{event.legend}</span>
        <span className="font-semibold text-fg">{event.filledOf}</span>
      </div>
    </button>
  )
}

const PANE = "no-scrollbar min-h-0 overflow-y-auto"
/** White card on the warm page ground, like the invoice page (Regency mockup). */
const CARD = "rounded-r24 border border-line bg-elev"
const ACTION = "h-10 px-3.5 text-14 whitespace-nowrap"

/** Live Board for 1100 px and wider: KPI card, then event list, roster and attention as three cards. */
export function LiveDesktop({ board }: { board: LiveBoard }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [day, setDay] = useState<Day>("today")
  const [viewSlot, setViewSlot] = useState<LiveSlot | null>(null)
  const { pulse } = board
  const trend = { pulse, yesterday: board.yesterday }
  const selected = board.summaries.find((e) => e.id === selectedId) ?? board.summaries[0]

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="mb-5 flex items-center gap-4 border-b border-line bg-elev px-8 py-5">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="m-0 font-display text-34 leading-x100 font-bold tracking-n030">
            Live Board
          </h1>
          <span className="flex items-center gap-2 text-14 font-medium whitespace-nowrap text-fg-2">
            <LiveDot />
            <span>
              · updated{" "}
              {board.updatedAt ? new Date(board.updatedAt).toLocaleTimeString("en-US") : "…"} ·
              venue times {board.zone}
            </span>
          </span>
        </div>
        <ChipGroup label="Day" items={DAYS} value={day} onValueChange={setDay} />
        <label className="flex h-11 w-60 items-center gap-2 rounded-pill bg-surface px-4 text-15 text-fg-2">
          <Icon name="search" size={20} />
          <input
            type="search"
            aria-label="Find a person or venue"
            placeholder="Find a person or venue"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-15 text-fg outline-none placeholder:text-fg-2"
          />
        </label>
        <Button
          variant="accent"
          size="compact"
          className="h-11 gap-1.5 px-5"
          nativeButton={false}
          render={<Link href="/admin/events/new" />}
        >
          <Icon name="add" size={20} />
          New event
        </Button>
      </header>

      <div className={cn(CARD, "mx-8 grid grid-cols-5 overflow-hidden")}>
        <Kpi first label="Need you" kpi="need" {...trend} tone="bad" />
        <Kpi label="Events live" kpi="live" {...trend} />
        <Kpi label="On shift" kpi="onShift" {...trend} />
        <Kpi label="Expected, not here" kpi="expected" {...trend} />
        <Kpi label="Open slots today" kpi="open" {...trend} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_21.25rem] gap-5 px-8 pt-5 pb-6">
        <section aria-label="Events" className={cn(PANE, CARD, "flex flex-col gap-1 p-2")}>
          {board.summaries.map((event) => (
            <DesktopEventRow
              key={event.id}
              event={event}
              selected={event.id === selected?.id}
              onSelect={() => setSelectedId(event.id)}
            />
          ))}
        </section>

        {selected && (
          <section
            aria-label={`${selected.venue} roster`}
            className={cn(PANE, CARD, "flex flex-col gap-3.5 px-6 py-5")}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex flex-1 flex-col gap-0.75">
                <h2 className="m-0 font-display text-24 leading-x115 font-bold tracking-n025">
                  {selected.venue}
                </h2>
                <span className="text-14 text-fg-2">
                  {selected.time} · {selected.rel}
                </span>
              </div>
              <StatusBadge status={selected.health.status} size="sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="xs"
                className={ACTION}
                onClick={() => board.addSlot(selected.id)}
              >
                Add slot
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className={ACTION}
                onClick={() => board.broadcastEvent(selected.id)}
              >
                Broadcast
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className={ACTION}
                onClick={() => board.messageCrew(selected.id)}
              >
                Message crew
              </Button>
            </div>
            <ul className="m-0 flex list-none flex-col border-t border-line p-0">
              {sheetSlots(selected).map(({ slot }) => (
                <SlotRow
                  key={slot.id}
                  compact
                  slot={slot}
                  onAssign={() => board.assign(selected.id)}
                  onView={setViewSlot}
                />
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Attention" className={cn(PANE, CARD, "flex flex-col gap-1 p-5")}>
          <h2 className="m-0 text-18 font-semibold tracking-n010">Attention · {pulse.need}</h2>
          {board.attention.map((item) => (
            <div
              key={item.key}
              className={cn(
                "flex-none border-b border-line pb-1 last:border-b-0",
                board.leaving[item.key] ? "animate-out" : "animate-fade",
              )}
            >
              <AttentionCard
                density="compact"
                variant="plain"
                primary="bad"
                tone={item.tone}
                icon={item.icon}
                title={item.title}
                meta={item.sub}
                selfie={item.selfie}
                selfieUrl={item.selfieUrl}
                actions={attentionActions(item, board.run)}
              />
            </div>
          ))}
          {board.attention.length === 0 && (
            <p className="m-0 text-15 text-fg-2">All clear. Nothing needs you right now.</p>
          )}
        </section>
      </div>

      <ToastPill message={board.toast} placement="bottom" />
      <StaffLocationModal
        slot={viewSlot}
        open={viewSlot !== null}
        onClose={() => setViewSlot(null)}
      />
    </div>
  )
}
