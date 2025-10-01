import React from "react";
import { Heading, Text, Section } from "@react-email/components";
import { BaseLayout } from "../components/BaseLayout";
import {
  InfoCard,
  InfoGrid,
  InfoItem,
  CTAButton,
  StatusBadge,
} from "../components/EmailComponents";

interface BookingSubmittedEmailProps {
  company: {
    name: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
  };
  booking: {
    id: string;
    facilityName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    currency: string;
    status: string;
  };
  baseUrl: string;
}

export const BookingSubmittedEmail: React.FC<BookingSubmittedEmailProps> = ({
  company,
  user,
  booking,
  baseUrl,
}) => {
  return (
    <BaseLayout company={company} headerSubtitle="Booking Request Submitted">
      <Heading
        as="h2"
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "#1a1a1a",
          margin: "0 0 28px 0",
          borderBottom: "1px solid #e1e2e6",
          paddingBottom: "28px",
        }}
      >
        Booking Request Submitted! 📝
      </Heading>

      <Text
        style={{
          fontSize: "16px",
          lineHeight: 1.7,
          color: "#9095a2",
          margin: "0 0 30px 0",
        }}
      >
        Hello {user.name},<br />
        <br />
        Thank you for submitting your booking request! We have received your
        request and will review it shortly.
      </Text>

      <InfoCard title="Booking Request Details" variant="default">
        <InfoGrid>
          <InfoItem label="Booking ID" value={booking.id} />
          <InfoItem label="Facility" value={booking.facilityName} />
          <InfoItem
            label="Start Date"
            value={new Date(booking.startDate).toLocaleDateString()}
          />
          <InfoItem
            label="End Date"
            value={new Date(booking.endDate).toLocaleDateString()}
          />
          <InfoItem
            label="Total Amount"
            value={`${booking.currency} ${booking.totalAmount.toFixed(2)}`}
          />
          <InfoItem
            label="Status"
            value={<StatusBadge status="info">{booking.status}</StatusBadge>}
          />
        </InfoGrid>
      </InfoCard>

      <InfoCard title="What Happens Next?">
        <Text
          style={{
            fontSize: "16px",
            lineHeight: 1.7,
            color: "#9095a2",
            margin: "0 0 20px 0",
          }}
        >
          Our team will review your booking request and get back to you within
          24 hours. You will receive a confirmation email once your booking is
          approved.
        </Text>

        <Text
          style={{
            fontSize: "16px",
            lineHeight: 1.7,
            color: "#9095a2",
            margin: "0 0 20px 0",
          }}
        >
          If you have any questions or need to make changes to your booking,
          please don't hesitate to contact us.
        </Text>
      </InfoCard>

      <Section
        style={{
          textAlign: "center",
          margin: "40px 0",
        }}
      >
        <CTAButton href={`${baseUrl}/user/dashboard`}>
          View Your Bookings
        </CTAButton>
      </Section>

      <Text
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#9095a2",
          margin: "30px 0 0 0",
          textAlign: "center",
        }}
      >
        Thank you for choosing {company.name}!<br />
        We look forward to hosting you.
      </Text>
    </BaseLayout>
  );
};
