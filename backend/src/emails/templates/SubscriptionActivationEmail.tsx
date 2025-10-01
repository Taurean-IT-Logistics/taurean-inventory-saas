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

interface SubscriptionActivationEmailProps {
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
    plan: string;
    licenseKey: string;
    expiresAt: string;
    amount: number;
    currency: string;
    features: string[];
  };
  baseUrl: string;
}

export const SubscriptionActivationEmail: React.FC<
  SubscriptionActivationEmailProps
> = ({ company, user, data }) => {
  const formatPlanName = (plan: string) => {
    const planNames: Record<string, string> = {
      basic: "Basic Plan",
      premium: "Premium Plan",
      enterprise: "Enterprise Plan",
      free_trial: "Free Trial",
      monthly: "Monthly Plan",
      biannual: "Bi-Annual Plan",
      annual: "Annual Plan",
    };
    return planNames[plan] || plan;
  };

  return (
    <BaseLayout company={company}>
      <InfoCard
        title="Subscription Activated Successfully! 🎉"
        variant="success"
      >
        <p>Dear {user.name},</p>
        <p>
          Congratulations! Your subscription to{" "}
          <strong>{formatPlanName(data.plan)}</strong> has been successfully
          activated for <strong>{company.name}</strong>.
        </p>
      </InfoCard>

      <InfoCard title="Subscription Details">
        <InfoGrid>
          <InfoItem label="Plan" value={formatPlanName(data.plan)} />
          <InfoItem
            label="Amount Paid"
            value={`${data.currency} ${data.amount}`}
          />
          <InfoItem label="Expires On" value={data.expiresAt} />
          <InfoItem label="License Key" value={data.licenseKey} />
        </InfoGrid>
      </InfoCard>

      <InfoCard title="Plan Features">
        <div>
          {data.features.map((feature, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              ✓ {feature}
            </div>
          ))}
        </div>
      </InfoCard>

      <HighlightBox>
        <h3>Important Information</h3>
        <p>
          <strong>License Key:</strong> Please keep your license key safe.
          You'll need it for account verification and support requests.
        </p>
        <p>
          <strong>Access:</strong> You now have full access to all features
          included in your plan. You can manage your subscription and view usage
          statistics from your company dashboard.
        </p>
        <p>
          <strong>Support:</strong> If you have any questions or need
          assistance, please don't hesitate to contact our support team.
        </p>
      </HighlightBox>

      <CTAButton
        href={`${process.env.FRONTEND_URL || "https://taurean-inventory.com"}/admin/subscription`}
      >
        Manage Subscription
      </CTAButton>

      <p>
        Thank you for choosing Taurean Inventory Management System. We're
        excited to help you streamline your business operations!
      </p>
    </BaseLayout>
  );
};

export default SubscriptionActivationEmail;
