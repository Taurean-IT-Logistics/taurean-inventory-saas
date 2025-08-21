"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState(value || "")

  React.useEffect(() => {
    setSelectedTime(value || "")
  }, [value])

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setSelectedTime(time)
    onChange?.(time)
  }

  const handleQuickTimeSelect = (time: string) => {
    setSelectedTime(time)
    onChange?.(time)
  }

  const quickTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedTime && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime ? selectedTime : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Custom Time</Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {quickTimes.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTimeSelect(time)}
                  className={cn(
                    "text-xs",
                    selectedTime === time && "bg-primary text-primary-foreground"
                  )}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
