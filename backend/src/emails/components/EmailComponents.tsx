import React from 'react';
import {
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

// Info Card Component
interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          background: '#f0fff4',
          borderColor: '#9ae6b4',
          titleColor: '#22543d',
        };
      case 'warning':
        return {
          background: '#fef5e7',
          borderColor: '#fbd38d',
          titleColor: '#c05621',
        };
      case 'error':
        return {
          background: '#fed7d7',
          borderColor: '#feb2b2',
          titleColor: '#c53030',
        };
      default:
        return {
          background: '#f8fafc',
          borderColor: '#e2e8f0',
          titleColor: '#2d3748',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Section style={{
      background: styles.background,
      border: `1px solid ${styles.borderColor}`,
      borderRadius: '12px',
      padding: '24px',
      margin: '24px 0',
    }}>
      <Text style={{
        fontSize: '18px',
        fontWeight: 600,
        color: styles.titleColor,
        margin: '0 0 12px 0',
      }}>
        {title}
      </Text>
      {children}
    </Section>
  );
};

// Info Grid Component
interface InfoGridProps {
  children: React.ReactNode;
}

export const InfoGrid: React.FC<InfoGridProps> = ({ children }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    }}>
      {children}
    </div>
  );
};

// Info Item Component
interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Text style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: '0 0 4px 0',
      }}>
        {label}
      </Text>
      <Text style={{
        fontSize: '15px',
        fontWeight: 600,
        color: '#2d3748',
        margin: 0,
      }}>
        {value}
      </Text>
    </div>
  );
};

// CTA Button Component
interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ href, children }) => {
  return (
    <Section style={{
      textAlign: 'center',
      margin: '40px 0',
    }}>
      <Button
        href={href}
        style={{
          background: 'hsl(25 95% 53%)',
          color: 'white',
          textDecoration: 'none',
          padding: '18px 36px',
          borderRadius: '40px',
          fontWeight: 800,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {children}
      </Button>
    </Section>
  );
};

// Highlight Box Component
interface HighlightBoxProps {
  children: React.ReactNode;
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({ children }) => {
  return (
    <Section style={{
      background: 'linear-gradient(135deg, hsl(220 70% 35% 0.1), hsl(25 95% 53% 0.1))',
      borderLeft: '4px solid hsl(220 70% 35%)',
      padding: '16px 20px',
      borderRadius: '0 8px 8px 0',
      margin: '20px 0',
    }}>
      {children}
    </Section>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return {
          background: '#c6f6d5',
          color: '#22543d',
        };
      case 'warning':
        return {
          background: '#fef5e7',
          color: '#c05621',
        };
      case 'error':
        return {
          background: '#fed7d7',
          color: '#c53030',
        };
      case 'info':
        return {
          background: '#bee3f8',
          color: '#2a4365',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: styles.background,
      color: styles.color,
    }}>
      {children}
    </span>
  );
};

// Divider Component
export const Divider: React.FC = () => {
  return (
    <Hr style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
      margin: '30px 0',
      border: 'none',
    }} />
  );
};