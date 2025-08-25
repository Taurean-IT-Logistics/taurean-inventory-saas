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
import { InventoryAPI } from "@/lib/api";
import { ArrowLeft, Package, AlertCircle } from "lucide-react";

interface ReturnRequestModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReturnRequestModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: ReturnRequestModalProps) {
  const [formData, setFormData] = useState({
    reason: "",
    condition: "good",
    description: "",
    returnDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the return",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await InventoryAPI.returnItem(item._id, {
        ...formData,
        itemId: item._id,
        itemName: item.name,
      });

      toast({
        title: "Success",
        description: "Return request submitted successfully",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit return request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Request Return
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4 pr-4">
            {/* Item Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Item Details</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {item.name}</p>
                <p><strong>SKU:</strong> {item.sku}</p>
                <p><strong>Status:</strong> {item.status}</p>
              </div>
            </div>

            {/* Return Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Return *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => handleInputChange("reason", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Item is damaged</SelectItem>
                    <SelectItem value="defective">Item is defective</SelectItem>
                    <SelectItem value="wrong_item">Wrong item received</SelectItem>
                    <SelectItem value="not_needed">No longer needed</SelectItem>
                    <SelectItem value="quality_issue">Quality issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Item Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleInputChange("condition", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="returnDate">Preferred Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange("returnDate", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Details</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Please provide any additional details about the return..."
                  rows={3}
                />
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <p>Please ensure the item is in the same condition as when received. Returns may be subject to inspection.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Return Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}