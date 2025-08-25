"use client";

import { useState } from "react";
import Link from "next/link";
import type { InventoryItem } from "@/types";
import EditInventoryModal from "@/components/inventory/editInventoryModal";
import InventoryStatsCards from "@/components/inventory/inventoryStatCards";
import InventoryFilters from "@/components/inventory/invenoryFilters";
import InventoryTable from "@/components/inventory/InventoryTable";
import { ReturnRequestModal } from "@/components/inventory/ReturnRequestModal";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { InventoryAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returningItem, setReturningItem] = useState<InventoryItem | null>(null);

  // Real-time updates for inventory
  useRealtimeUpdates({
    queryKeys: ["inventory-company"],
    events: ["InventoryCreated", "InventoryUpdated", "InventoryDeleted"],
    showNotifications: true,
    notificationTitle: "Inventory Update",
  });

  // Queries
  const {
    data: rentals,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory-company"],
    queryFn: () => InventoryAPI.listCompany(),
  });

  // Mutations
  const updateItemMutation = useMutation({
    mutationFn: ({
      item,
      rawFiles,
      removedImageIds,
    }: {
      item: InventoryItem;
      rawFiles: File[];
      removedImageIds?: string[];
    }) => {
      // Create a clean copy for the API
      const cleanItem = JSON.parse(
        JSON.stringify(item, (key, value) => {
          // Filter out File objects and functions
          if (value instanceof File || typeof value === "function") {
            return undefined;
          }
          return value;
        })
      );

      return InventoryAPI.update(
        item._id,
        cleanItem,
        rawFiles,
        removedImageIds
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => InventoryAPI.remove(itemId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
      });
    },
  });

  const restoreItemMutation = useMutation({
    mutationFn: (itemId: string) => InventoryAPI.restore(itemId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore item",
      });
    },
  });

  // Loading and error states
  if (isLoading) {
    return <Loader />;
  }

  if (isError || !rentals) {
    return <ErrorComponent message={error?.message} onRetry={refetch} />;
  }

  // Filter items
  const filteredItems = (rentals as InventoryItem[]).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Event handlers
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveItem = async (
    updatedItem: InventoryItem,
    rawFiles: File[],
    removedImageIds: string[]
  ) => {
    // Create a clean copy of the item without any File objects or functions
    const cleanItem = { ...updatedItem };

    // Process facility ID if needed
    if (cleanItem.associatedFacility) {
      cleanItem.associatedFacility = (cleanItem.associatedFacility as any)._id;
    }

    // Remove any non-serializable properties
    delete (cleanItem as any).files;
    delete (cleanItem as any).rawFiles;

    // Add removedImageIds to the payload if needed
    if (removedImageIds && removedImageIds.length > 0) {
      (cleanItem as any).removedImageIds = removedImageIds;
    }

    updateItemMutation.mutate({ item: cleanItem, rawFiles, removedImageIds });
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleRestore = async (itemId: string) => {
    restoreItemMutation.mutate(itemId);
  };

  const handleReturnRequest = (item: InventoryItem) => {
    setReturningItem(item);
    setShowReturnModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventory Management
            </h1>
            <p className="text-gray-600">
              Manage your facility equipment and items
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link
                href="/admin/inventory/create"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <InventoryStatsCards items={rentals as InventoryItem[]} />

        {/* Filters */}
        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredCount={filteredItems.length}
          totalCount={(rentals as InventoryItem[]).length}
        />

        {/* Items Table or Empty State */}
        {filteredItems.length > 0 ? (
          <InventoryTable
            items={filteredItems}
            onEdit={handleEdit}
            onRestore={handleRestore}
            onDelete={handleDelete}
            onReturnRequest={handleReturnRequest}
          />
        ) : (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                No items found
              </h5>
              <p className="text-gray-600">
                Try adjusting your search criteria or add new items.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <EditInventoryModal
        item={editingItem}
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      {/* Return Request Modal */}
      {returningItem && (
        <ReturnRequestModal
          item={returningItem}
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setReturningItem(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["inventory-company"] });
          }}
        />
      )}
    </div>
  );
}
