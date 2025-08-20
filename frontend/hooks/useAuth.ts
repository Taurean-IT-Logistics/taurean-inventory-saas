import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthAPI, clearTokens } from "@/lib/api";
import { useAuth as useAuthContext } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function useLogin() {
  const { login } = useAuthContext();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      AuthAPI.login(identifier, password),
    onSuccess: (data) => {
      if (data.tokens) {
        login(data.tokens);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully",
        });
        router.push("/user/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const { login } = useAuthContext();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      phone: string;
      username: string;
      password: string;
    }) => AuthAPI.register(payload),
    onSuccess: (data) => {
      if (data.tokens) {
        login(data.tokens);
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully",
        });
        router.push("/user/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: AuthAPI.logout,
    onSuccess: () => {
      logout();
      clearTokens();
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      router.push("/");
    },
    onError: (error: any) => {
      // Even if the API call fails, we should still log out locally
      logout();
      clearTokens();
      queryClient.clear();
      router.push("/");
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    },
  });
}

// Re-export the useAuth hook from AuthProvider for convenience
export { useAuth as useAuthContext } from "@/components/AuthProvider";