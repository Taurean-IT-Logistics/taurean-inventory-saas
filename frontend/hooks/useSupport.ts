import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupportAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function useUserTickets() {
  return useQuery({
    queryKey: ["support", "tickets", "user"],
    queryFn: () => SupportAPI.getUserTickets(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStaffTickets() {
  return useQuery({
    queryKey: ["support", "tickets", "staff"],
    queryFn: () => SupportAPI.getStaffTickets(),
    staleTime: 1 * 60 * 1000, // 1 minute - staff tickets should be fresher
  });
}

export function useSuperAdminTickets() {
  return useQuery({
    queryKey: ["support", "tickets", "super-admin"],
    queryFn: () => SupportAPI.getSuperAdminTickets(),
    staleTime: 1 * 60 * 1000,
  });
}

export function useTicketDetails(ticketId: string) {
  return useQuery({
    queryKey: ["support", "tickets", ticketId],
    queryFn: () => SupportAPI.getTicketDetails(ticketId),
    enabled: !!ticketId,
    staleTime: 30 * 1000, // 30 seconds - ticket details should be very fresh
  });
}

export function useAvailableStaff() {
  return useQuery({
    queryKey: ["support", "staff", "available"],
    queryFn: () => SupportAPI.getAvailableStaff(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => SupportAPI.createTicket(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create support ticket",
        variant: "destructive",
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, formData }: { ticketId: string; formData: FormData }) =>
      SupportAPI.sendMessage(ticketId, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      data 
    }: { 
      ticketId: string; 
      data: { status: string; assignedTo?: string } 
    }) => SupportAPI.updateTicketStatus(ticketId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["support", "tickets", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });
}