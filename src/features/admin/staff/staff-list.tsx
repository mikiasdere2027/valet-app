"use client"

import { useState, type ReactNode } from "react"

import { Icon, PillTabs } from "@/components/shared"
import type { StaffBucket, StaffList as StaffListData, StaffTab } from "@/lib/data"

import { AdminHead, AdminPage } from "../common/admin-page"
import { DataHead, DataRow, PersonCell, StatusCell } from "../common/data-table"
import { QueryState } from "../data/query-state"
import { useStaff } from "../data/queries"
import { InviteSheet } from "./invite-sheet"

function inTab(tab: StaffTab, bucket: StaffBucket): boolean {
  if (tab === "all") return true
  if (tab === "active") return bucket !== "invited" && bucket !== "inactive"
  return bucket === tab
}

/** Staff directory: search, status tabs and a table that collapses to two columns on phone. */
export function StaffList() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [tab, setTab] = useState<StaffTab>("all")
  const staff = useStaff()
  const data = staff.data
  const tabs = [
    { value: "all" as const, label: "All" },
    { value: "active" as const, label: "Active" },
    { value: "invited" as const, label: "Invited", count: data?.invited || undefined },
    { value: "alerts" as const, label: "Alerts off", count: data?.alertsOff || undefined },
  ]
  const tabsFor = (className?: string) => (
    <PillTabs label="Show" items={tabs} value={tab} onValueChange={setTab} className={className} />
  )

  return (
    <AdminPage>
      <AdminHead
        title="Staff"
        sub={
          data
            ? `${data.total} ${data.total === 1 ? "person" : "people"}${data.invited ? ` · ${data.invited} invite${data.invited === 1 ? "" : "s"} pending` : ""}`
            : "…"
        }
        cta={{ label: "Invite", icon: "person_add", onClick: () => setInviteOpen(true) }}
        tools={tabsFor()}
      />
      <QueryState query={staff} rows={6}>
        {/* Phone: the filters sit under the heading; from tablet they live in the top bar. */}
        {(list) => <Directory list={list} tab={tab} tabs={tabsFor("tablet:hidden")} />}
      </QueryState>
      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} />
    </AdminPage>
  )
}

function Directory({ list, tab, tabs }: { list: StaffListData; tab: StaffTab; tabs: ReactNode }) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const rows = list.rows.filter(
    (row) =>
      inTab(tab, row.bucket) &&
      (!q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)),
  )

  return (
    <>
      {tabs}
      <div className="flex flex-col gap-3.5">
        <label className="flex h-13 max-w-130 items-center gap-2.5 rounded-pill bg-surface px-4.5">
          <Icon name="search" size={22} className="text-fg-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${list.total} staff`}
            aria-label="Search staff"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-16 text-fg outline-none placeholder:text-fg-3"
          />
        </label>
        <DataHead columns={["Name", "Status", "Next shift", "This week"]} />
        <div className="flex flex-col border-t border-line">
          {rows.map((row) => (
            <DataRow key={row.id} href={`/admin/staff/person?id=${row.id}`}>
              <PersonCell name={row.name} sub={row.email} />
              <StatusCell status={row.status} />
              <span className="hidden text-15 text-fg-2 tablet:block">{row.next}</span>
              <span className="hidden text-right font-mono text-15 font-semibold tablet:block">
                {row.hours}
              </span>
            </DataRow>
          ))}
          {rows.length === 0 && (
            <p className="m-0 py-8 text-center text-15 text-fg-2">No one matches that.</p>
          )}
        </div>
      </div>
    </>
  )
}
