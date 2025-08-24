"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Settings,
  Send,
  TestTube,
  Users,
  FileText,
  Bell,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch, EmailAPI } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import { useSocket } from "@/components/SocketProvider";
import { SocketEvents } from "@/lib/socket";

interface EmailSettings {
  sendInvoiceEmails: boolean;
  sendReceiptEmails: boolean;
  sendBookingConfirmations: boolean;
  sendBookingReminders: boolean;
  sendPaymentNotifications: boolean;
  sendWelcomeEmails: boolean;
  sendSubscriptionNotices: boolean;
  customFromName?: string;
  customFromEmail?: string;
  emailSignature?: string;
}

const EmailSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState(
    "Test Email from " + user?.company
  );
  const [testMessage, setTestMessage] = useState(
    "This is a test email to verify email configuration."
  );
  const [bulkEmailRecipients, setBulkEmailRecipients] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkUserRole, setBulkUserRole] = useState("");

  // Local state for email settings before saving
  const [localSettings, setLocalSettings] = useState<EmailSettings>({
    sendInvoiceEmails: true,
    sendReceiptEmails: true,
    sendBookingConfirmations: true,
    sendBookingReminders: true,
    sendPaymentNotifications: true,
    sendWelcomeEmails: true,
    sendSubscriptionNotices: true,
    customFromName: "",
    customFromEmail: "",
    emailSignature: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { subscribeToEvent, unsubscribeFromEvent } = useSocket();

  // Fetch email settings
  const {
    data: emailSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["email-settings", (user as any)?.company],
    queryFn: () => apiFetch(`/email/settings/${(user as any)?.company._id}`),
    enabled: !!(user as any)?.company,
  });

  // Update local settings when email settings are loaded
  useEffect(() => {
    if (emailSettings && (emailSettings as any)?.emailSettings) {
      const settings = (emailSettings as any).emailSettings;
      setLocalSettings({
        sendInvoiceEmails: settings.sendInvoiceEmails ?? true,
        sendReceiptEmails: settings.sendReceiptEmails ?? true,
        sendBookingConfirmations: settings.sendBookingConfirmations ?? true,
        sendBookingReminders: settings.sendBookingReminders ?? true,
        sendPaymentNotifications: settings.sendPaymentNotifications ?? true,
        sendWelcomeEmails: settings.sendWelcomeEmails ?? true,
        sendSubscriptionNotices: settings.sendSubscriptionNotices ?? true,
        customFromName: settings.customFromName || "",
        customFromEmail: settings.customFromEmail || "",
        emailSignature: settings.emailSignature || "",
      });
      setHasUnsavedChanges(false);
    }
  }, [emailSettings]);

  useEffect(() => {
    const onEmailEvent = (data: any) => {
      if (data?.status === "sent") {
        toast({
          title: "Email sent",
          description: `${data.subject} delivered`,
        });
      } else if (data?.status === "failed") {
        toast({
          title: "Email failed",
          description: `${data.subject}: ${data.error || "Unknown error"}`,
          variant: "destructive",
        });
      }
    };
    subscribeToEvent(SocketEvents.InvoiceCreated, () => {}); // no-op to keep provider active
    subscribeToEvent("email:sent" as any, onEmailEvent);
    subscribeToEvent("email:failed" as any, onEmailEvent);
    return () => {
      unsubscribeFromEvent("email:sent" as any, onEmailEvent);
      unsubscribeFromEvent("email:failed" as any, onEmailEvent);
    };
  }, [subscribeToEvent, unsubscribeFromEvent]);

  // Test email configuration
  const testConfigMutation = useMutation({
    mutationFn: () => EmailAPI.testConfiguration(),
    onSuccess: (data: any) => {
      toast({
        title: "Configuration Test Successful",
        description: `Email configuration is working properly. Tested by ${
          data.userType === "superAdmin" ? "Super Admin" : "Company Admin"
        }`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Test Failed",
        description: error.message || "Email configuration has issues.",
        variant: "destructive",
      });
    },
  });

  // Test company email configuration
  const testCompanyConfigMutation = useMutation({
    mutationFn: () =>
      EmailAPI.testCompanyConfiguration((user as any)?.company._id),
    onSuccess: (data: any) => {
      toast({
        title: "Company Email Test Successful",
        description: `Company email configuration test completed. ${
          data.hasCustomSettings
            ? "Custom settings detected."
            : "Using default settings."
        }`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Company Email Test Failed",
        description: error.message || "Company email configuration has issues.",
        variant: "destructive",
      });
    },
  });

  // Send test email
  const testEmailMutation = useMutation({
    mutationFn: (data: { to: string; subject: string; message: string }) =>
      EmailAPI.sendTestEmail(data),
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully.",
      });
      setTestEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Test Email",
        description: error.message || "Could not send test email.",
        variant: "destructive",
      });
    },
  });

  // Update email settings
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: EmailSettings) =>
      EmailAPI.updateEmailSettings((user as any)?.company._id, settings),
    onSuccess: (data: any) => {
      toast({
        title: "Settings Saved",
        description: `Email settings have been saved successfully by ${
          data.userType === "superAdmin" ? "Super Admin" : "Company Admin"
        }`,
      });
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save Settings",
        description: error.message || "Could not save email settings.",
        variant: "destructive",
      });
    },
  });

  // Send bulk email
  const bulkEmailMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/email/bulk", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (response: any) => {
      toast({
        title: "Bulk Email Sent",
        description: `Successfully sent to ${response.success} recipients. ${response.failed} failed.`,
      });
      setBulkEmailRecipients("");
      setBulkSubject("");
      setBulkMessage("");
      setBulkUserRole("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Bulk Email",
        description: error.message || "Could not send bulk email.",
        variant: "destructive",
      });
    },
  });

  const handleSettingsUpdate = (field: keyof EmailSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleResetSettings = () => {
    if (emailSettings && (emailSettings as any)?.emailSettings) {
      const settings = (emailSettings as any).emailSettings;
      setLocalSettings({
        sendInvoiceEmails: settings.sendInvoiceEmails ?? true,
        sendReceiptEmails: settings.sendReceiptEmails ?? true,
        sendBookingConfirmations: settings.sendBookingConfirmations ?? true,
        sendBookingReminders: settings.sendBookingReminders ?? true,
        sendPaymentNotifications: settings.sendPaymentNotifications ?? true,
        sendWelcomeEmails: settings.sendWelcomeEmails ?? true,
        sendSubscriptionNotices: settings.sendSubscriptionNotices ?? true,
        customFromName: settings.customFromName || "",
        customFromEmail: settings.customFromEmail || "",
        emailSignature: settings.emailSignature || "",
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleTestEmail = () => {
    if (!testEmail || !testSubject || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all test email fields.",
        variant: "destructive",
      });
      return;
    }

    testEmailMutation.mutate({
      to: testEmail,
      subject: testSubject,
      message: testMessage,
    });
  };

  const handleBulkEmail = () => {
    if (!bulkSubject || !bulkMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and message for bulk email.",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      subject: bulkSubject,
      message: bulkMessage,
    };

    if (bulkEmailRecipients.trim()) {
      data.recipients = bulkEmailRecipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
    } else if (bulkUserRole) {
      data.userRole = bulkUserRole;
    } else {
      toast({
        title: "Missing Recipients",
        description: "Please specify either email addresses or user role.",
        variant: "destructive",
      });
      return;
    }

    bulkEmailMutation.mutate(data);
  };

  if (isLoading) {
    return <Loader text="Loading email settings..." className="pt-20" />;
  }

  if (error) {
    return (
      <ErrorComponent
        title="Error loading email settings"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // Use localSettings for display, fallback to server settings for status info
  const serverSettings = (emailSettings as any)?.emailSettings || {};

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground">
            Configure email notifications and communication preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => testConfigMutation.mutate()}
            disabled={testConfigMutation.isPending}
            variant="outline"
          >
            {testConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test System Config
          </Button>
          <Button
            onClick={() => testCompanyConfigMutation.mutate()}
            disabled={testCompanyConfigMutation.isPending}
            variant="outline"
          >
            {testCompanyConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Test Company Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="test">Test Emails</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure which email notifications to send automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invoice Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send invoices automatically when created
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendInvoiceEmails}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendInvoiceEmails", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Receipt Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send receipts when payments are processed
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendReceiptEmails}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendReceiptEmails", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Send confirmation when bookings are made
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendBookingConfirmations}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendBookingConfirmations", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders 24 hours before bookings
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendBookingReminders}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendBookingReminders", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications for payment status changes
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendPaymentNotifications}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendPaymentNotifications", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Welcome Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send welcome emails to new users
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.sendWelcomeEmails}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendWelcomeEmails", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Email Configuration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Company Email Configuration
                </CardTitle>
                <CardDescription>
                  Current status of your company&apos;s email configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">From Name:</span>
                    <p className="text-muted-foreground">
                      {serverSettings.customFromName ||
                        "Default (Taurean IT Logistics)"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">From Email:</span>
                    <p className="text-muted-foreground">
                      {serverSettings.customFromEmail ||
                        "Default (noreply@taureanitlogistics.com)"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Custom Signature:</span>
                    <p className="text-muted-foreground">
                      {serverSettings.emailSignature
                        ? "Configured"
                        : "Not configured"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <p className="text-muted-foreground">
                      {serverSettings.updatedAt
                        ? new Date(
                            serverSettings.updatedAt
                          ).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
                {hasUnsavedChanges && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        You have unsaved changes
                      </span>
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    onClick={() => testCompanyConfigMutation.mutate()}
                    disabled={testCompanyConfigMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {testCompanyConfigMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Test Company Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Email Customization
                </CardTitle>
                <CardDescription>
                  Customize how emails appear to your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customFromName">Custom From Name</Label>
                  <Input
                    id="customFromName"
                    placeholder="Your Company Name"
                    value={localSettings.customFromName || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("customFromName", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Name that appears in the &quot;From&quot; field
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customFromEmail">Custom From Email</Label>
                  <Input
                    id="customFromEmail"
                    type="email"
                    placeholder="noreply@yourcompany.com"
                    value={localSettings.customFromEmail || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("customFromEmail", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address that appears in the &quot;From&quot; field
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSignature">Email Signature</Label>
                  <Textarea
                    id="emailSignature"
                    placeholder="Best regards,&#10;Your Company Team"
                    rows={4}
                    value={localSettings.emailSignature || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("emailSignature", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Custom signature added to all emails
                  </p>
                </div>

                {/* Save/Reset Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={
                      !hasUnsavedChanges || updateSettingsMutation.isPending
                    }
                    className="flex-1"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Save Email Settings
                  </Button>
                  <Button
                    onClick={handleResetSettings}
                    disabled={!hasUnsavedChanges}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Email Delivery
              </CardTitle>
              <CardDescription>
                Send test emails to verify your configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Recipient Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testSubject">Subject</Label>
                <Input
                  id="testSubject"
                  placeholder="Test Email Subject"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testMessage">Message</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Enter your test message here..."
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              <Button
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending}
                className="w-full"
              >
                {testEmailMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Email Communication
              </CardTitle>
              <CardDescription>
                Send emails to multiple users or specific user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkRecipients">Email Addresses</Label>
                  <Textarea
                    id="bulkRecipients"
                    placeholder="email1@example.com, email2@example.com"
                    rows={3}
                    value={bulkEmailRecipients}
                    onChange={(e) => setBulkEmailRecipients(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Comma-separated email addresses
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulkUserRole">Or Select User Role</Label>
                  <Select value={bulkUserRole} onValueChange={setBulkUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">All Users</SelectItem>
                      <SelectItem value="staff">Staff Members</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Send to all users with this role
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkSubject">Subject</Label>
                <Input
                  id="bulkSubject"
                  placeholder="Important Announcement"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkMessage">Message</Label>
                <Textarea
                  id="bulkMessage"
                  placeholder="Enter your message here..."
                  rows={6}
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={
                      bulkEmailMutation.isPending ||
                      (!bulkEmailRecipients.trim() && !bulkUserRole)
                    }
                    className="w-full"
                  >
                    {bulkEmailMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Bulk Email
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Email</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to send this email to{" "}
                      {bulkEmailRecipients.trim()
                        ? `${
                            bulkEmailRecipients.split(",").length
                          } specified recipients`
                        : `all ${bulkUserRole} users`}
                      ? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkEmail}>
                      Send Email
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailSettingsPage;
