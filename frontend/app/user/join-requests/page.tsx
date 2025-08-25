import UserJoinRequests from "@/components/user/UserJoinRequests";

export default function JoinRequestsPage() {
  return (
    <div className="container mx-auto mt-20 py-6 px-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Join Requests</h1>
        <p className="text-gray-600 mt-2">
          View and manage your requests to join companies
        </p>
      </div>

      <UserJoinRequests />
    </div>
  );
}
