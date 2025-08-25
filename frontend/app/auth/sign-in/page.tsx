"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { AuthAPI } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import Logo from "@/components/logo/Logo";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: (data: { identifier: string; password: string }) =>
      AuthAPI.login(data.identifier, data.password),
    onSuccess: (data) => {
      // Update auth state - AuthProvider will handle redirects
      login(data.tokens);
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
    <AuthGuard requireGuest redirectTo="/">
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
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="mt-2"
                />
                <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
