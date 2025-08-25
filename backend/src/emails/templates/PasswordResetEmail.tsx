import React from 'react';
import { Heading, Text, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';
import { InfoCard, CTAButton, HighlightBox } from '../components/EmailComponents';

interface PasswordResetEmailProps {
  company: {
    name: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
  };
  resetLink: string;
  baseUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  company,
  user,
  resetLink,
  baseUrl,
}) => {
  return (
    <BaseLayout
      company={company}
      headerSubtitle="Password Reset Request"
    >
      <Heading as="h2" style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 28px 0',
        borderBottom: '1px solid #e1e2e6',
        paddingBottom: '28px',
      }}>
        Password Reset Request
      </Heading>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        Hello {user.name},<br /><br />
        We received a request to reset your password for your {company.name} account. If you didn't make this request, you can safely ignore this email.
      </Text>
      
      <InfoCard title="Reset Your Password" variant="warning">
        <Text style={{
          fontSize: '16px',
          lineHeight: 1.7,
          color: '#2d3748',
          margin: '0 0 20px 0',
        }}>
          Click the button below to create a new password. This link will expire in 1 hour for security reasons.
        </Text>
      </InfoCard>
      
      <CTAButton href={resetLink}>
        Reset Password
      </CTAButton>
      
      <HighlightBox>
        <Text style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#2d3748',
          margin: 0,
        }}>
          <strong>Security Tips:</strong><br />
          • Use a strong, unique password<br />
          • Enable two-factor authentication if available<br />
          • Never share your password with anyone<br />
          • Log out from shared devices
        </Text>
      </HighlightBox>
      
      <Text style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#9095a2',
        margin: '0 0 30px 0',
      }}>
        If you have any questions or need assistance, please contact our support team. We're here to help!
      </Text>
      
      <Text style={{
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#718096',
        margin: '0 0 20px 0',
        fontStyle: 'italic',
      }}>
        If the button above doesn't work, you can copy and paste this link into your browser:<br />
        <a href={resetLink} style={{ color: 'hsl(25 95% 53%)', wordBreak: 'break-all' }}>
          {resetLink}
        </a>
      </Text>
    </BaseLayout>
  );
};