"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Building2,
  Upload,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Percent,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
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
import { toast } from "@/hooks/use-toast";
import { CompaniesAPI, TransactionsAPI } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";

interface OnboardingFormData {
  name: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  description: string;
  currency: string;
  invoiceFormatType: string;
  invoiceFormatPrefix: string;
  settlement_bank: string;
  account_number: string;
  feePercent: string;
}

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const { tokens, login } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: "",
    contactEmail: "",
    contactPhone: "",
    location: "",
    description: "",
    currency: "GHS",
    invoiceFormatType: "auto",
    invoiceFormatPrefix: "",
    settlement_bank: "",
    account_number: "",
    feePercent: "5",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [registrationDocs, setRegistrationDocs] = useState<string[]>([]);
  const [newDoc, setNewDoc] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const onboardMutation = useMutation({
    mutationFn: (formData: FormData) => CompaniesAPI.onboard(formData),
    onSuccess: (data) => {
      toast({
        title: "Onboarding Successful",
        description: "Your company has been onboarded successfully.",
      });

      login({
        accessToken: tokens.accessToken ?? "",
        refreshToken: tokens.refreshToken ?? "",
      });
      setTimeout(() => {
        toast({
          title: "Redirecting...",
          description: "You will be redirected to the admin panel shortly.",
        });

        router.push("/admin");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Onboarding Failed",
        description: error.message || "An error occurred during onboarding.",
        variant: "destructive",
      });
    },
  });

  const {
    data: banks,
    isLoading: banksLoading,
    error: banksError,
    refetch: refetchBanks,
  } = useQuery({
    queryKey: ["banks"],
    queryFn: () => TransactionsAPI.listBanks(),
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnReconnect: true, // Refetch when internet reconnects
    staleTime: 1000 * 60 * 5, // Cache banks for 5 minutes
  });

  interface AccountDetails {
    account_name: string;
    bank_name: string;
    [key: string]: any;
  }

  const {
    data: accountDetailsData,
    isLoading: accountDetailsLoading,
    error: accountDetailsError,
    refetch: refetchAccountDetails,
  } = useQuery<AccountDetails>({
    queryKey: [
      "accountDetails",
      formData.settlement_bank,
      formData.account_number,
    ],
    queryFn: async ({ queryKey }) => {
      const [, bankCode, accountNumber] = queryKey as [string, string, string];
      return (await TransactionsAPI.getAccountDetails(
        bankCode,
        accountNumber
      )) as AccountDetails;
    },
    enabled: !!formData.settlement_bank && !!formData.account_number,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnReconnect: true, // Refetch when internet reconnects
    staleTime: 1000 * 60 * 5, // Cache banks for 5 minutes
  });

  console.log("Account Details Data:", accountDetailsData);

  const currencies = [
    { value: "GHS", label: "Ghana Cedi (GHS)" },
    { value: "NGN", label: "Nigerian Naira (NGN)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];

  const invoiceFormatTypes = [
    { value: "auto", label: "Auto Generated" },
    { value: "prefix", label: "Custom Prefix" },
    { value: "paystack", label: "Paystack Format" },
  ];

  const handleInputChange = (name: keyof OnboardingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          logo: "Logo file size must be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          logo: "Please select a valid image file",
        }));
        return;
      }

      setLogoFile(file);
      setErrors((prev) => ({ ...prev, logo: "" }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Contact phone is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.currency) newErrors.currency = "Currency is required";
    if (!formData.settlement_bank.trim())
      newErrors.settlement_bank = "Settlement bank is required";
    if (!formData.account_number.trim())
      newErrors.account_number = "Account number is required";
    if (!formData.feePercent.trim())
      newErrors.feePercent = "Fee percentage is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (
      formData.contactPhone &&
      !phoneRegex.test(formData.contactPhone.replace(/\s/g, ""))
    ) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    // Percentage validation
    const percentage = parseFloat(formData.feePercent);
    if (
      formData.feePercent &&
      (isNaN(percentage) || percentage < 0 || percentage > 100)
    ) {
      newErrors.feePercent = "Fee percentage must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();

    // Add basic form fields
    submitData.append("name", formData.name);
    submitData.append("business_name", formData.name); // Business name same as company name
    submitData.append("contactEmail", formData.contactEmail);
    submitData.append("contactPhone", formData.contactPhone);
    submitData.append("location", formData.location);
    submitData.append("description", formData.description);
    submitData.append("currency", formData.currency);
    submitData.append("settlement_bank", formData.settlement_bank);
    submitData.append("account_number", formData.account_number);
    submitData.append("percentage_charge", formData.feePercent);

    // Add invoice format as JSON string to match backend structure
    const invoiceFormat = {
      type: formData.invoiceFormatType,
      prefix: formData.invoiceFormatPrefix,
      nextNumber: 1,
      padding: 4,
    };
    submitData.append("invoiceFormat", JSON.stringify(invoiceFormat));

    // Add logo file if present
    if (logoFile) {
      submitData.append("file", logoFile);
    }

    // Add registration docs array
    if (registrationDocs.length > 0) {
      submitData.append("registrationDocs", JSON.stringify(registrationDocs));
    }

    onboardMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen mt-20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Company Onboarding
          </h1>
          <p className="text-lg text-gray-600">
            Let&apos;s get your company set up and ready to go
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter company name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter company location"
                      className={`pl-10 ${
                        errors.location ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your company..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="mt-2">
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    {logoFile && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {logoFile.name}
                      </span>
                    )}
                  </div>
                  {logoPreview && (
                    <div className="mt-2">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-contain border rounded"
                      />
                    </div>
                  )}
                  {errors.logo && (
                    <p className="text-sm text-red-500 mt-1">{errors.logo}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="registrationDocs">Registration Documents</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newDoc}
                      onChange={(e) => setNewDoc(e.target.value)}
                      placeholder="Enter document URL or description..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newDoc.trim()) {
                          setRegistrationDocs([
                            ...registrationDocs,
                            newDoc.trim(),
                          ]);
                          setNewDoc("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {registrationDocs.length > 0 && (
                    <div className="space-y-1">
                      {registrationDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                        >
                          <span className="truncate">{doc}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRegistrationDocs(
                                registrationDocs.filter((_, i) => i !== index)
                              );
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        handleInputChange("contactEmail", e.target.value)
                      }
                      placeholder="contact@company.com"
                      className={`pl-10 ${
                        errors.contactEmail ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        handleInputChange("contactPhone", e.target.value)
                      }
                      placeholder="+234 800 000 0000"
                      className={`pl-10 ${
                        errors.contactPhone ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Business Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleInputChange("currency", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.currency ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.currency}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="invoiceFormatType">Invoice Format Type</Label>
                  <Select
                    value={formData.invoiceFormatType}
                    onValueChange={(value) =>
                      handleInputChange("invoiceFormatType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format type" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceFormatTypes.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.invoiceFormatType === "prefix" && (
                <div>
                  <Label htmlFor="invoiceFormatPrefix">Invoice Prefix</Label>
                  <Input
                    id="invoiceFormatPrefix"
                    value={formData.invoiceFormatPrefix}
                    onChange={(e) =>
                      handleInputChange("invoiceFormatPrefix", e.target.value)
                    }
                    placeholder="e.g., INV, BILL, etc."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This prefix will be added to all invoice numbers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                <small className="text-gray-500 block">
                  For Mobile Money: Select MTN, Vodafone for Telecel users or
                  AirtelTigo
                </small>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="settlement_bank">Settlement Bank *</Label>

                  <Select
                    value={formData.settlement_bank}
                    onValueChange={(value) =>
                      handleInputChange("settlement_bank", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.settlement_bank ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Search and select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <Command shouldFilter={true}>
                        <CommandInput
                          placeholder="Search banks..."
                          value={search}
                          onValueChange={setSearch}
                        />
                        <CommandList>
                          {banksLoading ? (
                            <CommandItem disabled>Loading banks...</CommandItem>
                          ) : banksError ? (
                            <CommandItem disabled>
                              Failed to load banks. Try again.
                            </CommandItem>
                          ) : (banks as any)?.data &&
                            (banks as any).data.length > 0 ? (
                            (banks as any).data
                              .filter((bank: { name: string }) =>
                                bank.name
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                              )
                              .map((bank: { code: string; name: string }) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))
                          ) : (
                            <CommandEmpty>No banks found</CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </SelectContent>
                  </Select>
                  {errors.settlement_bank && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.settlement_bank}
                    </p>
                  )}

                  {banksError && (
                    <Button className="mt-2" onClick={() => refetchBanks()}>
                      Retry
                    </Button>
                  )}
                </div>

                <div>
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) =>
                      handleInputChange("account_number", e.target.value)
                    }
                    placeholder="1234567890"
                    className={errors.account_number ? "border-red-500" : ""}
                  />
                  {errors.account_number && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.account_number}
                    </p>
                  )}
                  {formData.settlement_bank && formData.account_number && (
                    <div className="mt-2">
                      {accountDetailsLoading ? (
                        <span className="text-gray-500 text-sm flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Fetching
                          account details...
                        </span>
                      ) : accountDetailsData ? (
                        <span className="text-green-600 text-sm flex flex-col">
                          <span className="flex items-center justify-start gap-1">
                            <CheckCircle2 className="inline w-4 h-4 mr-1" />
                            Account Name:{" "}
                            {(accountDetailsData as any).data.account_name}
                          </span>
                        </span>
                      ) : accountDetailsError ? (
                        <span className="text-red-500 text-sm flex flex-col items-center gap-2 mt-2">
                          <AlertCircle className="w-4 h-4" />
                          {accountDetailsError.message || "Account not found"}
                          <Button
                            onClick={() => {
                              refetchAccountDetails();
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Retry
                          </Button>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="feePercent">Fee Percentage (%) *</Label>
                <div className="relative">
                  <Percent className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="feePercent"
                    type="number"
                    min="5"
                    max="10"
                    readOnly
                    step="0.5"
                    value={formData.feePercent}
                    onChange={(e) =>
                      handleInputChange("feePercent", e.target.value)
                    }
                    placeholder="5"
                    className={`pl-10 ${
                      errors.feePercent ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.feePercent && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.feePercent}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Company fee percentage for transactions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="px-8"
              disabled={onboardMutation.isPending}
            >
              {onboardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up company...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
