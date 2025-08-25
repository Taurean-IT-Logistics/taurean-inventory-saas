import React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { InfoCard, InfoGrid, InfoItem, CTAButton, HighlightBox } from '../components/EmailComponents';

interface WelcomeEmailProps {
  company: {
    name: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
    role?: string;
  };
  baseUrl: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  company,
  user,
  baseUrl,
}) => {
  return (
    <BaseLayout
      company={company}
      headerSubtitle="Facility Management Platform"
    >
      <Heading as="h2" style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 28px 0',
        borderBottom: '1px solid #e1e2e6',
        paddingBottom: '28px',
      }}>
        Welcome to {company.name}, {user.name}!
      </Heading>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        We're thrilled to have you join our facility management platform. Your account has been successfully created and is ready to use.
      </Text>
      
      <InfoCard title="Your Account Details">
        <InfoGrid>
          <InfoItem label="Name" value={user.name} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Role" value={user.role} />
          <InfoItem 
            label="Account Status" 
            value={<span style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: '#c6f6d5',
              color: '#22543d',
            }}>
              Active
            </span>} 
          />
        </InfoGrid>
      </InfoCard>
      
      <HighlightBox>
        <Text style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#2d3748',
          margin: 0,
        }}>
          <strong>Next Steps:</strong><br />
          • Explore available facilities and services<br />
          • Complete your profile for a personalized experience<br />
          • Book your first facility or service<br />
          • Contact our support team if you need assistance
        </Text>
      </HighlightBox>
      
      <CTAButton href={`${baseUrl}/user/dashboard`}>
        Access Your Dashboard
      </CTAButton>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        If you have any questions or need assistance, our support team is here to help 24/7.
      </Text>
    </BaseLayout>
  );
};