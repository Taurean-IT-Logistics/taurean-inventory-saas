import React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';

interface CustomEmailProps {
  company: {
    name: string;
    logo?: string;
  };
  message: string;
  baseUrl: string;
}

export const CustomEmail: React.FC<CustomEmailProps> = ({
  company,
  message,
  baseUrl,
}) => {
  return (
    <BaseLayout
      company={company}
      headerSubtitle="Important Message"
    >
      <Heading as="h2" style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 28px 0',
        borderBottom: '1px solid #e1e2e6',
        paddingBottom: '28px',
      }}>
        Important Message from {company.name}
      </Heading>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        {message}
      </Text>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </Text>
    </BaseLayout>
  );
};