"use client"

import React from "react"

const CODES = [
  { code: "+233", label: "Ghana" },
  { code: "+234", label: "Nigeria" },
  { code: "+44", label: "United Kingdom" },
  { code: "+1", label: "United States" },
  { code: "+49", label: "Germany" },
  { code: "+33", label: "France" },
  { code: "+39", label: "Italy" },
  { code: "+34", label: "Spain" },
]

export function PhoneInput({
  value,
  onChange,
  defaultCode = "+233",
}: {
  value: string
  onChange: (v: string) => void
  defaultCode?: string
}) {
  const [code, setCode] = React.useState(defaultCode)
  const [local, setLocal] = React.useState("")

  React.useEffect(() => {
    // parse incoming value
    if (value?.startsWith("+")) {
      const match = CODES.find((c) => value.startsWith(c.code))
      if (match) {
        setCode(match.code)
        setLocal(value.replace(match.code, "").trim())
      }
    }
  }, [])

  React.useEffect(() => {
    onChange(`${code} ${local}`.trim())
  }, [code, local])

  return (
    <div className="flex gap-2">
      <select
        className="border rounded-md px-2 py-2 bg-white"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      >
        {CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label} ({c.code})
          </option>
        ))}
      </select>
      <input
        className="border rounded-md px-3 py-2 flex-1"
        placeholder="Phone number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  )
}