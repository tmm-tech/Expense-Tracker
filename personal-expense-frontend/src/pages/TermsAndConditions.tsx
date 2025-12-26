import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
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
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Terms & Conditions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Terms and Conditions for Aurex</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="text-foreground">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mt-6">1. Agreement to Terms</h2>
              <p className="text-foreground">
                By accessing or using Aurex ("the Service"), you agree to be bound by these
                Terms and Conditions ("Terms"). If you disagree with any part of these terms,
                you may not access the Service.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">2. Description of Service</h2>
              <p className="text-foreground">
                Aurex is a financial management application that helps users track expenses,
                manage budgets, monitor investments, set financial goals, and receive financial
                insights. The Service is provided "as is" and "as available."
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">3. User Accounts</h2>
              <h3 className="text-base font-semibold text-foreground mt-4">3.1 Account Creation</h3>
              <p className="text-foreground">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Immediately notify us of any unauthorized access</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-4">3.2 Account Eligibility</h3>
              <p className="text-foreground">
                You must be at least 18 years old to create an account and use the Service.
                By creating an account, you represent that you meet this age requirement.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">4. User Responsibilities</h2>
              <p className="text-foreground">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Use the Service only for lawful purposes</li>
                <li>Not violate any applicable laws or regulations</li>
                <li>Not impersonate others or provide false information</li>
                <li>Not interfere with or disrupt the Service</li>
                <li>Not attempt to gain unauthorized access to the Service</li>
                <li>Not use the Service for any commercial purpose without authorization</li>
                <li>Maintain the accuracy of your financial data</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground mt-6">5. Financial Information Disclaimer</h2>
              <p className="text-foreground">
                <strong>Important:</strong> Aurex is a financial tracking and management tool.
                It is NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>A substitute for professional financial advice</li>
                <li>A recommendation to buy, sell, or hold any investment</li>
                <li>A guarantee of financial outcomes or results</li>
                <li>An official financial institution or banking service</li>
              </ul>
              <p className="mt-2 text-foreground">
                All financial decisions are your sole responsibility. We recommend consulting
                with qualified financial professionals before making significant financial decisions.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">6. Data Accuracy</h2>
              <p className="text-foreground">
                You are responsible for the accuracy of all financial data you enter into the
                Service. While we provide tools for forecasting and insights, these are estimates
                based on the data you provide and should not be considered financial advice or
                guarantees.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">7. Intellectual Property</h2>
              <p className="text-foreground">
                The Service and its original content, features, and functionality are owned by
                Aurex and are protected by international copyright, trademark, patent, trade
                secret, and other intellectual property laws.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">8. User Content</h2>
              <h3 className="text-base font-semibold text-foreground mt-4">8.1 Your Data</h3>
              <p className="text-foreground">
                You retain all rights to the financial data and information you input into the
                Service. By using the Service, you grant us a license to use, store, and process
                your data solely for the purpose of providing the Service to you.
              </p>

              <h3 className="text-base font-semibold text-foreground mt-4">8.2 Data Export</h3>
              <p className="text-foreground">
                You can export your data at any time through the Service's export functionality.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">9. AI Features</h2>
              <p className="text-foreground">
                The Service may use artificial intelligence to provide financial insights and
                recommendations. These AI-generated insights are:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Based on algorithms and your historical data</li>
                <li>Not guaranteed to be accurate or complete</li>
                <li>Not a substitute for professional financial advice</li>
                <li>Subject to limitations and potential errors</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground mt-6">10. Third-Party Services</h2>
              <p className="text-foreground">
                The Service integrates with third-party services including Hercules Auth for
                authentication and Convex for data storage. Your use of these services is subject
                to their respective terms and privacy policies.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">11. Service Modifications</h2>
              <p className="text-foreground">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Modify or discontinue any feature of the Service</li>
                <li>Change these Terms at any time</li>
                <li>Suspend or terminate your access for violations</li>
                <li>Update pricing or introduce new fees with notice</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground mt-6">12. Limitation of Liability</h2>
              <p className="text-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUREX SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Financial losses resulting from decisions made using the Service</li>
                <li>Service interruptions, errors, or data loss</li>
                <li>Actions of third-party services</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground mt-6">13. Indemnification</h2>
              <p className="text-foreground">
                You agree to indemnify and hold harmless Aurex and its officers, directors,
                employees, and agents from any claims, damages, losses, liabilities, and expenses
                arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground mt-6">14. Warranty Disclaimer</h2>
              <p className="text-foreground">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">15. Termination</h2>
              <p className="text-foreground">
                We may terminate or suspend your account and access to the Service immediately,
                without prior notice or liability, for any reason, including breach of these Terms.
                Upon termination, your right to use the Service will immediately cease.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">16. Governing Law</h2>
              <p className="text-foreground">
                These Terms shall be governed by and construed in accordance with the laws of
                [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">17. Dispute Resolution</h2>
              <p className="text-foreground">
                Any disputes arising from these Terms or the Service shall be resolved through
                binding arbitration in accordance with the rules of [Arbitration Body], except
                where prohibited by law.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">18. Severability</h2>
              <p className="text-foreground">
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary so that
                these Terms shall otherwise remain in full force and effect.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">19. Entire Agreement</h2>
              <p className="text-foreground">
                These Terms constitute the entire agreement between you and Aurex regarding the
                Service and supersede all prior agreements and understandings.
              </p>

              <h2 className="text-lg font-semibold text-foreground mt-6">20. Contact Information</h2>
              <p className="text-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-2 mt-2 text-foreground">
                <li>Email: legal@aurex.com</li>
                <li>Address: [Your Company Address]</li>
              </ul>

              <p className="mt-6 text-sm text-muted-foreground">
                By using Aurex, you acknowledge that you have read, understood, and agree to be
                bound by these Terms and Conditions.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}