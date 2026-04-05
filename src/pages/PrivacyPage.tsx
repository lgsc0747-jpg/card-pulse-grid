import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-1">Last updated: April 5, 2026</p>
      <p className="text-xs text-muted-foreground mb-8">This Privacy Policy is issued in compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its Implementing Rules and Regulations.</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Personal Information Controller</h2>
          <p className="text-muted-foreground">Card Pulse Grid ("we", "us", "the Service") is the Personal Information Controller as defined under RA 10173. We determine the purpose and means of processing your personal data.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <p className="text-muted-foreground">We collect only the minimum data necessary to provide the Service:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Account Data:</strong> Full name, email address, username, and password (encrypted).</li>
            <li><strong>Profile Data:</strong> Display name, headline, bio, avatar, social links, and other information you voluntarily provide.</li>
            <li><strong>Usage Data:</strong> NFC tap events, page views, device type, and browser information (only when you consent to analytics cookies).</li>
            <li><strong>Lead Data:</strong> Contact information submitted by visitors through your public profile forms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Purpose & Legal Basis for Processing</h2>
          <p className="text-muted-foreground">Under RA 10173, we process your data based on:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Consent:</strong> You provide voluntary consent during account creation and via cookie preferences.</li>
            <li><strong>Contractual Necessity:</strong> Processing required to provide the Service you requested.</li>
            <li><strong>Legitimate Interest:</strong> Security, fraud prevention, and Service improvement.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Cookies & Local Storage</h2>
          <p className="text-muted-foreground">We categorize cookies into three types. You may accept or decline each category (except Essential) via the consent banner or Settings page:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Essential Cookies</strong> (Required): Authentication tokens and session management. These cannot be disabled as they are necessary for the Service to function.</li>
            <li><strong>Analytics Cookies</strong> (Optional): Track anonymized usage patterns such as page views and tap counts to help us improve the Service.</li>
            <li><strong>Functional Cookies</strong> (Optional): Store your preferences such as dashboard theme, widget layout, and notification settings for a personalized experience.</li>
          </ul>
          <p className="text-muted-foreground mt-2">You may withdraw consent for optional cookies at any time through Settings → Privacy & Cookies. Declining optional cookies will not affect your ability to use core features.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Data Sharing & Third Parties</h2>
          <p className="text-muted-foreground">We do not sell your personal data. We may share data only with:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Infrastructure providers who help operate the platform (hosting, database services), bound by data processing agreements.</li>
            <li>Law enforcement, when required by Philippine law or a lawful court order.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Public Profiles</h2>
          <p className="text-muted-foreground">Information you add to your public profile (display name, headline, bio, social links) is visible to anyone who visits your profile URL. You control which personas are public or private through your dashboard.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Lead Captures</h2>
          <p className="text-muted-foreground">When visitors submit their contact information through your public profile's lead capture form, that data is stored and made available to you. As a secondary Personal Information Controller, you are responsible for handling visitor data in compliance with RA 10173.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Data Retention</h2>
          <p className="text-muted-foreground">We retain your data for as long as your account is active or as needed to provide the Service. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law. Analytics data is anonymized after 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">9. Your Rights Under RA 10173</h2>
          <p className="text-muted-foreground">As a data subject, you have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Be Informed</strong> — Know what personal data we hold and how it is processed.</li>
            <li><strong>Access</strong> — Request a copy of your personal data at any time.</li>
            <li><strong>Rectify</strong> — Correct any inaccurate or incomplete data through your profile page.</li>
            <li><strong>Erase</strong> — Request deletion of your data ("right to be forgotten").</li>
            <li><strong>Object</strong> — Object to data processing, including declining analytics and functional cookies.</li>
            <li><strong>Data Portability</strong> — Receive your personal data in a structured, machine-readable format.</li>
            <li><strong>Withdraw Consent</strong> — Revoke consent at any time without affecting lawfulness of prior processing.</li>
            <li><strong>File a Complaint</strong> — Lodge a complaint with the National Privacy Commission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">10. Data Security</h2>
          <p className="text-muted-foreground">We implement organizational, physical, and technical security measures as required by RA 10173, including: encryption in transit and at rest, row-level security policies, secure authentication, and access controls. In the event of a data breach, we will notify the NPC and affected data subjects within 72 hours as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">11. Contact & National Privacy Commission</h2>
          <p className="text-muted-foreground">For privacy-related inquiries or to exercise your data rights, please contact us through your account dashboard. You may also contact the <strong>National Privacy Commission (NPC)</strong>:</p>
          <ul className="list-none text-muted-foreground mt-2 space-y-1">
            <li>Website: <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy.gov.ph</a></li>
            <li>Email: <a href="mailto:complaints@privacy.gov.ph" className="text-primary hover:underline">complaints@privacy.gov.ph</a></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
