"use client";

import UserInvitations from "@/components/user/UserInvitations";

export default function UserInvitationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Company Invitations</h1>
        <p className="text-gray-600 mt-2">
          View and manage your company invitations and join requests
        </p>
      </div>
      
      <UserInvitations />
    </div>
  );
}
