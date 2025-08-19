"use client";

import { useState, useMemo } from "react";
import { Plus, Building, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import type { Facility } from "@/types";
import FacilityStatsCards from "@/components/facilities/facilityStatsCard";
import FacilityTable from "@/components/facilities/facilityTable";
import FacilityModal from "@/components/facilities/facilityModal";
import FacilityFilters from "@/components/facilities/facilityFilters";
import ReviewModal from "@/components/facilities/reviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FacilitiesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

const FacilityManagement = () => {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [alert, setAlert] = useState<{
    type: "default" | "destructive";
    message: string;
  } | null>(null);

  // Real-time updates for facilities
  useRealtimeUpdates({
    queryKeys: ["facilities-company"],
    events: ["InventoryCreated", "InventoryUpdated", "InventoryDeleted"],
    showNotifications: true,
    notificationTitle: "Facility Update",
  });

  // Queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["facilities-company"],
    queryFn: () => FacilitiesAPI.listCompany(),
  });

  // Mutations
  const updateFacilityMutation = useMutation({
    mutationFn: ({
      id,
      payload,
      files,
      removedImageIds,
    }: {
      id: string;
      payload: Record<string, any>;
      files?: File[];
      removedImageIds?: string[];
    }) => FacilitiesAPI.update(id, payload, files, removedImageIds),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Facility updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["facilities-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update facility",
      });
    },
  });

  const deleteFacilityMutation = useMutation({
    mutationFn: (facilityId: string) => FacilitiesAPI.remove(facilityId),
    onSuccess: (_, facilityId) => {
      const facility = facilities.find((f) => f._id === facilityId);
      toast({
        title: "Success",
        description: `Facility ${
          facility?.isDeleted ? "restored" : "deleted"
        } successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["facilities-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete facility",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, facility }: { id: string; facility: Facility }) =>
      FacilitiesAPI.update(id, facility),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Facility status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["facilities-company"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
      });
    },
  });

  const facilities = data?.facilities || [];

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch =
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "any" ||
        !statusFilter ||
        (statusFilter === "active" &&
          facility.isActive &&
          !facility.isDeleted) ||
        (statusFilter === "inactive" &&
          (!facility.isActive || facility.isDeleted));

      return matchesSearch && matchesStatus;
    });
  }, [facilities, searchTerm, statusFilter]);

  // Loading and error states
  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <ErrorComponent message={error?.message} />;
  }

  // Event handlers
  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveFacility = async (
    facilityData: Partial<Facility>,
    rawFiles: File[],
    removedImageIds: string[]
  ) => {
    // Create a clean copy of the facility data
    const cleanData = { ...facilityData };

    // Remove any non-serializable properties
    delete (cleanData as any).files;
    delete (cleanData as any).rawFiles;

    // Add removedImageIds if provided
    if (removedImageIds && removedImageIds.length > 0) {
      (cleanData as any).removedImageIds = removedImageIds;
    }

    updateFacilityMutation.mutate({
      id: facilityData._id!,
      payload: cleanData,
      files: rawFiles,
      removedImageIds: removedImageIds,
    });

    setShowModal(false);
    setSelectedFacility(null);
    setIsEdit(false);
  };

  const handleDeleteFacility = async (facilityId: string) => {
    const facility = facilities.find((f) => f._id === facilityId);
    if (
      !facility?.isDeleted &&
      !window.confirm("Are you sure you want to delete this facility?")
    ) {
      return;
    }

    deleteFacilityMutation.mutate(facilityId);
  };

  const handleToggleStatus = async (facilityId: string) => {
    const facility = facilities.find((f) => f._id === facilityId);
    if (!facility) return;

    toggleStatusMutation.mutate({ id: facilityId, facility });
  };

  const handleReviews = (facility: Facility) => {
    setSelectedFacility(facility);
    setShowReviewModal(true);
    setAlert(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Facility Management
              </h1>
            </div>
            <p className="text-gray-600">Manage your rental facilities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link
                href="/admin/facilities/create"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Facility
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <FacilityStatsCards facilities={facilities} />

        {/* Main Content */}

        {/* Filters */}
        <FacilityFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters}
        />

        {filteredFacilities.length > 0 ? (
          <FacilityTable
            onViewReviews={handleReviews}
            facilities={filteredFacilities}
            onEdit={handleEditFacility}
            onDelete={handleDeleteFacility}
            onToggleStatus={handleToggleStatus}
          />
        ) : (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                No items found
              </h5>
              <p className="text-gray-600">
                Try adjusting your search criteria or add new facilities.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <FacilityModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setSelectedFacility(null);
            setIsEdit(false);
          }}
          facility={selectedFacility}
          onSave={handleSaveFacility}
          isEdit={isEdit}
        />

        <ReviewModal
          show={showReviewModal}
          onHide={() => {
            setShowReviewModal(false);
            setSelectedFacility(null);
          }}
          facility={selectedFacility}
        />
      </div>
    </div>
  );
};

export default FacilityManagement;
