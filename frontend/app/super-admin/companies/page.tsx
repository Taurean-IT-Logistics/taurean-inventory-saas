"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuperAdminAPI } from "@/lib/api";
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
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

export default function SuperAdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "",
    duration: 30,
  });

  const queryClient = useQueryClient();

  // Queries
  const {
    data: companiesData,
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["super-admin-companies"],
    queryFn: SuperAdminAPI.getAllCompanies,
  });

  // Mutations
  const updateCompanyStatusMutation = useMutation({
    mutationFn: async ({ companyId, status }: { companyId: string; status: string }) => {
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
    mutationFn: async ({ companyId, plan, duration }: { companyId: string; plan: string; duration: number }) => {
      return SuperAdminAPI.activateCompanySubscription(companyId, plan, duration);
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
    setSelectedCompany((companiesData as any[])?.find((c: any) => c._id === companyId));
    setIsSubscriptionModalOpen(true);
  };

  const handleSubscriptionDeactivation = (companyId: string) => {
    deactivateSubscriptionMutation.mutate(companyId);
  };

  const filteredCompanies = (companiesData as any[])?.filter((company: any) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (companiesLoading) return <Loader text="Loading companies..." />;
  if (companiesError) return <ErrorComponent message="Failed to load companies" onRetry={refetchCompanies} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-600">Manage all companies in the system</p>
        </div>
        <div className="flex items-center gap-3">
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
        {filteredCompanies.map((company: any) => (
          <Card key={company._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
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
                    <DropdownMenuItem onClick={() => setSelectedCompany(company)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSubscriptionActivation(company._id)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  variant={company.isActive ? "default" : "secondary"}
                  className={company.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {company.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Subscription */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subscription:</span>
                <Badge
                  variant={company.subscription?.status === "active" ? "default" : "secondary"}
                  className={company.subscription?.status === "active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
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
                  onClick={() => handleStatusUpdate(company._id, company.isActive ? "inactive" : "active")}
                  disabled={updateCompanyStatusMutation.isPending}
                >
                  {company.isActive ? "Deactivate" : "Activate"}
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

      {/* Company Details Modal */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <p className="text-sm font-medium">{selectedCompany.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedCompany.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm font-medium">{selectedCompany.phone || "N/A"}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedCompany.isActive ? "default" : "secondary"}>
                    {selectedCompany.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              {selectedCompany.subscription && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Subscription Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Plan</Label>
                      <p className="text-sm font-medium">{selectedCompany.subscription.plan}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge variant={selectedCompany.subscription.status === "active" ? "default" : "secondary"}>
                        {selectedCompany.subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>Expires</Label>
                      <p className="text-sm font-medium">
                        {selectedCompany.subscription.expiresAt ? 
                          format(new Date(selectedCompany.subscription.expiresAt), "PPP") : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plan</Label>
              <Select value={subscriptionData.plan} onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, plan: value }))}>
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
                onChange={(e) => setSubscriptionData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
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
                      duration: subscriptionData.duration
                    });
                  }
                }}
                disabled={!subscriptionData.plan || activateSubscriptionMutation.isPending}
                className="flex-1"
              >
                {activateSubscriptionMutation.isPending ? "Activating..." : "Activate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}