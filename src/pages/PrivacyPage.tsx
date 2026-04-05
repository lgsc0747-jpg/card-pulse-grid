import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 5, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect information you provide directly: name, email, username, profile data, and uploaded content. We also collect usage data including page views, NFC tap events, device type, and browser information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to: operate and improve the Service; provide analytics on your NFC card interactions; personalize your experience; communicate important updates; and ensure platform security.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Cookies & Local Storage</h2>
          <p className="text-muted-foreground">We use essential cookies for authentication and session management. We use local storage to save your dashboard preferences (theme, layout). Analytics cookies track anonymized usage patterns to improve the Service. You can manage cookie preferences through the consent banner.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
          <p className="text-muted-foreground">We do not sell your personal data. We may share data with: service providers who help operate the platform (hosting, analytics); law enforcement when required by law; or in connection with a business transfer.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Public Profiles</h2>
          <p className="text-muted-foreground">Information you add to your public profile (display name, headline, bio, social links) is visible to anyone who visits your profile URL. You control which personas are public or private through your dashboard.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Lead Captures</h2>
          <p className="text-muted-foreground">When visitors submit their contact information through your public profile's lead capture form, that data is stored and made available to you. You are responsible for handling visitor data in compliance with applicable privacy laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Data Retention</h2>
          <p className="text-muted-foreground">We retain your data for as long as your account is active. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
          <p className="text-muted-foreground">You have the right to: access your personal data; correct inaccurate data; request deletion of your data; export your data; and withdraw consent for optional data processing.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Security</h2>
          <p className="text-muted-foreground">We implement industry-standard security measures including encryption, row-level security policies, and secure authentication to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
          <p className="text-muted-foreground">For privacy-related inquiries, please contact us through your account dashboard.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
