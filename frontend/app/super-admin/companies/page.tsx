"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResourceUrl, SuperAdminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Building2,
  Users,
  Activity,
  Search,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  Percent,
  File,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Logo from "@/components/logo/Logo";

export default function SuperAdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "",
    duration: 30,
  });
  const [selectedCompanyDetails, setSelectedCompanyDetails] =
    useState<any>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const {
    data: companiesData,
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["super-admin-companies"],
    queryFn: async () => {
      const response = await SuperAdminAPI.getAllCompanies();
      console.log(response);
      return response;
    },
  });

  // Company details query (includes taxes and tax schedules)
  const {
    data: companyDetailsData,
    isLoading: companyDetailsLoading,
    refetch: refetchCompanyDetails,
  } = useQuery({
    queryKey: ["super-admin-company-details", selectedCompanyDetails?._id],
    queryFn: () => SuperAdminAPI.getCompanyDetails(selectedCompanyDetails._id),
    enabled: !!selectedCompanyDetails?._id,
  });

  // Mutations
  const updateCompanyStatusMutation = useMutation({
    mutationFn: async ({
      companyId,
      status,
    }: {
      companyId: string;
      status: string;
    }) => {
      return SuperAdminAPI.updateCompanyStatus(companyId, status);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company status",
        variant: "destructive",
      });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async ({
      companyId,
      plan,
      duration,
    }: {
      companyId: string;
      plan: string;
      duration: number;
    }) => {
      return SuperAdminAPI.activateCompanySubscription(
        companyId,
        plan,
        duration
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company subscription activated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
      setIsSubscriptionModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription",
        variant: "destructive",
      });
    },
  });

  const deactivateSubscriptionMutation = useMutation({
    mutationFn: async (companyId: string) => {
      return SuperAdminAPI.deactivateCompanySubscription(companyId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company subscription deactivated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["super-admin-companies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate subscription",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (companyId: string, status: string) => {
    updateCompanyStatusMutation.mutate({ companyId, status });
  };

  const handleSubscriptionActivation = (companyId: string) => {
    setSelectedCompany(
      (companiesData as any)?.companies?.find((c: any) => c._id === companyId)
    );
    setIsSubscriptionModalOpen(true);
  };

  const handleSubscriptionDeactivation = (companyId: string) => {
    deactivateSubscriptionMutation.mutate(companyId);
  };

  const handleViewCompanyDetails = (company: any) => {
    setSelectedCompanyDetails(company);
    setShowCompanyDetails(true);
  };

  // Handle plan changes and update duration accordingly
  useEffect(() => {
    if (subscriptionData.plan) {
      // Set default duration based on plan
      let defaultDuration = 30;
      switch (subscriptionData.plan) {
        case "free_trial":
          defaultDuration = 14;
          break;
        case "monthly":
          defaultDuration = 30;
          break;
        case "biannual":
          defaultDuration = 180;
          break;
        case "annual":
          defaultDuration = 365;
          break;
        default:
          defaultDuration = 30;
      }

      // Always update duration when plan changes
      setSubscriptionData((prev) => ({ ...prev, duration: defaultDuration }));
    }
  }, [subscriptionData.plan]);

  if (companiesLoading) return <Loader text="Loading companies..." />;

  if (companiesError)
    return (
      <ErrorComponent
        message="Failed to load companies"
        onRetry={refetchCompanies}
      />
    );

  const filteredCompanies =
    (companiesData as any)?.companies?.filter(
      (company: any) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Companies Management
          </h1>
          <p className="text-gray-600">Manage all companies in the system</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Super Admin License */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <div className="text-sm">
                  <div className="font-medium text-purple-900">Super Admin</div>
                  <div className="text-xs text-purple-700">Full Access</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies?.map((company: any) => (
          <Card key={company._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                    {company.logo?.path ? (
                      <Logo
                        logo={getResourceUrl(company.logo.path)}
                        height={40}
                        width={40}
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <p className="text-sm text-gray-600">{company.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewCompanyDetails(company)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSubscriptionActivation(company._id)}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 mr-4">Status:</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={company.isActive ? "default" : "secondary"}
                    className={
                      company.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {company.name === "Taurean IT" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 border-purple-200"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Subscription */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 mr-4">
                  Subscription:
                </span>
                <Badge
                  variant={
                    company.subscription?.status === "active"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    company.subscription?.status === "active"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {company.subscription?.status || "None"}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {company.stats?.userCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {company.stats?.facilityCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Facilities</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    handleStatusUpdate(
                      company._id,
                      company.isActive ? "inactive" : "active"
                    )
                  }
                  disabled={
                    updateCompanyStatusMutation.isPending ||
                    company.name === "Taurean IT"
                  }
                >
                  {company.name === "Taurean IT"
                    ? "Protected"
                    : company.isActive
                    ? "Deactivate"
                    : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSubscriptionActivation(company._id)}
                >
                  Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Modal */}
      <Dialog
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plan</Label>
              <Select
                value={subscriptionData.plan}
                onValueChange={(value) =>
                  setSubscriptionData((prev) => ({ ...prev, plan: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_trial">Free Trial</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biannual">Bi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input
                type="number"
                value={subscriptionData.duration}
                onChange={(e) =>
                  setSubscriptionData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 30,
                  }))
                }
                min="1"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedCompany && subscriptionData.plan) {
                    activateSubscriptionMutation.mutate({
                      companyId: selectedCompany._id,
                      plan: subscriptionData.plan,
                      duration: subscriptionData.duration,
                    });
                  }
                }}
                disabled={
                  !subscriptionData.plan ||
                  activateSubscriptionMutation.isPending
                }
                className="flex-1"
              >
                {activateSubscriptionMutation.isPending
                  ? "Activating..."
                  : "Activate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comprehensive Company Details Modal */}
      <Dialog open={showCompanyDetails} onOpenChange={setShowCompanyDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details - {selectedCompanyDetails?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCompanyDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        Company Name
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.description}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Owner</Label>
                      <p className="text-sm text-gray-600">
                        {(selectedCompanyDetails.owner as any)?.name} (
                        {(selectedCompanyDetails.owner as any)?.email})
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Email
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.contactEmail}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Phone
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.contactPhone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Subscription & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge
                        variant={
                          selectedCompanyDetails.isActive
                            ? "default"
                            : "secondary"
                        }
                        className={
                          selectedCompanyDetails.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedCompanyDetails.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Plan</Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.subscription?.plan || "No plan"}
                      </p>
                    </div>
                    {selectedCompanyDetails.subscription?.expiresAt && (
                      <div>
                        <Label className="text-sm font-medium">Expires</Label>
                        <p className="text-sm text-gray-600">
                          {format(
                            new Date(
                              selectedCompanyDetails.subscription.expiresAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">
                        Fee Percentage
                      </Label>
                      <p className="text-sm text-gray-600">
                        {selectedCompanyDetails.feePercent || 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Registration Documents */}
              {selectedCompanyDetails.registrationDocs &&
                selectedCompanyDetails.registrationDocs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Registration Documents (
                        {selectedCompanyDetails.registrationDocs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCompanyDetails.registrationDocs.map(
                          (doc: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {doc.originalName ||
                                      doc.path?.split("/").pop() ||
                                      `Document ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.size
                                      ? `${(doc.size / 1024 / 1024).toFixed(
                                          2
                                        )} MB`
                                      : "Unknown size"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const url = getResourceUrl(doc.path);
                                  window.open(url, "_blank");
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Company Taxes */}
              {(companyDetailsData as any)?.taxes &&
                (companyDetailsData as any).taxes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Company Taxes (
                        {(companyDetailsData as any).taxes.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(companyDetailsData as any).taxes.map((tax: any) => (
                          <div
                            key={tax._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <Receipt className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {tax.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {tax.rate}% - {tax.type} - {tax.taxType}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={tax.active ? "default" : "secondary"}
                            >
                              {tax.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Tax Schedules */}
              {(companyDetailsData as any)?.taxSchedules &&
                (companyDetailsData as any).taxSchedules.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Tax Schedules (
                        {(companyDetailsData as any).taxSchedules.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(companyDetailsData as any).taxSchedules.map(
                          (schedule: any) => (
                            <div
                              key={schedule._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {schedule.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {schedule.components?.length || 0}{" "}
                                    components -
                                    {schedule.effectiveFrom &&
                                      format(
                                        new Date(schedule.effectiveFrom),
                                        "MMM dd, yyyy"
                                      )}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  schedule.isActive ? "default" : "secondary"
                                }
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCompanyDetails.stats?.userCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Users</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCompanyDetails.stats?.facilityCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Facilities</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCompanyDetails.stats?.bookingCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedCompanyDetails.stats?.transactionCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
