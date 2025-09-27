"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Tax, TaxSchedule } from "@/types";
import TaxStatsCards from "@/components/tax/taxStatsCard";
import TaxTable from "@/components/transactions/taxTable";
import TaxModal from "@/components/tax/taxModal";
import TaxScheduleModal from "@/components/tax/taxScheduleModal";
import TaxFilters from "@/components/tax/taxFilters";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { TaxesAPI, TaxSchedulesAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { ErrorComponent } from "@/components/ui/error";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

const TaxManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("taxes");
  const [filteredTaxes, setFilteredTaxes] = useState<Tax[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<TaxSchedule[]>([]);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TaxSchedule | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  });
  const [scheduleFilters, setScheduleFilters] = useState({
    search: "",
    status: "",
    type: "",
  });

  // Real-time updates for taxes
  useRealtimeUpdates({
    queryKeys: ["taxes-company", "taxes", "tax-schedules"],
    events: ["TransactionCreated", "TransactionUpdated"],
    showNotifications: true,
    notificationTitle: "Tax Update",
  });

  // Determine if user is super admin
  const isSuperAdmin = user?.isSuperAdmin || user?.role === "superAdmin";

  // Fetch combined taxes (global + company)
  const {
    data: allTaxesData,
    isLoading: isLoadingTaxes,
    isError: isErrorTaxes,
    error: taxesError,
    refetch: refetchTaxes,
  } = useQuery({
    queryKey: ["taxes-combined"],
    queryFn: () => TaxesAPI.listCombined(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch global taxes (for super admin only)
  const {
    data: globalTaxes,
    isLoading: isLoadingGlobalTaxes,
    isError: isErrorGlobalTaxes,
    error: globalTaxesError,
    refetch: refetchGlobalTaxes,
  } = useQuery({
    queryKey: ["taxes-global"],
    queryFn: () => TaxesAPI.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: isSuperAdmin, // Only fetch for super admins
  });

  // Fetch company-specific taxes
  const {
    data: companyTaxes,
    isLoading: isLoadingCompanyTaxes,
    isError: isErrorCompanyTaxes,
    error: companyTaxesError,
    refetch: refetchCompanyTaxes,
  } = useQuery({
    queryKey: ["taxes-company"],
    queryFn: () => TaxesAPI.listCompany(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch tax schedules
  const {
    data: taxSchedules,
    isLoading: isLoadingSchedules,
    isError: isErrorSchedules,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["tax-schedules"],
    queryFn: () => TaxSchedulesAPI.list(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to extract array from API response
  const extractTaxesArray = (data: any): Tax[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.taxes)) {
        return data.taxes;
      } else if (Array.isArray(data.items)) {
        return data.items;
      }
    }
    return [];
  };

  // Use combined taxes data
  const allTaxes = useMemo(() => {
    return extractTaxesArray(allTaxesData);
  }, [allTaxesData]);
  const isLoading = isLoadingTaxes;
  const isError = isErrorTaxes;
  const error = taxesError;

  // Create tax mutation
  const createTaxMutation = useMutation({
    mutationFn: (taxData: any) => {
      if (isSuperAdmin && taxData.isSuperAdminTax) {
        return TaxesAPI.createGlobal(taxData);
      } else {
        return TaxesAPI.createCompany(taxData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax created successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: ["taxes-combined", "taxes-global", "taxes-company"],
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

  // Create tax schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: TaxSchedulesAPI.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tax schedule created successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: ["tax-schedules"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tax schedule",
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
        queryKey: ["taxes-combined", "taxes-global", "taxes-company"],
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
        queryKey: ["taxes-combined", "taxes-global", "taxes-company"],
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
      toast({
        title: "Success",
        description: "Tax status updated successfully!",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: ["taxes-combined", "taxes-global", "taxes-company"],
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
    if (!allTaxes || allTaxes.length === 0) return;

    let filtered = [...allTaxes];

    // Sort taxes with VAT at the top
    filtered.sort((a, b) => {
      if (a.name.toLowerCase() === "vat") return -1;
      if (b.name.toLowerCase() === "vat") return 1;
      return a.name.localeCompare(b.name);
    });

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter((tax) =>
        tax.name.toLowerCase().includes(filters.search.toLowerCase())
      );
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
  }, [allTaxes, filters]);

  // Helper function to extract schedules array from API response
  const extractSchedulesArray = (data: any): TaxSchedule[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.schedules)) {
        return data.schedules;
      } else if (Array.isArray(data.items)) {
        return data.items;
      }
    }
    return [];
  };

  // Apply filters for tax schedules
  useEffect(() => {
    if (!taxSchedules) return;

    const schedulesArray = extractSchedulesArray(taxSchedules);
    let filtered = [...schedulesArray];

    // Apply filters
    if (scheduleFilters.search) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.name
            .toLowerCase()
            .includes(scheduleFilters.search.toLowerCase()) ||
          schedule.description
            ?.toLowerCase()
            .includes(scheduleFilters.search.toLowerCase())
      );
    }

    if (scheduleFilters.status) {
      const isActive = scheduleFilters.status === "active";
      filtered = filtered.filter((schedule) => schedule.isActive === isActive);
    }

    if (scheduleFilters.type) {
      filtered = filtered.filter((schedule) =>
        schedule.type.toLowerCase().includes(scheduleFilters.type.toLowerCase())
      );
    }

    setFilteredSchedules(filtered);
  }, [taxSchedules, scheduleFilters]);

  const handleCreateTax = () => {
    setSelectedTax(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setIsEdit(false);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: TaxSchedule) => {
    setSelectedSchedule(schedule);
    setIsEdit(true);
    setShowScheduleModal(true);
  };

  const handleEditTax = (tax: Tax) => {
    setSelectedTax(tax);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveTax = async (taxData: Partial<Tax>) => {
    try {
      if (isEdit && selectedTax) {
        await updateTaxMutation.mutateAsync({ ...selectedTax, ...taxData });
      } else {
        await createTaxMutation.mutateAsync(taxData);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving tax:", error);
    }
  };

  const handleSaveSchedule = async (scheduleData: Partial<TaxSchedule>) => {
    try {
      if (isEdit && selectedSchedule) {
        // Update schedule logic would go here
        console.log("Update schedule:", scheduleData);
      } else {
        await createScheduleMutation.mutateAsync(scheduleData);
      }
      setShowScheduleModal(false);
    } catch (error) {
      console.error("Error saving tax schedule:", error);
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
      status: "",
      type: "",
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message={error?.message || "Failed to load taxes"}
        onRetry={() => {
          refetchTaxes();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? "Manage global taxes and tax schedules"
              : "Manage your company's taxes and tax schedules"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              refetchTaxes();
              refetchSchedules();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {activeTab === "taxes" && (
            <Button
              onClick={handleCreateTax}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Tax
            </Button>
          )}
          {activeTab === "schedules" && (
            <Button
              onClick={handleCreateSchedule}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Taxes
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Tax Schedules
          </TabsTrigger>
        </TabsList>

        {/* Taxes Tab */}
        <TabsContent value="taxes" className="space-y-6">
          {/* Stats Cards */}
          <TaxStatsCards taxes={allTaxes} />

          {/* Available Taxes */}
          <Card>
            <CardHeader>
              <CardTitle>Available Taxes ({filteredTaxes.length})</CardTitle>
              <CardDescription>
                {isSuperAdmin
                  ? "System-wide taxes available for companies to use in their schedules"
                  : "Choose from system-wide taxes or create your own custom taxes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {filteredTaxes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      No taxes available
                    </p>
                    <p className="text-sm">
                      Create your first tax to get started
                    </p>
                  </div>
                ) : (
                  filteredTaxes.map((tax) => (
                    <div
                      key={tax._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tax.active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <div>
                          <span className="text-sm font-medium">
                            {tax.name}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>({tax.rate}%)</span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${
                                tax.isSuperAdminTax
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {tax.isSuperAdminTax ? "System-wide" : "Custom"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tax Table */}
          <Card>
            <CardHeader>
              <CardTitle>Taxes</CardTitle>
              <CardDescription>
                {isSuperAdmin
                  ? "Global taxes available to all companies"
                  : "Your company's taxes and available global taxes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxFilters
                filters={filters}
                onFiltersChange={setFilters}
                isSuperAdmin={isSuperAdmin}
              />
              <TaxTable
                taxes={filteredTaxes}
                onEdit={handleEditTax}
                onDelete={handleDeleteTax}
                onToggleStatus={handleToggleStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          {/* Tax Configuration for Schedules */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation Settings</CardTitle>
              <CardDescription>
                Configure how taxes are calculated and applied in schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="taxInclusive"
                    checked={false} // This would come from company settings
                    onCheckedChange={(checked) => {
                      console.log("Tax inclusive:", checked);
                      // When inclusive is checked, uncheck exclusive
                      if (checked) {
                        console.log("Tax exclusive:", false);
                      }
                    }}
                  />
                  <label htmlFor="taxInclusive" className="text-sm font-medium">
                    Tax Inclusive
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="taxExclusive"
                    checked={true} // This would come from company settings
                    onCheckedChange={(checked) => {
                      console.log("Tax exclusive:", checked);
                      // When exclusive is checked, uncheck inclusive
                      if (checked) {
                        console.log("Tax inclusive:", false);
                      }
                    }}
                  />
                  <label htmlFor="taxExclusive" className="text-sm font-medium">
                    Tax Exclusive
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="taxOnTax"
                    checked={false} // This would come from company settings
                    onCheckedChange={(checked) => {
                      console.log("Tax on tax:", checked);
                    }}
                  />
                  <label htmlFor="taxOnTax" className="text-sm font-medium">
                    Tax on Tax
                  </label>
                </div>

                <div className="text-xs text-gray-500 ml-auto">
                  Choose either inclusive OR exclusive (not both)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Schedules</CardTitle>
              <CardDescription>
                Create and manage tax schedules for different periods and
                scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSchedules ? (
                <Loader />
              ) : isErrorSchedules ? (
                <ErrorComponent
                  message={
                    schedulesError?.message || "Failed to load tax schedules"
                  }
                  onRetry={refetchSchedules}
                />
              ) : (
                <div className="space-y-4">
                  {filteredSchedules.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Tax Schedules
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Create your first tax schedule to get started
                      </p>
                      <Button onClick={handleCreateSchedule}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredSchedules.map((schedule) => (
                        <div
                          key={schedule._id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{schedule.name}</h3>
                              <p className="text-sm text-gray-600">
                                {schedule.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Type: {schedule.type}</span>
                                <span>
                                  Value: {schedule.value}
                                  {schedule.type === "percentage" ? "%" : ""}
                                </span>
                                <span>
                                  Effective:{" "}
                                  {new Date(
                                    schedule.effectiveDate
                                  ).toLocaleDateString()}
                                </span>
                                {schedule.expiryDate && (
                                  <span>
                                    Expires:{" "}
                                    {new Date(
                                      schedule.expiryDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`px-2 py-1 rounded-full text-xs ${
                                  schedule.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tax Modal */}
      <TaxModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSaveTax}
        tax={selectedTax}
        isEdit={isEdit}
      />

      {/* Tax Schedule Modal */}
      <TaxScheduleModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleSaveSchedule}
        schedule={selectedSchedule}
        isEdit={isEdit}
        isLoading={createScheduleMutation.isPending}
        availableTaxes={allTaxes}
      />
    </div>
  );
};

export default TaxManagement;
