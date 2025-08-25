"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { InvoicesAPI } from "@/lib/api";
import { Plus, Trash2, Save } from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0,
      },
    ] as InvoiceItem[],
    currency: "GHS",
    dueDate: "",
    notes: "",
    terms: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateItemAmount = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = (subtotal * item.taxRate) / 100;
    return subtotal + tax;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate) / 100,
      0
    );
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount
    newItems[index].amount = calculateItemAmount(newItems[index]);
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          amount: 0,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerInfo.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerInfo.email.trim()) {
      toast({
        title: "Error",
        description: "Customer email is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dueDate) {
      toast({
        title: "Error",
        description: "Due date is required",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals();
    if (total <= 0) {
      toast({
        title: "Error",
        description: "Invoice total must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const invoiceData = {
        customerInfo: formData.customerInfo,
        items: formData.items,
        subtotal,
        taxAmount,
        totalAmount: total,
        currency: formData.currency,
        dueDate: new Date(formData.dueDate),
        notes: formData.notes,
        terms: formData.terms,
      };

      await InvoicesAPI.create(invoiceData);

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        customerInfo: {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
        items: [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            amount: 0,
          },
        ],
        currency: "GHS",
        dueDate: "",
        notes: "",
        terms: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 py-4 pr-4">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: {
                          ...formData.customerInfo,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: {
                          ...formData.customerInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter customer email"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: {
                          ...formData.customerInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter customer phone"
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    value={formData.customerInfo.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: {
                          ...formData.customerInfo,
                          address: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter customer address"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (Ghana Cedi)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invoice Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Input
                          id={`description-${index}`}
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                        <Input
                          id={`unitPrice-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`taxRate-${index}`}>Tax Rate (%)</Label>
                        <Input
                          id={`taxRate-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) =>
                            handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        Amount: {formData.currency} {item.amount.toFixed(2)}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formData.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formData.currency} {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formData.currency} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes for the invoice"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.value })
                  }
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}