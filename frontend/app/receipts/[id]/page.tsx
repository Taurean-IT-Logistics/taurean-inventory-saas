"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { InvoicesAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data: mine } = useQuery({ queryKey: ["my-receipts"], queryFn: () => InvoicesAPI.receiptsMine() })
  const { data: company } = useQuery({ queryKey: ["company-receipts"], queryFn: () => InvoicesAPI.receiptsCompany() })

  const receipt = useMemo(() => {
    const all = [...(mine?.receipts || mine || []), ...(company?.receipts || company || [])]
    return all.find((r: any) => String(r._id || r.id) === String(id))
  }, [mine, company, id])

  const onPrint = () => window.print()

  if (!receipt) return <div className="max-w-3xl mx-auto px-4 pt-28">Receipt not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12 print:pt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Receipt</h1>
        <Button onClick={onPrint}>Print / Save PDF</Button>
      </div>
      <div className="border rounded-md p-6 bg-white">
        <div className="mb-4">
          <div>Invoice: {receipt.invoice}</div>
          <div>Amount: {receipt.amount}</div>
          <div>Date: {new Date(receipt.createdAt || receipt.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}