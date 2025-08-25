import { render } from '@react-email/render';
import React from 'react';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';
import { BookingConfirmationEmail } from './templates/BookingConfirmationEmail';
import { CustomEmail } from './templates/CustomEmail';
import { PaymentSuccessEmail } from './templates/PaymentSuccessEmail';

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

  static async renderWelcomeEmail(data: EmailTemplateData): Promise<string> {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(WelcomeEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      baseUrl: data.baseUrl,
    });
    
    return await render(emailComponent);
  }

  static async renderPasswordResetEmail(data: EmailTemplateData): Promise<string> {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(PasswordResetEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      resetLink: data.resetLink!,
      baseUrl: data.baseUrl,
    });
    
    return await render(emailComponent);
  }

  static async renderBookingConfirmationEmail(data: EmailTemplateData): Promise<string> {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(BookingConfirmationEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      booking: data.booking!,
      baseUrl: data.baseUrl,
    });
    
    return await render(emailComponent);
  }

  static async renderCustomEmail(data: EmailTemplateData): Promise<string> {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(CustomEmail, {
      company: { ...data.company, logo: logoUrl },
      message: data.data?.message || '',
      baseUrl: data.baseUrl,
    });
    
    return await render(emailComponent);
  }

  static async renderPaymentSuccessEmail(data: EmailTemplateData): Promise<string> {
    const logoUrl = this.getCompanyLogoUrl(data.company.name);
    const emailComponent = React.createElement(PaymentSuccessEmail, {
      company: { ...data.company, logo: logoUrl },
      user: data.user!,
      data: data.data!,
      baseUrl: data.baseUrl,
    });
    
    return await render(emailComponent);
  }

  static async renderEmail(templateName: string, data: EmailTemplateData): Promise<string> {
    switch (templateName) {
      case 'welcome':
        return await this.renderWelcomeEmail(data);
      case 'password-reset':
        return await this.renderPasswordResetEmail(data);
      case 'booking-confirmation':
        return await this.renderBookingConfirmationEmail(data);
      case 'custom':
        return await this.renderCustomEmail(data);
      case 'payment-success':
        return await this.renderPaymentSuccessEmail(data);
      default:
        throw new Error(`Email template '${templateName}' not found`);
    }
  }
}