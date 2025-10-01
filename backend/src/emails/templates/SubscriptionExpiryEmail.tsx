import React from "react";
import { BaseLayout } from "../components/BaseLayout";
import {
  InfoCard,
  InfoGrid,
  InfoItem,
  CTAButton,
  HighlightBox,
  StatusBadge,
  Divider,
} from "../components/EmailComponents";

interface SubscriptionExpiryEmailProps {
  company: {
    name: string;
    contactEmail?: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
  };
  data: {
    daysRemaining: number;
    expiryDate: string;
  };
  baseUrl: string;
}

export const SubscriptionExpiryEmail: React.FC<
  SubscriptionExpiryEmailProps
> = ({ company, user, data }) => {
  const getUrgencyLevel = (days: number) => {
    if (days <= 1) return "critical";
    if (days <= 3) return "high";
    if (days <= 7) return "medium";
    return "low";
  };

  const urgencyLevel = getUrgencyLevel(data.daysRemaining);

  const urgencyMessages = {
    critical: {
      title: "⚠️ URGENT: Subscription Expires Today!",
      message:
        "Your subscription expires today! Immediate action is required to avoid service interruption.",
      variant: "error" as const,
    },
    high: {
      title: "🚨 Subscription Expires Soon!",
      message:
        "Your subscription expires in just a few days. Please renew now to avoid any service disruption.",
      variant: "warning" as const,
    },
    medium: {
      title: "⏰ Subscription Expiry Reminder",
      message:
        "Your subscription will expire soon. We recommend renewing to continue enjoying our services.",
      variant: "warning" as const,
    },
    low: {
      title: "📅 Subscription Expiry Notice",
      message:
        "This is a friendly reminder that your subscription will expire soon.",
      variant: "default" as const,
    },
  };

  const urgency = urgencyMessages[urgencyLevel as keyof typeof urgencyMessages];

  return (
    <BaseLayout company={company}>
      <InfoCard title={urgency.title} variant={urgency.variant}>
        <p>Dear {user.name},</p>
        <p>{urgency.message}</p>
      </InfoCard>

      <InfoCard title="Subscription Details">
        <InfoGrid>
          <InfoItem label="Company" value={company.name} />
          <InfoItem
            label="Days Remaining"
            value={`${data.daysRemaining} day${data.daysRemaining !== 1 ? "s" : ""}`}
          />
          <InfoItem label="Expiry Date" value={data.expiryDate} />
        </InfoGrid>
      </InfoCard>

      <InfoCard title="What Happens Next?">
        <div>
          <p>
            <strong>Before Expiry:</strong> Your account will continue to
            function normally with full access to all features.
          </p>
          <p>
            <strong>After Expiry:</strong> Your account will be temporarily
            suspended, and you'll lose access to premium features until renewal.
          </p>
          <p>
            <strong>Data Safety:</strong> Don't worry - all your data will be
            safely preserved and restored once you renew your subscription.
          </p>
        </div>
      </InfoCard>

      <InfoCard title="Renewal Options">
        <div>
          <p>
            You can renew your subscription at any time through your company
            dashboard. We offer flexible billing options:
          </p>
          <div style={{ marginTop: "16px" }}>
            <div style={{ marginBottom: "8px" }}>
              ✓ Monthly billing for flexibility
            </div>
            <div style={{ marginBottom: "8px" }}>
              ✓ Annual billing with discounts
            </div>
            <div style={{ marginBottom: "8px" }}>
              ✓ Secure payment processing
            </div>
            <div style={{ marginBottom: "8px" }}>
              ✓ Instant activation upon payment
            </div>
          </div>
        </div>
      </InfoCard>

      <CTAButton
        href={`${process.env.FRONTEND_URL || "https://taurean-inventory.com"}/admin/subscription`}
      >
        Renew Now
      </CTAButton>

      <p>
        If you have any questions about your subscription or need assistance
        with renewal, please don't hesitate to contact our support team. We're
        here to help!
      </p>

      <p>
        Thank you for being a valued customer of Taurean Inventory Management
        System.
      </p>
    </BaseLayout>
  );
};

export default SubscriptionExpiryEmail;
