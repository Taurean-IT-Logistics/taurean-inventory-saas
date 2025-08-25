"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { TransactionsAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import {
  CreditCard,
  Building2,
  Banknote,
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

interface SubaccountFormData {
  business_name: string;
  settlement_bank: string;
  account_number: string;
  description: string;
  percentage_charge: number;
}

export default function SubaccountPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SubaccountFormData>({
    business_name: "",
    settlement_bank: "",
    account_number: "",
    description: "",
    percentage_charge: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch company subaccount details
  const {
    data: subaccountData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company-subaccount"],
    queryFn: () => {
      // First get the company to get the subaccount code
      if (user?.company) {
        const company = user.company as any;
        if (company.paystackSubaccountCode) {
          return TransactionsAPI.getSubAccountDetails(
            company.paystackSubaccountCode
          );
        }
      }
      throw new Error("No subaccount code found");
    },
    enabled: !!user?.company,
  });

  // Fetch banks for selection
  const {
    data: banks,
    isLoading: banksLoading,
    error: banksError,
    refetch: refetchBanks,
  } = useQuery({
    queryKey: ["banks"],
    queryFn: () => TransactionsAPI.listBanks(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5, // Cache banks for 5 minutes
  });

  // Fetch account details when bank and account number are provided
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
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Update subaccount mutation
  const updateMutation = useMutation({
    mutationFn: (data: SubaccountFormData) => {
      if (user?.company) {
        const company = user.company as any;
        if (company.paystackSubaccountCode) {
          return TransactionsAPI.updateSubAccount(
            company.paystackSubaccountCode,
            data
          );
        }
      }
      throw new Error("No subaccount code found");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subaccount updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["company-subaccount"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subaccount",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when subaccount data is loaded
  useEffect(() => {
    if (subaccountData) {
      const data = subaccountData as any;
      setFormData({
        business_name: data.business_name || "",
        settlement_bank: data.settlement_bank || "",
        account_number: data.account_number || "",
        description: data.description || "",
        percentage_charge: data.percentage_charge || 0,
      });
    }
  }, [subaccountData]);

  const handleInputChange = (
    field: keyof SubaccountFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.business_name.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    await updateMutation.mutateAsync(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data
    if (subaccountData) {
      const data = subaccountData as any;
      setFormData({
        business_name: data.business_name || "",
        settlement_bank: data.settlement_bank || "",
        account_number: data.account_number || "",
        description: data.description || "",
        percentage_charge: data.percentage_charge || 0,
      });
    }
  };

  if (isLoading) {
    return <Loader text="Loading subaccount details..." className="pt-20" />;
  }

  if (error) {
    // Check if it's a "no subaccount" error
    if (error.message.includes("No subaccount code found")) {
      return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Subaccount Found
            </h1>
            <p className="text-gray-600 mb-6">
              Your company doesn&apos;t have a Paystack subaccount set up yet.
              This is required for processing payments and managing transaction
              fees.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                What you need to do:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Complete your company onboarding process</li>
                <li>• Set up your bank account details</li>
                <li>• Configure your transaction fee rates</li>
                <li>• Wait for subaccount verification</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={() => refetch()} className="mr-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/company-profile">
                  <Building2 className="h-4 w-4 mr-2" />
                  Go to Company Profile
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ErrorComponent
        title="Error loading subaccount"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // Check if company has subaccount code
  if (!user?.company || !(user.company as any)?.paystackSubaccountCode) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Subaccount Found
          </h1>
          <p className="text-gray-600 mb-6">
            Your company doesn&apos;t have a Paystack subaccount set up yet.
            This is required for processing payments and managing transaction
            fees.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              What you need to do:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Complete your company onboarding process</li>
              <li>• Set up your bank account details</li>
              <li>• Configure your transaction fee rates</li>
              <li>• Wait for subaccount verification</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={() => refetch()} className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/company-profile">
                <Building2 className="h-4 w-4 mr-2" />
                Go to Company Profile
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subaccount = subaccountData as any;

  // Check if subaccount data is incomplete
  if (!subaccount || !subaccount.business_name) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <CreditCard className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subaccount Incomplete
          </h1>
          <p className="text-gray-600 mb-6">
            Your subaccount exists but is missing required information. Please
            complete the setup to enable payment processing.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-6">
            <h3 className="font-medium text-yellow-900 mb-2">
              Missing Information:
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 text-left">
              <li>• Business name and description</li>
              <li>• Bank account details</li>
              <li>• Transaction fee configuration</li>
            </ul>
          </div>

          <Button onClick={() => setIsEditing(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Subaccount Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your Paystack subaccount settings and payment configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Subaccount Status
          </CardTitle>
          <CardDescription>
            Current status of your Paystack subaccount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={subaccount?.active ? "default" : "secondary"}>
                {subaccount?.active ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {subaccount?.subaccount_code || "N/A"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Subaccount Code
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {subaccount?.percentage_charge || 0}%
              </Badge>
              <span className="text-sm text-muted-foreground">Fee Rate</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {subaccount?.settlement_bank || "Not Set"}
              </Badge>
              <span className="text-sm text-muted-foreground">Bank</span>
            </div>
          </div>

          {/* Additional subaccount details */}
          {subaccount && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Business Name:
                  </span>
                  <span className="ml-2">
                    {subaccount.business_name || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Account Number:
                  </span>
                  <span className="ml-2">
                    {subaccount.account_number || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Description:
                  </span>
                  <span className="ml-2">
                    {subaccount.description || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Currency:
                  </span>
                  <span className="ml-2">{subaccount.currency || "GHS"}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subaccount Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Subaccount Details
          </CardTitle>
          <CardDescription>
            Configure your subaccount settings for payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) =>
                    handleInputChange("business_name", e.target.value)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Brief description of your business"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Bank Account Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="settlement_bank">Settlement Bank</Label>
                <Select
                  value={formData.settlement_bank}
                  onValueChange={(value) =>
                    handleInputChange("settlement_bank", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
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
                {banksError && (
                  <Button
                    className="mt-2"
                    onClick={() => refetchBanks()}
                    size="sm"
                    variant="outline"
                  >
                    Retry
                  </Button>
                )}
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) =>
                    handleInputChange("account_number", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="10-digit account number"
                  className="mt-1"
                />
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
                          <CheckCircle className="inline w-4 h-4 mr-1" />
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
          </div>

          <Separator />

          {/* Fee Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fee Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="percentage_charge">Percentage Charge (%)</Label>
                <Input
                  id="percentage_charge"
                  type="number"
                  min="5"
                  max="20"
                  step="0.5"
                  readOnly={true}
                  value={formData.percentage_charge}
                  onChange={(e) =>
                    handleInputChange(
                      "percentage_charge",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={!isEditing}
                  placeholder="e.g., 1.5"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The percentage fee charged on transactions (0-100%)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Your subaccount is used to process payments and manage
              transaction fees
            </p>
            <p>
              • Changes to bank details may require verification from Paystack
            </p>
            <p>
              • The percentage charge affects all transactions processed through
              this subaccount
            </p>
            <p>
              • Bank account details are validated in real-time to ensure
              accuracy
            </p>
            <p>
              • Contact support if you need to make significant changes to your
              subaccount
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-blue-800 text-xs">
                <strong>Tip:</strong> When updating bank details, the system
                will automatically validate your account number and display the
                account holder name for confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
