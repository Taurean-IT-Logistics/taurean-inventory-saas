import React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { InfoCard, InfoGrid, InfoItem, CTAButton, StatusBadge } from '../components/EmailComponents';

interface BookingConfirmationEmailProps {
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

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  company,
  user,
  booking,
  baseUrl,
}) => {
  return (
    <BaseLayout
      company={company}
      headerSubtitle="Booking Confirmation"
    >
      <Heading as="h2" style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 28px 0',
        borderBottom: '1px solid #e1e2e6',
        paddingBottom: '28px',
      }}>
        Booking Confirmed! 🎉
      </Heading>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        Hello {user.name},<br /><br />
        Your booking has been successfully confirmed! We're excited to host you at our facility.
      </Text>
      
      <InfoCard title="Booking Details" variant="success">
        <InfoGrid>
          <InfoItem label="Booking ID" value={booking.id} />
          <InfoItem label="Facility" value={booking.facilityName} />
          <InfoItem label="Start Date" value={new Date(booking.startDate).toLocaleDateString()} />
          <InfoItem label="End Date" value={new Date(booking.endDate).toLocaleDateString()} />
          <InfoItem label="Total Amount" value={`${booking.currency} ${booking.totalAmount.toFixed(2)}`} />
          <InfoItem 
            label="Status" 
            value={<StatusBadge status="success">{booking.status}</StatusBadge>} 
          />
        </InfoGrid>
      </InfoCard>
      
      <InfoCard title="What's Next?">
        <Text style={{
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#2d3748',
          margin: '0 0 20px 0',
        }}>
          • You'll receive a reminder 24 hours before your booking<br />
          • Check-in at the facility reception desk<br />
          • Bring any required documentation or equipment<br />
          • Contact us if you need to modify or cancel
        </Text>
      </InfoCard>
      
      <CTAButton href={`${baseUrl}/bookings/${booking.id}`}>
        View Booking Details
      </CTAButton>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        If you have any questions about your booking or need to make changes, please don't hesitate to contact our support team.
      </Text>
      
      <Text style={{
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#718096',
        margin: '0 0 20px 0',
        fontStyle: 'italic',
      }}>
        <strong>Important:</strong> Please arrive 15 minutes before your scheduled start time to complete check-in procedures.
      </Text>
    </BaseLayout>
  );
};