import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { InvoiceFacts, Money, splitInvoiceNumber } from "./invoice-parts"

describe("splitInvoiceNumber", () => {
  it("separates the number from its status word", () => {
    const { number, status } = splitInvoiceNumber("INV-2026-0142 · DRAFT")
    expect(number).toBe("INV-2026-0142")
    expect(status?.label).toBe("Draft")
  })

  it("reads overdue without its day count", () => {
    expect(splitInvoiceNumber("INV-2026-0140 · OVERDUE").status?.label).toBe("Overdue")
  })

  it("has no chip for an unknown or missing status", () => {
    expect(splitInvoiceNumber("INV-2026-0143").status).toBeNull()
    expect(splitInvoiceNumber("INV-2026-0143 · VOID").status).toBeNull()
  })
})

describe("Money", () => {
  it("sets the cents apart from the dollars", () => {
    render(<Money cents={528_250} />)
    expect(screen.getByText(".50")).toBeInTheDocument()
    expect(screen.getByText(".50").parentElement).toHaveTextContent("$5,282.50")
  })
})

describe("InvoiceFacts", () => {
  it("splits an event summary into when and crew rows", () => {
    render(<InvoiceFacts period="Wedding · Sat Nov 7 · 6:00 – 11:00 PM · 4 of 5 staff" event />)
    expect(screen.getByText("Wedding · Sat Nov 7")).toBeInTheDocument()
    expect(screen.getByText("6:00 – 11:00 PM · 4 of 5 staff")).toBeInTheDocument()
  })

  it("keeps a period invoice's line whole", () => {
    render(<InvoiceFacts period="Oct 16 – 31, 2026 · from approved hours" event={false} />)
    expect(screen.getByText("Oct 16 – 31, 2026 · from approved hours")).toBeInTheDocument()
  })
})
