"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Home } from "lucide-react";
import Link from "next/link";

interface CompanyAccessProps {
  user: any;
}

const CompanyAccess: React.FC<CompanyAccessProps> = ({ user }) => {
  if (user?.company) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Status
          </CardTitle>
          <CardDescription>
            You are currently associated with a company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Company: {(user.company as any)?.name || "Unknown Company"}
              </p>
              <p className="text-sm text-muted-foreground">
                Role: {user.role || "User"}
              </p>
            </div>
            <Button asChild>
              <Link href="/admin">
                <Building2 className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Access
        </CardTitle>
        <CardDescription>
          Join a company to access business features and manage facilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You&apos;re not currently associated with any company
            </p>
            <p className="text-sm text-muted-foreground">
              Request to join a company or become a host to get started
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/user/join-requests">
                <Building2 className="h-4 w-4 mr-2" />
                View Join Requests
              </Link>
            </Button>
            <Button asChild>
              <Link href="/user/host">
                <Home className="h-4 w-4 mr-2" />
                Become a Host
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyAccess;
