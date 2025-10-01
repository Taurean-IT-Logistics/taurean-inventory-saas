"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyAPI, getResourceUrl } from "@/lib/api";
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
  File,
  Download,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";
import Image from "next/image";
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
  const [isEditMode, setIsEditMode] = useState(false);

  // TanStack Query for company data with proper state management
  const { data: companyData, refetch: refetchCompany } = useQuery({
    queryKey: ["company-profile", (user?.company as any)?._id],
    queryFn: async () => {
      const companyId = (user?.company as any)?._id;
      if (!companyId) return null;
      return CompanyAPI.getById(companyId);
    },
    enabled: !!user?.company,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });
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
  const [registrationDocs, setRegistrationDocs] = useState<File[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);

  // Company update mutation with optimistic updates
  const updateCompanyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const companyId = (user?.company as any)?._id;
      if (!companyId) {
        throw new Error("Company ID not found");
      }
      return CompanyAPI.update(companyId, formData);
    },
    onMutate: async (formData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["company-profile"] });

      // Snapshot the previous value
      const previousCompany = queryClient.getQueryData([
        "company-profile",
        (user?.company as any)?._id,
      ]);

      // Optimistically update to the new value
      if (previousCompany) {
        const updatedCompany = { ...previousCompany } as any;
        // Update fields from formData
        if (formData.get("phone"))
          (updatedCompany as any).contactPhone = formData.get("phone");
        if (formData.get("email"))
          (updatedCompany as any).contactEmail = formData.get("email");
        if (formData.get("description"))
          (updatedCompany as any).description = formData.get("description");
        if (formData.get("location"))
          (updatedCompany as any).location = formData.get("location");
        if (formData.get("website"))
          (updatedCompany as any).website = formData.get("website");
        if (formData.get("currency"))
          (updatedCompany as any).currency = formData.get("currency");

        queryClient.setQueryData(
          ["company-profile", (user?.company as any)?._id],
          updatedCompany
        );
      }

      return { previousCompany };
    },
    onSuccess: async (data) => {
      toast({
        title: "Success",
        description: "Company updated successfully!",
        variant: "default",
      });
      setIsEditMode(false);

      // Invalidate and refetch to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      await refetchCompany();
    },
    onError: (error: any, formData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCompany) {
        queryClient.setQueryData(
          ["company-profile", (user?.company as any)?._id],
          context.previousCompany
        );
      }

      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  // Initialize edit form when company data changes
  React.useEffect(() => {
    // Use TanStack Query data if available, otherwise fallback to user.company
    const company = (companyData || user?.company) as any;
    if (company && !isEditMode) {
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
        phone: company.contactPhone || "",
        email: company.contactEmail || "",
        currency: company.currency || "",
        feePercent: company.feePercent?.toString() || "",
        invoiceFormat: invoiceFormatDisplay,
        invoiceFormatType: company.invoiceFormat?.type || "auto",
        invoiceFormatPrefix: company.invoiceFormat?.prefix || "",
        invoiceFormatPadding: company.invoiceFormat?.padding || 4,
        invoiceFormatNextNumber: company.invoiceFormat?.nextNumber || 1,
      });

      // Initialize existing registration documents
      if (company.registrationDocs && Array.isArray(company.registrationDocs)) {
        setExistingDocs(company.registrationDocs);
      }
    }
  }, [companyData, user?.company, isEditMode]);

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

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(file.name);
      } else if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: `Some files were not uploaded: ${invalidFiles.join(", ")}`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setRegistrationDocs((prev) => [...prev, ...validFiles]);
    }
  };

  // Remove document
  const removeDocument = (index: number) => {
    setRegistrationDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing document
  const removeExistingDocument = (index: number) => {
    setExistingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // Add form fields (excluding invoice format fields and name)
    Object.entries(editForm).forEach(([key, value]) => {
      if (value && !key.startsWith("invoiceFormat") && key !== "name") {
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

    // Add registration documents
    registrationDocs.forEach((file) => {
      formData.append("registrationDocs", file);
    });

    // Add remaining existing documents (so backend knows which ones to keep)
    if (existingDocs.length > 0) {
      formData.append("existingDocs", JSON.stringify(existingDocs));
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

  if (!user?.company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Company Found
          </h2>
          <p className="text-gray-600">
            You need to be associated with a company to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Company Profile Management
          </h1>
          <p className="text-gray-600">
            Manage company information and company settings
          </p>
        </div>

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
                      <h3 className="text-lg font-semibold">Company Details</h3>
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

                    {/* Invoice Settings Card */}
                    <div
                      key={`invoice-settings-${
                        (companyData || (user?.company as any))?._id
                      }-${JSON.stringify(
                        (companyData || (user?.company as any))?.invoiceFormat
                      )}`}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-semibold text-indigo-900">
                          Invoice Settings
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-700 font-medium">
                            Format:
                          </span>
                          <span className="text-sm font-semibold text-indigo-900">
                            {(() => {
                              const invoiceFormat = (
                                companyData || (user?.company as any)
                              )?.invoiceFormat;
                              if (!invoiceFormat) return "Not configured";

                              switch (invoiceFormat.type) {
                                case "auto":
                                  return "Auto Generated";
                                case "prefix":
                                  return "Custom Prefix";
                                case "paystack":
                                  return "Paystack Format";
                                default:
                                  return "Not configured";
                              }
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-700 font-medium">
                            Next Invoice:
                          </span>
                          <span className="text-sm font-semibold text-indigo-900 bg-indigo-100 px-2 py-1 rounded">
                            {(() => {
                              const invoiceFormat = (
                                companyData || (user?.company as any)
                              )?.invoiceFormat;
                              if (!invoiceFormat) return "N/A";

                              const { type, prefix, nextNumber, padding } =
                                invoiceFormat;

                              if (type === "prefix" && prefix) {
                                return `${prefix}${String(
                                  nextNumber || 1
                                ).padStart(padding || 4, "0")}`;
                              } else if (type === "paystack") {
                                return `PAY-${String(nextNumber || 1).padStart(
                                  padding || 4,
                                  "0"
                                )}`;
                              } else {
                                return `INV-${String(nextNumber || 1).padStart(
                                  padding || 4,
                                  "0"
                                )}`;
                              }
                            })()}
                          </span>
                        </div>
                        {(companyData || (user?.company as any))?.invoiceFormat
                          ?.prefix && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-indigo-700 font-medium">
                              Prefix:
                            </span>
                            <span className="text-sm font-semibold text-indigo-900">
                              {
                                (companyData || (user?.company as any))
                                  ?.invoiceFormat?.prefix
                              }
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-700 font-medium">
                            Padding:
                          </span>
                          <span className="text-sm font-semibold text-indigo-900">
                            {(companyData || (user?.company as any))
                              ?.invoiceFormat?.padding || 4}{" "}
                            digits
                          </span>
                        </div>
                      </div>
                    </div>
                    {(user.company as any)?.website && (
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-teal-900">Website</h3>
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
                          <Image
                            src={getResourceUrl(
                              (user.company as any).logo.path || ""
                            )}
                            alt="Company logo"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    )}

                    {/* Display registration documents */}
                    {existingDocs.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">
                          Registration Documents ({existingDocs.length})
                        </h3>
                        <div className="space-y-2">
                          {existingDocs.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-3 rounded-lg border"
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
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
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
                            </div>
                          ))}
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
                          disabled
                          placeholder="Company name (cannot be changed)"
                          className="bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Company name cannot be changed after registration
                        </p>
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
                          {user?.role !== "super_admin" && (
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
                          disabled={user?.role !== "super_admin"}
                          className={
                            user?.role !== "super_admin"
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }
                        />
                        {user?.role !== "super_admin" && (
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
                          <Label htmlFor="invoiceFormatType">Format Type</Label>
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
                          <Label className="text-sm font-medium">Preview</Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {(() => {
                              const type = editForm.invoiceFormatType || "auto";
                              const prefix = editForm.invoiceFormatPrefix || "";
                              const padding =
                                editForm.invoiceFormatPadding || 4;
                              const nextNumber =
                                editForm.invoiceFormatNextNumber || 1;

                              if (type === "prefix" && prefix) {
                                return `${prefix}${String(nextNumber).padStart(
                                  padding,
                                  "0"
                                )}`;
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
                            <Image
                              src={previewImage}
                              alt="Company logo preview"
                              width={128}
                              height={128}
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

                    {/* Document Upload Section */}
                    <div>
                      <Label>Registration Documents</Label>
                      <div className="mt-2 space-y-4">
                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            id="documentUpload"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="documentUpload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Click to upload documents
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT
                                (max 10MB each)
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Existing Documents */}
                        {existingDocs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              Current Documents ({existingDocs.length})
                            </h4>
                            <div className="space-y-2">
                              {existingDocs.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <File className="w-5 h-5 text-gray-400" />
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
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
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
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeExistingDocument(index)
                                      }
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Documents */}
                        {registrationDocs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              New Documents ({registrationDocs.length})
                            </h4>
                            <div className="space-y-2">
                              {registrationDocs.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <File className="w-5 h-5 text-blue-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
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
      </div>
    </div>
  );
}
