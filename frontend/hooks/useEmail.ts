import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useEmailConfiguration() {
  return useQuery({
    queryKey: ["email", "configuration"],
    queryFn: () => EmailAPI.testConfiguration(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useEmailSettings(companyId: string) {
  return useQuery({
    queryKey: ["email", "settings", companyId],
    queryFn: () => EmailAPI.getEmailSettings(companyId),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (payload: { to: string; subject: string; message: string }) =>
      EmailAPI.sendTestEmail(payload),
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });
}

export function useSendWelcomeEmail() {
  return useMutation({
    mutationFn: (userId: string) => EmailAPI.sendWelcomeEmail(userId),
    onSuccess: () => {
      toast({
        title: "Welcome Email Sent",
        description: "Welcome email has been sent to the user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send welcome email",
        variant: "destructive",
      });
    },
  });
}

export function useSendBookingConfirmation() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      EmailAPI.sendBookingConfirmation(bookingId),
    onSuccess: () => {
      toast({
        title: "Confirmation Sent",
        description: "Booking confirmation email has been sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send booking confirmation",
        variant: "destructive",
      });
    },
  });
}

export function useSendBookingReminder() {
  return useMutation({
    mutationFn: (bookingId: string) => EmailAPI.sendBookingReminder(bookingId),
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Booking reminder email has been sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send booking reminder",
        variant: "destructive",
      });
    },
  });
}

export function useSendBulkEmail() {
  return useMutation({
    mutationFn: (payload: any) => EmailAPI.sendBulkEmail(payload),
    onSuccess: () => {
      toast({
        title: "Bulk Email Sent",
        description: "Bulk email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send bulk email",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      settings,
    }: {
      companyId: string;
      settings: any;
    }) => EmailAPI.updateEmailSettings(companyId, settings),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["email", "settings", variables.companyId],
      });
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email settings",
        variant: "destructive",
      });
    },
  });
}
