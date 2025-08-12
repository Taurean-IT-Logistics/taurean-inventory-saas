"use client"

import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export type BookedRange = { startDate: string; endDate: string }

export function AvailabilityCalendar({
  booked,
  onSelect,
}: {
  booked: BookedRange[]
  onSelect?: (date: Date) => void
}) {
  const disabled: { from: Date; to: Date }[] = booked
    .filter((b) => b.startDate && b.endDate)
    .map((b) => ({ from: new Date(b.startDate), to: new Date(b.endDate) }))

  return (
    <DayPicker
      mode="single"
      onDayClick={(d) => onSelect?.(d)}
      disabled={disabled}
      captionLayout="dropdown"
    />
  )
}