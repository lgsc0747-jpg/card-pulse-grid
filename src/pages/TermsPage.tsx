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
          <p className="text-muted-foreground">By accessing or using Card Pulse Grid ("the Service"), you agree to be bound by these Terms of Service and all applicable laws, including the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
          <p className="text-muted-foreground">Card Pulse Grid provides a platform for managing digital business cards, NFC devices, personas, and public profile pages. We reserve the right to modify or discontinue features at any time with reasonable notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. User Accounts & Data Collection</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials. During registration we collect your name, email address, and chosen username. In accordance with <strong>RA 10173</strong>, we collect and process personal information only for legitimate purposes directly related to the Service, and only to the extent necessary for those purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Consent & Lawful Processing</h2>
          <p className="text-muted-foreground">By creating an account and using the Service, you provide your informed and voluntary consent to the collection, processing, and storage of your personal data as described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. Under RA 10173, you may withdraw consent at any time by deleting your account or adjusting your cookie and data preferences in Settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Acceptable Use</h2>
          <p className="text-muted-foreground">You agree not to use the Service to: upload unlawful, harmful, or infringing content; impersonate others; interfere with the Service's operation; or attempt to gain unauthorized access to other users' data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Intellectual Property</h2>
          <p className="text-muted-foreground">You retain ownership of the content you create. By using the Service, you grant us a limited license to host, display, and distribute your content as necessary to operate the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Data Subject Rights (RA 10173)</h2>
          <p className="text-muted-foreground">As a data subject under Philippine law, you have the following rights:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Right to be Informed</strong> — Know what data we collect and how it is used.</li>
            <li><strong>Right to Access</strong> — Request a copy of your personal data.</li>
            <li><strong>Right to Rectification</strong> — Correct inaccurate or incomplete data via your profile.</li>
            <li><strong>Right to Erasure</strong> — Request deletion of your personal data.</li>
            <li><strong>Right to Object</strong> — Object to the processing of your data, including analytics cookies.</li>
            <li><strong>Right to Data Portability</strong> — Receive your data in a structured, machine-readable format.</li>
            <li><strong>Right to File a Complaint</strong> — Lodge a complaint with the National Privacy Commission (NPC).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Cookies & Tracking</h2>
          <p className="text-muted-foreground">We use cookies and local storage to operate the Service. You may accept or decline specific cookie categories (Essential, Analytics, Functional) through our cookie consent banner or the Settings page. Essential cookies are required for authentication and cannot be disabled. See our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
          <p className="text-muted-foreground">The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Termination</h2>
          <p className="text-muted-foreground">We reserve the right to suspend or terminate your account at our discretion for violation of these terms or for any reason with reasonable notice. Upon termination, your personal data will be handled in accordance with our retention policy and RA 10173.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
          <p className="text-muted-foreground">These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, including the Data Privacy Act of 2012 (RA 10173) and its Implementing Rules and Regulations.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">12. Contact & Data Protection Officer</h2>
          <p className="text-muted-foreground">For questions about these Terms or to exercise your data rights, please contact us through your account dashboard. You may also file a complaint with the <strong>National Privacy Commission</strong> at <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy.gov.ph</a>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;
