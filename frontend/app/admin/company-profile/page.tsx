"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyJoinRequestAPI, CompanyAPI } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Building2,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  Users,
  Edit,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
    phone: "",
    email: "",
    currency: "",
    feePercent: "",
    invoiceFormat: "",
    invoiceFormatType: "auto",
    invoiceFormatPrefix: "",
    invoiceFormatPadding: 4,
    invoiceFormatNextNumber: 1,
  });
  const [companyImage, setCompanyImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: userRequestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["user-join-requests"],
    queryFn: CompanyJoinRequestAPI.getUserRequests,
  });

  const userRequests =
    (userRequestsData as any)?.requests || userRequestsData || [];

  const requestToJoinMutation = useMutation({
    mutationFn: (companyId: string) =>
      CompanyJoinRequestAPI.requestToJoin(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-join-requests"] });
      toast({
        title: "Success",
        description: "Join request sent successfully!",
        variant: "default",
      });
      setSelectedCompany(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send join request",
        variant: "destructive",
      });
    },
  });

  const handleRequestToJoin = (companyId: string) => {
    requestToJoinMutation.mutate(companyId);
  };

  // Company update mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const companyId = (user?.company as any)?._id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }
      return CompanyAPI.update(companyId, formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company updated successfully!",
        variant: "default",
      });
      setIsEditMode(false);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  // Initialize edit form when user data changes
  React.useEffect(() => {
    if (user?.company && !isEditMode) {
      const company = user.company as any;

      // Format invoice format object as a readable string
      let invoiceFormatDisplay = "";
      if (company.invoiceFormat) {
        const format = company.invoiceFormat;
        if (format.type === "prefix" && format.prefix) {
          invoiceFormatDisplay = `${format.prefix}${String(
            format.nextNumber || 1
          ).padStart(format.padding || 4, "0")}`;
        } else if (format.type === "paystack") {
          invoiceFormatDisplay = `Paystack format with ${
            format.padding || 4
          } digit padding`;
        } else {
          invoiceFormatDisplay = `Auto format with ${
            format.padding || 4
          } digit padding`;
        }
      }

      setEditForm({
        name: company.name || "",
        description: company.description || "",
        location: company.location || "",
        website: company.website || "",
        phone: company.phone || "",
        email: company.email || "",
        currency: company.currency || "",
        feePercent: company.feePercent?.toString() || "",
        invoiceFormat: invoiceFormatDisplay,
        invoiceFormatType: company.invoiceFormat?.type || "auto",
        invoiceFormatPrefix: company.invoiceFormat?.prefix || "",
        invoiceFormatPadding: company.invoiceFormat?.padding || 4,
        invoiceFormatNextNumber: company.invoiceFormat?.nextNumber || 1,
      });
    }
  }, [user?.company, isEditMode]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setCompanyImage(null);
    setPreviewImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // Add form fields (excluding invoice format fields)
    Object.entries(editForm).forEach(([key, value]) => {
      if (value && !key.startsWith("invoiceFormat")) {
        formData.append(key, value.toString());
      }
    });

    // Construct invoice format object
    const invoiceFormat = {
      type: editForm.invoiceFormatType || "auto",
      prefix: editForm.invoiceFormatPrefix || "",
      nextNumber: editForm.invoiceFormatNextNumber || 1,
      padding: editForm.invoiceFormatPadding || 4,
    };
    formData.append("invoiceFormat", JSON.stringify(invoiceFormat));

    // Add image
    if (companyImage) {
      formData.append("file", companyImage);
    }

    updateCompanyMutation.mutate(formData);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Real company search using API
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["public-companies", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { companies: [] };
      const response = await CompanyAPI.getPublic(searchQuery);
      return response as { companies: any[] };
    },
    enabled: searchQuery.trim().length > 0,
  });

  const companies = (companiesData as any)?.companies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Company Profile Management
          </h1>
          <p className="text-gray-600">
            Manage company information, user join requests, and company settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.company ? (
                <div className="space-y-3">
                  {!isEditMode ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Company Details
                        </h3>
                        <Button
                          onClick={() => setIsEditMode(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900">
                          Company Name
                        </h3>
                        <p className="text-blue-700">
                          {(user.company as any)?.name || "N/A"}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900">
                          Your Role
                        </h3>
                        <p className="text-green-700 capitalize">{user.role}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-900">
                          Company Status
                        </h3>
                        <p className="text-purple-700 capitalize">
                          {(user.company as any)?.isActive
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-900">
                          Currency
                        </h3>
                        <p className="text-orange-700">
                          {(user.company as any)?.currency || "N/A"}
                        </p>
                      </div>
                      {(user.company as any)?.website && (
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-teal-900">
                            Website
                          </h3>
                          <a
                            href={(user.company as any)?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 hover:underline"
                          >
                            {(user.company as any)?.website}
                          </a>
                        </div>
                      )}
                      {(user.company as any)?.phone && (
                        <div className="bg-cyan-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-cyan-900">Phone</h3>
                          <p className="text-cyan-700">
                            {(user.company as any)?.phone}
                          </p>
                        </div>
                      )}
                      {(user.company as any)?.email && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900">Email</h3>
                          <a
                            href={`mailto:${(user.company as any)?.email}`}
                            className="text-blue-700 hover:underline"
                          >
                            {(user.company as any)?.email}
                          </a>
                        </div>
                      )}
                      {(user.company as any)?.feePercent && (
                        <div className="bg-amber-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-amber-900">
                            Fee Percentage
                          </h3>
                          <p className="text-amber-700">
                            {(user.company as any)?.feePercent}%
                          </p>
                        </div>
                      )}
                      {(user.company as any)?.description && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900">
                            Description
                          </h3>
                          <p className="text-gray-700">
                            {(user.company as any)?.description}
                          </p>
                        </div>
                      )}
                      {(user.company as any)?.location && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-indigo-900">
                            Location
                          </h3>
                          <p className="text-indigo-700">
                            {(user.company as any)?.location}
                          </p>
                        </div>
                      )}

                      {/* Display company logo */}
                      {(user.company as any)?.logo && (
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-pink-900 mb-3">
                            Company Logo
                          </h3>
                          <div className="flex justify-center">
                            <img
                              src={
                                (user.company as any).logo.path ||
                                (user.company as any).logo.url ||
                                `/api/images/${(user.company as any).logo._id}`
                              }
                              alt="Company logo"
                              className="w-32 h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder.jpg";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Edit Company Details
                        </h3>
                        <Button
                          onClick={() => setIsEditMode(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={editForm.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            placeholder="Company description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            placeholder="Company location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={editForm.website}
                            onChange={(e) =>
                              handleInputChange("website", e.target.value)
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+1234567890"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={editForm.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="contact@company.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Input
                            id="currency"
                            value={editForm.currency}
                            onChange={(e) =>
                              handleInputChange("currency", e.target.value)
                            }
                            placeholder="USD"
                          />
                        </div>
                        <div>
                          <Label htmlFor="feePercent">
                            Fee Percentage
                            {user?.role !== "superAdmin" && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Read-only)
                              </span>
                            )}
                          </Label>
                          <Input
                            id="feePercent"
                            value={editForm.feePercent}
                            onChange={(e) =>
                              handleInputChange("feePercent", e.target.value)
                            }
                            placeholder="5"
                            type="number"
                            min="0"
                            max="100"
                            disabled={user?.role !== "superAdmin"}
                            className={
                              user?.role !== "superAdmin"
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }
                          />
                          {user?.role !== "superAdmin" && (
                            <p className="text-xs text-gray-500 mt-1">
                              Only super admins can modify fee percentages
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="invoiceFormat">Invoice Format</Label>
                        <div className="space-y-4">
                          {/* Invoice Format Type */}
                          <div>
                            <Label htmlFor="invoiceFormatType">
                              Format Type
                            </Label>
                            <Select
                              value={editForm.invoiceFormatType || "auto"}
                              onValueChange={(value) =>
                                handleInputChange("invoiceFormatType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select format type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">
                                  Auto (Sequential Numbers)
                                </SelectItem>
                                <SelectItem value="prefix">
                                  Custom Prefix
                                </SelectItem>
                                <SelectItem value="paystack">
                                  Paystack Format
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Prefix Input (only show for prefix type) */}
                          {editForm.invoiceFormatType === "prefix" && (
                            <div>
                              <Label htmlFor="invoiceFormatPrefix">
                                Invoice Prefix
                              </Label>
                              <Input
                                id="invoiceFormatPrefix"
                                value={editForm.invoiceFormatPrefix || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "invoiceFormatPrefix",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., INV, BILL, TIL"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                This prefix will be added to all invoice numbers
                              </p>
                            </div>
                          )}

                          {/* Padding Configuration */}
                          <div>
                            <Label htmlFor="invoiceFormatPadding">
                              Number Padding
                            </Label>
                            <Select
                              value={
                                editForm.invoiceFormatPadding?.toString() || "4"
                              }
                              onValueChange={(value) =>
                                handleInputChange(
                                  "invoiceFormatPadding",
                                  parseInt(value)
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select padding" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">
                                  3 digits (001, 002...)
                                </SelectItem>
                                <SelectItem value="4">
                                  4 digits (0001, 0002...)
                                </SelectItem>
                                <SelectItem value="5">
                                  5 digits (00001, 00002...)
                                </SelectItem>
                                <SelectItem value="6">
                                  6 digits (000001, 000002...)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500 mt-1">
                              Number of digits for the sequential part
                            </p>
                          </div>

                          {/* Preview */}
                          <div className="p-3 bg-gray-50 rounded-md">
                            <Label className="text-sm font-medium">
                              Preview
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              {(() => {
                                const type =
                                  editForm.invoiceFormatType || "auto";
                                const prefix =
                                  editForm.invoiceFormatPrefix || "";
                                const padding =
                                  editForm.invoiceFormatPadding || 4;
                                const nextNumber =
                                  editForm.invoiceFormatNextNumber || 1;

                                if (type === "prefix" && prefix) {
                                  return `${prefix}${String(
                                    nextNumber
                                  ).padStart(padding, "0")}`;
                                } else if (type === "paystack") {
                                  return `PAY-${String(nextNumber).padStart(
                                    padding,
                                    "0"
                                  )}`;
                                } else {
                                  return `INV-${String(nextNumber).padStart(
                                    padding,
                                    "0"
                                  )}`;
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div>
                        <Label>Company Logo</Label>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Upload
                            </Button>
                          </div>

                          {/* Image Preview */}
                          {previewImage && (
                            <div className="relative group">
                              <img
                                src={previewImage}
                                alt="Company logo preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={removeImage}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={updateCompanyMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          {updateCompanyMutation.isPending
                            ? "Updating..."
                            : "Update Company"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditMode(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>You are not currently associated with any company</p>
                  <p className="text-sm mt-2">
                    Search and request to join a company below
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Join Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Your Join Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : userRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No join requests yet</p>
                  <p className="text-sm">
                    Your requests to join companies will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRequests.map((request: any) => (
                    <div key={request._id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {(request.company as any)?.name || "Unknown Company"}
                        </h4>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {getStatusIcon(request.status)}
                        <span>
                          {format(new Date(request.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {request.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search Companies */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search companies by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => setIsSearching(true)}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>

              {isSearching && (
                <div className="space-y-3">
                  {companiesLoading ? (
                    <div className="text-center py-4">Loading companies...</div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No companies found
                    </div>
                  ) : (
                    companies.map((company: any) => (
                      <div
                        key={company._id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {company.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {company.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {company.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {company.employeeCount} employees
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRequestToJoin(company._id)}
                            disabled={requestToJoinMutation.isPending}
                            className="ml-4"
                          >
                            {requestToJoinMutation.isPending
                              ? "Sending..."
                              : "Request to Join"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
