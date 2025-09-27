"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tax } from "@/types";
import TaxStatsCards from "@/components/tax/taxStatsCard";
import TaxTable from "@/components/transactions/taxTable";
import TaxModal from "@/components/tax/taxModal";
import TaxFilters from "@/components/tax/taxFilters";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { TaxesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ErrorComponent } from "@/components/ui/error";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

const TaxManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filteredTaxes, setFilteredTaxes] = useState<Tax[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    appliesTo: "",
    status: "",
    type: "",
  });
  const [taxConfig, setTaxConfig] = useState({
    isTaxInclusive: false,
    isTaxOnTax: false,
    defaultTaxes: [] as string[],
  });

  // Real-time updates for taxes
  useRealtimeUpdates({
    queryKeys: ["taxes-company", "taxes"],
    events: ["TransactionCreated", "TransactionUpdated"],
    showNotifications: true,
    notificationTitle: "Tax Update",
  });

  // Determine if user is super admin
  const isSuperAdmin = user?.isSuperAdmin || user?.role === "superAdmin";

  // Fetch taxes based on user role
  const {
    data: taxes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: isSuperAdmin ? ["taxes-global"] : ["taxes-company"],
    queryFn: () => (isSuperAdmin ? TaxesAPI.list() : TaxesAPI.listCompany()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create tax mutation
  const createTaxMutation = useMutation({
    mutationFn: TaxesAPI.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax created successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: isSuperAdmin ? ["taxes-global"] : ["taxes-company"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tax",
        variant: "destructive",
      });
    },
  });

  // Update tax mutation
  const updateTaxMutation = useMutation({
    mutationFn: (tax: Tax) => TaxesAPI.update(tax._id, tax),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax updated successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: isSuperAdmin ? ["taxes-global"] : ["taxes-company"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax",
        variant: "destructive",
      });
    },
  });

  // Delete tax mutation
  const deleteTaxMutation = useMutation({
    mutationFn: (taxId: string) => TaxesAPI.remove(taxId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax deleted successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: isSuperAdmin ? ["taxes-global"] : ["taxes-company"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tax",
        variant: "destructive",
      });
    },
  });

  // Toggle tax status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (tax: Tax) =>
      TaxesAPI.update(tax._id, { ...tax, active: !tax.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isSuperAdmin ? ["taxes-global"] : ["taxes-company"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tax status",
        variant: "destructive",
      });
    },
  });

  // Apply filters whenever taxes or filters change
  useEffect(() => {
    if (!taxes) return;

    let filtered = [...(taxes as Tax[])];

    // Sort taxes with VAT at the top
    filtered.sort((a, b) => {
      if (a.name.toLowerCase() === "vat") return -1;
      if (b.name.toLowerCase() === "vat") return 1;
      return a.name.localeCompare(b.name);
    });

    if (filters.search) {
      filtered = filtered.filter(
        (tax) =>
          tax.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          tax.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.appliesTo) {
      filtered = filtered.filter((tax) => tax.appliesTo === filters.appliesTo);
    }

    if (filters.status) {
      const isActive = filters.status === "active";
      filtered = filtered.filter((tax) => tax.active === isActive);
    }

    if (filters.type) {
      filtered = filtered.filter((tax) =>
        tax.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    setFilteredTaxes(filtered);
  }, [taxes, filters]);

  const handleCreateTax = () => {
    setSelectedTax(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEditTax = (tax: Tax) => {
    setSelectedTax(tax);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveTax = async (taxData: Tax) => {
    try {
      if (isEdit && selectedTax) {
        await updateTaxMutation.mutateAsync({
          ...taxData,
          _id: selectedTax._id,
        });
      } else {
        await createTaxMutation.mutateAsync(taxData);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving tax:", error);
    }
  };

  const handleDeleteTax = async (taxId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this tax? This action cannot be undone."
      )
    ) {
      try {
        await deleteTaxMutation.mutateAsync(taxId);
      } catch (error) {
        console.error("Error deleting tax:", error);
      }
    }
  };

  const handleToggleStatus = async (tax: Tax) => {
    try {
      await toggleStatusMutation.mutateAsync(tax);
    } catch (error) {
      console.error("Error toggling tax status:", error);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      appliesTo: "",
      status: "",
      type: "",
    });
  };

  if (isLoading) {
    return <Loader text="Loading taxes..." />;
  }

  if (isError) {
    return <ErrorComponent message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Tax Management
              </h1>
              <p className="text-gray-600">
                {isSuperAdmin
                  ? "Configure and manage global tax rates for all companies"
                  : "Configure and manage tax rates for your company"}
              </p>
              {isSuperAdmin && (
                <p className="text-sm text-blue-600 mt-1">
                  You are managing global taxes that apply to all companies
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateTax}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Tax
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <TaxStatsCards taxes={taxes as Tax[]} />

        {/* Tax Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tax Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="taxInclusive"
                  checked={taxConfig.isTaxInclusive}
                  onChange={(e) =>
                    setTaxConfig({
                      ...taxConfig,
                      isTaxInclusive: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <label htmlFor="taxInclusive" className="text-sm font-medium">
                  Tax Inclusive Pricing
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Prices include taxes in the displayed amount
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="taxOnTax"
                  checked={taxConfig.isTaxOnTax}
                  onChange={(e) =>
                    setTaxConfig({ ...taxConfig, isTaxOnTax: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="taxOnTax" className="text-sm font-medium">
                  Tax on Tax (Compound Taxation)
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Apply taxes on top of other taxes
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                // Save tax configuration
                toast({
                  title: "Configuration Saved",
                  description: "Tax configuration has been updated",
                });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Filters */}
        <TaxFilters
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Tax Table */}
        <div className="bg-white rounded-lg shadow">
          <TaxTable
            taxes={filteredTaxes}
            onEdit={handleEditTax}
            onDelete={handleDeleteTax}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Tax Modal */}
        <TaxModal
          tax={selectedTax}
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSaveTax}
          isEdit={isEdit}
        />
      </div>
    </div>
  );
};

export default TaxManagement;
