"use client";

import React, { useState } from "react";
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
import { apiFetch } from "@/lib/api";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

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
  const [testSubject, setTestSubject] = useState("Test Email from " + user?.company);
  const [testMessage, setTestMessage] = useState("This is a test email to verify email configuration.");
  const [bulkEmailRecipients, setBulkEmailRecipients] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkUserRole, setBulkUserRole] = useState("");

  // Fetch email settings
  const {
    data: emailSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["email-settings", user?.companyId],
    queryFn: () => apiFetch(`/email/settings/${user?.companyId}`),
    enabled: !!user?.companyId,
  });

  // Test email configuration
  const testConfigMutation = useMutation({
    mutationFn: () => apiFetch("/email/test-config"),
    onSuccess: () => {
      toast({
        title: "Configuration Test Successful",
        description: "Email configuration is working properly.",
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

  // Send test email
  const testEmailMutation = useMutation({
    mutationFn: (data: { to: string; subject: string; message: string }) =>
      apiFetch("/email/test", { method: "POST", body: JSON.stringify(data) }),
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
      apiFetch(`/email/settings/${user?.companyId}`, {
        method: "PUT",
        body: JSON.stringify({ emailSettings: settings }),
      }),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Email settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Settings",
        description: error.message || "Could not update email settings.",
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
    const currentSettings = emailSettings?.emailSettings || {};
    const updatedSettings = { ...currentSettings, [field]: value };
    updateSettingsMutation.mutate(updatedSettings);
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
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
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

  const settings = emailSettings?.emailSettings || {};

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
          Test Configuration
        </Button>
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
                    checked={settings.sendInvoiceEmails}
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
                    checked={settings.sendReceiptEmails}
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
                    checked={settings.sendBookingConfirmations}
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
                    checked={settings.sendBookingReminders}
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
                    checked={settings.sendPaymentNotifications}
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
                    checked={settings.sendWelcomeEmails}
                    onCheckedChange={(value) =>
                      handleSettingsUpdate("sendWelcomeEmails", value)
                    }
                  />
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
                    value={settings.customFromName || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("customFromName", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Name that appears in the "From" field
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customFromEmail">Custom From Email</Label>
                  <Input
                    id="customFromEmail"
                    type="email"
                    placeholder="noreply@yourcompany.com"
                    value={settings.customFromEmail || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("customFromEmail", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address that appears in the "From" field
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSignature">Email Signature</Label>
                  <Textarea
                    id="emailSignature"
                    placeholder="Best regards,&#10;Your Company Team"
                    rows={4}
                    value={settings.emailSignature || ""}
                    onChange={(e) =>
                      handleSettingsUpdate("emailSignature", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Custom signature added to all emails
                  </p>
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
                    disabled={bulkEmailMutation.isPending || (!bulkEmailRecipients.trim() && !bulkUserRole)}
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
                        ? `${bulkEmailRecipients.split(',').length} specified recipients`
                        : `all ${bulkUserRole} users`}?
                      This action cannot be undone.
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuration Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {testConfigMutation.data ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Unknown</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email service configuration status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(settings).filter(Boolean).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {Object.keys(settings).length} notification types enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Professional templates available
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSettingsPage;