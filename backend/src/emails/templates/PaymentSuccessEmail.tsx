import React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { InfoCard, InfoGrid, InfoItem, StatusBadge } from '../components/EmailComponents';

interface PaymentSuccessEmailProps {
  company: {
    name: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
  };
  data: {
    amount: number;
    currency: string;
    transactionId: string;
    date: string;
  };
  baseUrl: string;
}

export const PaymentSuccessEmail: React.FC<PaymentSuccessEmailProps> = ({
  company,
  user,
  data,
  baseUrl,
}) => {
  return (
    <BaseLayout
      company={company}
      headerSubtitle="Payment Successful"
    >
      <Heading as="h2" style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 28px 0',
        borderBottom: '1px solid #e1e2e6',
        paddingBottom: '28px',
      }}>
        Payment Successful! 🎉
      </Heading>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        Hello {user.name},<br /><br />
        Your payment has been processed successfully. Thank you for your transaction!
      </Text>
      
      <InfoCard title="Payment Details" variant="success">
        <InfoGrid>
          <InfoItem label="Amount" value={`${data.currency} ${data.amount.toFixed(2)}`} />
          <InfoItem label="Transaction ID" value={data.transactionId} />
          <InfoItem label="Date" value={data.date} />
          <InfoItem 
            label="Status" 
            value={<StatusBadge status="success">Completed</StatusBadge>} 
          />
        </InfoGrid>
      </InfoCard>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        Your account has been updated with the new credits. You can now access all the features included in your plan.
      </Text>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        If you have any questions about this transaction, please contact our support team.
      </Text>
    </BaseLayout>
  );
};