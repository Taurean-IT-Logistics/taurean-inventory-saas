"use client";

import { useState } from "react";
import type { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import {
  UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Star,
  ShoppingCart,
  MapPin,
  Edit,
  Trash2,
  Building,
  Crown,
} from "lucide-react";
import { EditProfileModal } from "@/components/user/editProfileModal";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { CompaniesAPI, UsersAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { currencyFormat } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Link from "next/link";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";

const UserProfilePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch user data
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", authUser?._id],
    queryFn: () => UsersAPI.profile(),
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (updatedUser: Partial<User>) =>
      UsersAPI.update(user?._id || "", updatedUser),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["user", user?._id] });
      setShowEditModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: () => UsersAPI.update(user?._id || "", { isDeleted: true }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account deleted successfully",
        variant: "default",
      });
      logout();
      router.push("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-100 text-amber-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "platinum":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superAdmin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    await updateUserMutation.mutateAsync(updatedUser);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      await deleteUserMutation.mutateAsync();
    }
  };

  const handleRequestCompanyApproval = async () => {
    toast({
      title: "Request Sent",
      description: "Your request to join a company has been submitted",
      variant: "default",
    });
  };

  if (isLoading) {
    return <Loader text="Loading profile..." className="pt-20" />;
  }

  if (isError || !user) {
    return (
      <ErrorComponent
        title="Error loading profile"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8 mt-20 space-y-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2"
            disabled={updateUserMutation.isPending}
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="flex items-center gap-2"
            disabled={deleteUserMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>
                    <AvatarInitials name={user.name} />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === "superAdmin" && (
                        <Crown className="h-3 w-3 mr-1" />
                      )}
                      {user.role}
                    </Badge>
                    {user.isSuperAdmin && (
                      <Badge variant="destructive">
                        <Shield className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Member Since
                    </p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.company ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-lg">
                      {(user.company as any)?.name}
                    </p>
                    {user.companyRole && (
                      <Badge variant="outline" className="mt-2">
                        {(user.companyRole as any)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-3">
                      No company associated
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Join or create a company to access additional features
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full bg-transparent"
                    >
                      <Link href={user.company ? "/admin" : "/user/host"}>
                        <Building className="h-4 w-4 mr-2" />
                        {user.company ? "Manage Company" : "Create Company"}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRequestCompanyApproval}
                      className="w-full bg-transparent"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Request Approval
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Profile and Shopping Cart - Side by Side */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loyalty Profile */}
            {user.loyaltyProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Loyalty Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.loyaltyProfile.loyaltyTier && (
                    <div className="text-center">
                      <Badge
                        className={`${getTierColor(
                          user.loyaltyProfile.loyaltyTier
                        )} text-lg px-4 py-2`}
                      >
                        {user.loyaltyProfile.loyaltyTier.toUpperCase()} TIER
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {user.loyaltyProfile.totalBookings}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Bookings
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {currencyFormat(user.loyaltyProfile.totalSpent)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Spent
                      </p>
                    </div>
                  </div>

                  {user.loyaltyProfile.lastBookingDate && (
                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Last Booking
                      </p>
                      <p className="font-medium">
                        {formatDate(user.loyaltyProfile.lastBookingDate)}
                      </p>
                    </div>
                  )}

                  {user.loyaltyProfile.preferredFacilities &&
                    user.loyaltyProfile.preferredFacilities.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                          Preferred Facilities
                        </p>
                        <div className="space-y-1">
                          {user.loyaltyProfile.preferredFacilities
                            .slice(0, 3)
                            .map((facility) => (
                              <div
                                key={facility._id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{facility.name}</span>
                              </div>
                            ))}
                          {user.loyaltyProfile.preferredFacilities.length >
                            3 && (
                            <p className="text-xs text-muted-foreground">
                              +
                              {user.loyaltyProfile.preferredFacilities.length -
                                3}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Shopping Cart */}
            {user.cart && user.cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart ({user.cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.cart.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} ×{" "}
                            {currencyFormat(item.price ?? 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {currencyFormat(item.price ?? 0)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {user.cart.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{user.cart.length - 3} more items
                      </p>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between font-medium">
                        <span>Total:</span>
                        <span>
                          {currencyFormat(
                            user.cart.reduce(
                              (sum, item) => sum + (item.price || 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
        />
      )}

      {/* Enhanced Chat Widget */}
      <EnhancedChatWidget />
    </div>
  );
};

export default UserProfilePage;
