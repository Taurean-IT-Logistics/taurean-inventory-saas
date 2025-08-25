import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Img,
} from "@react-email/components";
import { CONFIG } from "../../config";

interface BaseLayoutProps {
  company: {
    name: string;
    logo?: string;
  };
  children: React.ReactNode;
  headerSubtitle?: string;
  currentYear?: number;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  company,
  children,
  headerSubtitle = "Facility Management Platform",
  currentYear = new Date().getFullYear(),
}) => {
  return (
    <Html>
      <Head>
        <title>{company.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Body
        style={{
          fontFamily:
            "Fira Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
          lineHeight: 1.6,
          color: "#1a1a1a",
          backgroundColor: "#f5f5f5",
          margin: 0,
          padding: "20px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Header */}
          <Section
            style={{
              background: "hsl(220 70% 35%)",
              padding: "60px 30px 40px",
              textAlign: "center",
              color: "white",
              position: "relative",
            }}
          >
            {company.logo && (
              <Img
                src={company.logo}
                alt={company.name}
                style={{
                  maxWidth: "120px",
                  maxHeight: "50px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            )}
            <Heading
              as="h1"
              style={{
                fontSize: "32px",
                fontWeight: 700,
                margin: "0 0 8px 0",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {company.name}
            </Heading>
            <Text
              style={{
                fontSize: "16px",
                opacity: 0.9,
                fontWeight: 400,
                margin: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              {headerSubtitle}
            </Text>
          </Section>

          {/* Content */}
          <Section
            style={{
              padding: "60px 30px",
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section
            style={{
              background: "#000000",
              color: "#9095a2",
              padding: "60px 30px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                maxWidth: "475px",
                margin: "0 auto",
              }}
            >
              <Heading
                as="h2"
                style={{
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: "0 0 30px 0",
                  borderBottom: "1px solid #262626",
                  paddingBottom: "40px",
                }}
              >
                {company.name || "Taurean IT Logistics"}
              </Heading>

              <div
                style={{
                  margin: "30px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <Link
                  href={`${CONFIG.FRONTEND_BASE_URL}/dashboard`}
                  style={{
                    color: "hsl(25 95% 53%)",
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    transition: "all 0.2s ease",
                    marginLeft: "10px",
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href={`${CONFIG.FRONTEND_BASE_URL}/user/support`}
                  style={{
                    color: "hsl(25 95% 53%)",
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    transition: "all 0.2s ease",
                    marginLeft: "10px",
                  }}
                >
                  Support
                </Link>
                <Link
                  href={`${CONFIG.FRONTEND_BASE_URL}/privacy`}
                  style={{
                    color: "hsl(25 95% 53%)",
                    textDecoration: "none",
                    fontWeight: 500,
                    padding: "10px 20px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    transition: "all 0.2s ease",
                    marginLeft: "10px",
                  }}
                >
                  Privacy
                </Link>
              </div>

              <Hr
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #e2e8f0, transparent)",
                  margin: "40px 0",
                  border: "none",
                }}
              />

              <Text
                style={{
                  fontSize: "14px",
                  color: "#9095a2",
                  lineHeight: "22px",
                  margin: "0 0 25px 0",
                }}
              >
                If you do not want to receive these emails or didn't request
                this, you can ignore and delete this email.
              </Text>

              <Text
                style={{
                  fontSize: "14px",
                  color: "#9095a2",
                  margin: "25px 0 0 0",
                }}
              >
                © {currentYear} {company.name}. All rights reserved.
              </Text>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
