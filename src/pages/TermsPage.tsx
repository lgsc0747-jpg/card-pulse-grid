import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-display font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 5, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">By accessing or using Card Pulse Grid ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
          <p className="text-muted-foreground">Card Pulse Grid provides a platform for managing digital business cards, NFC devices, personas, and public profile pages. We reserve the right to modify or discontinue features at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration and keep it up to date. You must not share your account or allow unauthorized access.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to use the Service to: upload unlawful, harmful, or infringing content; impersonate others; interfere with the Service's operation; or attempt to gain unauthorized access to other users' data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
          <p className="text-muted-foreground">You retain ownership of the content you create. By using the Service, you grant us a limited license to host, display, and distribute your content as necessary to operate the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
          <p className="text-muted-foreground">We reserve the right to suspend or terminate your account at our discretion for violation of these terms or for any reason with reasonable notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
          <p className="text-muted-foreground">We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p className="text-muted-foreground">For questions about these Terms, please contact us through your account dashboard.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;
