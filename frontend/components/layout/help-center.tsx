"use client"

import { Button } from "@/components/ui/button"

export function HelpCenter() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">Help Center</span>
        </div>
      </Button>
    </div>
  )
}
