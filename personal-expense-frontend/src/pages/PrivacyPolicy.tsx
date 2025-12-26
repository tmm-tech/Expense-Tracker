import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Privacy Policy for Aurex</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold mt-6">1. Introduction</h2>
              <p>
                Welcome to Aurex. We are committed to protecting your personal information and
                your right to privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our financial management application.
              </p>

              <h2 className="text-lg font-semibold mt-6">2. Information We Collect</h2>
              <h3 className="text-base font-semibold mt-4">2.1 Personal Information</h3>
              <p>We collect the following types of personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email address)</li>
                <li>Authentication data (login credentials via Hercules Auth)</li>
                <li>Profile information you provide</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">2.2 Financial Information</h3>
              <p>
                You may provide financial information including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transaction data (income, expenses, categories)</li>
                <li>Account balances and account information</li>
                <li>Budget and financial goals</li>
                <li>Investment information</li>
                <li>Bill and debt information</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">2.3 Usage Information</h3>
              <p>We automatically collect certain information about your device and usage:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Error logs and performance data</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Generate financial insights and forecasts</li>
                <li>Send alerts and notifications about your finances</li>
                <li>Provide customer support</li>
                <li>Detect and prevent fraud or unauthorized access</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">4. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Convex database infrastructure with
                industry-standard encryption. We implement appropriate technical and organizational
                measures to protect your personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>

              <h2 className="text-lg font-semibold mt-6">5. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With service providers who assist in operating our application</li>
                <li>When required by law or to protect our rights</li>
                <li>With your consent or at your direction</li>
                <li>In connection with a business transaction (merger, acquisition, etc.)</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">6. Your Rights and Choices</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of certain data processing activities</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-lg font-semibold mt-6">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services
                and fulfill the purposes outlined in this Privacy Policy. When you delete your account,
                we will delete or anonymize your personal information within 30 days, except where
                required to retain it for legal or regulatory purposes.
              </p>

              <h2 className="text-lg font-semibold mt-6">8. Third-Party Services</h2>
              <p>
                Our application uses the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hercules Auth for authentication</li>
                <li>Convex for database and backend services</li>
                <li>OpenAI for AI-powered financial insights (optional feature)</li>
              </ul>
              <p className="mt-2">
                These services have their own privacy policies and we encourage you to review them.
              </p>

              <h2 className="text-lg font-semibold mt-6">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your
                country of residence. These countries may have different data protection laws. We
                ensure appropriate safeguards are in place to protect your information.
              </p>

              <h2 className="text-lg font-semibold mt-6">10. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not
                knowingly collect personal information from children. If you believe we have
                collected information from a child, please contact us immediately.
              </p>

              <h2 className="text-lg font-semibold mt-6">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the "Last updated"
                date. You are advised to review this Privacy Policy periodically for any changes.
              </p>

              <h2 className="text-lg font-semibold mt-6">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices,
                please contact us at:
              </p>
              <ul className="list-none space-y-2 mt-2">
                <li>Email: privacy@aurex.com</li>
                <li>Address: [Your Company Address]</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}