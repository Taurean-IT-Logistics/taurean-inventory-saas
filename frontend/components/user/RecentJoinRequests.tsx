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
import { Building2 } from "lucide-react";
import Link from "next/link";

const RecentJoinRequests: React.FC = () => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Recent Join Requests
        </CardTitle>
        <CardDescription>Your latest company join requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* This will be populated by the UserJoinRequests component */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Loading join requests...
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href="/user/join-requests">
              <Building2 className="h-4 w-4 mr-2" />
              View All Join Requests
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentJoinRequests;
