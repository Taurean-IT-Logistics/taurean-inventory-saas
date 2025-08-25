"use client";

import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  MessageSquare,
  Users,
  Shield,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";

export default function SupportPage() {
  const { user } = useAuth();

  const supportFeatures = [
    {
      icon: MessageSquare,
      title: "Integrated Chat Widget",
      description:
        "Access support directly through the floating chat widget with dual-mode functionality",
      features: [
        "Facility assistant chat",
        "Support ticket creation",
        "Real-time messaging",
        "File attachments",
      ],
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Different support levels based on user roles and permissions",
      features: [
        "User tickets",
        "Staff management",
        "Admin oversight",
        "Super admin control",
      ],
    },
    {
      icon: Shield,
      title: "Company Isolation",
      description: "Secure support system with company-specific data isolation",
      features: [
        "Company boundaries",
        "User permissions",
        "Data security",
        "Access control",
      ],
    },
    {
      icon: Building2,
      title: "Multi-Company Support",
      description:
        "Support system that works across multiple companies and users",
      features: [
        "Company management",
        "User association",
        "Cross-company admin",
        "Scalable architecture",
      ],
    },
  ];

  const supportCategories = [
    {
      value: "technical",
      label: "Technical Issues",
      description: "Software, hardware, or system problems",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      value: "billing",
      label: "Billing & Payment",
      description: "Invoice, payment, or subscription issues",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      value: "feature_request",
      label: "Feature Requests",
      description: "New functionality or improvements",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      value: "bug_report",
      label: "Bug Reports",
      description: "System errors or unexpected behavior",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      value: "general",
      label: "General Inquiry",
      description: "Other questions or support needs",
      icon: HelpCircle,
      color: "text-gray-600",
    },
  ];

  const supportPriorities = [
    {
      value: "low",
      label: "Low Priority",
      description: "Minor issues, non-urgent",
      color: "text-green-600 bg-green-100",
      responseTime: "24-48 hours",
    },
    {
      value: "medium",
      label: "Medium Priority",
      description: "Standard priority issues",
      color: "text-yellow-600 bg-yellow-100",
      responseTime: "12-24 hours",
    },
    {
      value: "high",
      label: "High Priority",
      description: "Important issues affecting work",
      color: "text-orange-600 bg-orange-100",
      responseTime: "4-8 hours",
    },
    {
      value: "urgent",
      label: "Urgent Priority",
      description: "Critical issues requiring immediate attention",
      color: "text-red-600 bg-red-100",
      responseTime: "1-2 hours",
    },
  ];

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Support Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              Please log in to access the support center.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Get comprehensive support through our integrated chat widget. Access
          facility assistance, create support tickets, and get real-time help
          from our support team.
        </p>
      </div>

      {/* Support Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {supportFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.features.map((feat, featIndex) => (
                  <li key={featIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Support Categories and Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Support Categories
            </CardTitle>
            <CardDescription>
              Choose the most appropriate category for your support request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportCategories.map((category) => (
                <div
                  key={category.value}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <category.icon
                    className={`h-5 w-5 mt-0.5 ${category.color}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{category.label}</h4>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Priority Levels
            </CardTitle>
            <CardDescription>
              Understand how we prioritize and respond to support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportPriorities.map((priority) => (
                <div
                  key={priority.value}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Badge className={priority.color}>{priority.label}</Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {priority.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Response time:{" "}
                      <span className="font-medium">
                        {priority.responseTime}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with support or access your existing tickets through the
            chat widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="flex items-center gap-2">
              <Link href="/user/dashboard?tab=chat">
                <MessageSquare className="h-4 w-4" />
                Open Support Chat
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link href="/user/dashboard?tab=invitations">
                <Building2 className="h-4 w-4" />
                Company Invitations
              </Link>
            </Button>
            {["admin", "staff"].includes(user?.role || "") && (
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2"
              >
                <Link href="/admin/users?tab=support">
                  <Users className="h-4 w-4" />
                  Support Management
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Widget Integration Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat Widget Integration
          </CardTitle>
          <CardDescription>
            Access support directly through the floating chat widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <MessageSquare className="h-16 w-16 mx-auto text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Enhanced Chat Widget</h3>
            <p className="text-gray-600 mb-4">
              The chat widget is always available in the bottom-right corner and
              provides:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Facility Assistant</h4>
                  <p className="text-xs text-gray-600">
                    Get help with bookings, pricing, and availability
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Support Tickets</h4>
                  <p className="text-xs text-gray-600">
                    Create and manage support requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Real-time Chat</h4>
                  <p className="text-xs text-gray-600">
                    Instant messaging with support staff
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Look for the chat bubble icon in the bottom-right corner to get
                started!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chat Widget - Always visible */}
      <EnhancedChatWidget />
    </div>
  );
}
