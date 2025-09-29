"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";
import UserInvitations from "@/components/user/UserInvitations";

const UserInvitationsSection: React.FC = () => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          My Invitations
        </CardTitle>
        <CardDescription>
          Invitations you have received to join companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserInvitations />
      </CardContent>
    </Card>
  );
};

export default UserInvitationsSection;
