"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JSX, SVGProps } from "react";
import Link from "next/link";
import { AuthAPI } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo/Logo";

export default function SignUp() {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const signUpMutation = useMutation({
    mutationFn: AuthAPI.register,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your account has been created.",
      });
      router.push("/auth/sign-in");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm px-6 py-10 pt-14">
        <div className="flex flex-col items-center space-y-8 ">
          <Link href="/" className="flex justify-center">
            <Logo width={300} />
          </Link>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="text-foreground hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Your name"
              name="name"
              value={data.name}
              onChange={handleChange}
              className="w-full rounded-xl"
            />
            <Input
              type="email"
              placeholder="Your email"
              name="email"
              value={data.email}
              onChange={handleChange}
              className="w-full rounded-xl"
            />
            <Input
              type="text"
              placeholder="Your username"
              name="username"
              value={data.username}
              onChange={handleChange}
              className="w-full rounded-xl"
            />
            <Input
              type="text"
              placeholder="Your phone number"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              className="w-full rounded-xl"
            />
            <Input
              type="password"
              placeholder="Create a password"
              name="password"
              value={data.password}
              onChange={handleChange}
              className="w-full rounded-xl"
            />
            <div className="flex flex-col gap-2">
              <Button className="w-full rounded-xl" size="lg">
                {signUpMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Sign up"
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs w-11/12 text-muted-foreground">
            You acknowledge that you read, and agree, to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
