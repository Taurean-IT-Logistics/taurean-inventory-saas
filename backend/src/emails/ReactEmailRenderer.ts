import { render } from '@react-email/render';
import React from 'react';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { BookingConfirmationEmail } from './templates/BookingConfirmationEmail';

export interface EmailTemplateData {
  company: {
    name: string;
    logo?: string;
  };
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  recipient?: {
    name: string;
    email: string;
  };
  data?: any;
  baseUrl: string;
  resetLink?: string;
  booking?: {
    id: string;
    facilityName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    currency: string;
    status: string;
  };
}

export class ReactEmailRenderer {
  private static getCompanyLogoUrl(companyName: string): string {
    // Use BACKEND_BASE_URL for company logos and assets
    const backendUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
    return `${backendUrl}/logo.webp`;
  }

  static renderWelcomeEmail(data: EmailTemplateData): string {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(WelcomeEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      baseUrl: data.baseUrl,
    });
    
    return render(emailComponent);
  }

  static renderPasswordResetEmail(data: EmailTemplateData): string {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(PasswordResetEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      resetLink: data.resetLink!,
      baseUrl: data.baseUrl,
    });
    
    return render(emailComponent);
  }

  static renderBookingConfirmationEmail(data: EmailTemplateData): string {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(BookingConfirmationEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      booking: data.booking!,
      baseUrl: data.baseUrl,
    });
    
    return render(emailComponent);
  }

  static renderEmail(templateName: string, data: EmailTemplateData): string {
    switch (templateName) {
      case 'welcome':
        return this.renderWelcomeEmail(data);
      case 'password-reset':
        return this.renderPasswordResetEmail(data);
      case 'booking-confirmation':
        return this.renderBookingConfirmationEmail(data);
      default:
        throw new Error(`Email template '${templateName}' not found`);
    }
  }
}