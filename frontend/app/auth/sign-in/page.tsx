"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { AuthAPI } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useRedirect } from "@/hooks/useRedirect";
import Logo from "@/components/logo/Logo";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const { redirectAfterLogin } = useRedirect();

  const loginMutation = useMutation({
    mutationFn: (data: { identifier: string; password: string }) =>
      AuthAPI.login(data.identifier, data.password),
    onSuccess: (data) => {
      // Update auth state
      login(data.tokens);

      if (window.history.length > 2) {
        router.back();
      } else {
        redirectAfterLogin();
      }
    },
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ identifier, password });
  };

  useEffect(() => {
    if (loginMutation.isError) {
      toast({
        title: "Login",
        description: loginMutation.error.message,
        variant: "destructive",
      });
    }

    if (loginMutation.isSuccess) {
      toast({
        title: "Login",
        description: "Login successful!",
      });
    }
  }, [loginMutation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link href="/" className="flex justify-center mb-2">
            <Logo />
          </Link>
          <h2 className="text-center text-xl font-semibold text-foreground">
            Log in or create account
          </h2>
          <form
            action="#"
            method="post"
            className="mt-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <Label
                htmlFor="identifier"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Email or Username
              </Label>
              <Input
                type="text"
                id="identifier"
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="email"
                placeholder="yourusername@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label
                htmlFor="password-login-02"
                className="text-sm font-medium text-foreground dark:text-foreground"
              >
                Password
              </Label>
              <Input
                type="password"
                id="password-login-02"
                name="password-login-02"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="password"
                placeholder="**************"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="mt-4 w-full py-2 font-medium">
              {loginMutation.isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Log in"
              )}
            </Button>
          </form>
          <p className="mt-2 text-xs">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Create an account
            </Link>
          </p>

          <p className="mt-4 text-xs text-muted-foreground dark:text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
