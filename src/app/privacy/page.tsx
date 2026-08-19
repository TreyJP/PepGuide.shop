import type { Metadata } from 'next';

import { LegalDocumentLayout } from '@/src/components/legal/legal-document-layout';
import { BRAND } from '@/src/constants/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${BRAND.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy" version={BRAND.privacyVersion}>
      <p>
        This Privacy Policy explains how {BRAND.name} (&ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares
        information when you use our website and applications (the
        &ldquo;Service&rdquo;).
      </p>

      <h2>1. Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>
          <strong>Account information</strong> such as display name, email
          address, authentication identifiers, and referral codes
        </li>
        <li>
          <strong>Usage information</strong> such as pages viewed, features used,
          chat interactions, bookmarks, and forum activity
        </li>
        <li>
          <strong>Content you submit</strong> including messages, questions, forum
          posts, vendor reviews, and profile details
        </li>
        <li>
          <strong>Payment information</strong> processed by our payment provider
          when you subscribe to paid features. We do not store full payment card
          numbers on our servers
        </li>
        <li>
          <strong>Device and log data</strong> such as browser type, IP address,
          timestamps, and diagnostic logs used to secure and operate the Service
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service</li>
        <li>Authenticate users and secure accounts</li>
        <li>Process subscriptions and affiliate referrals</li>
        <li>Respond to support requests and moderate community features</li>
        <li>Analyze usage to improve product quality and reliability</li>
        <li>Comply with legal obligations and enforce our Terms of Service</li>
      </ul>

      <h2>3. AI and chat processing</h2>
      <p>
        When you use chat or related AI features, your prompts and conversation
        context may be processed by automated systems and infrastructure
        providers to generate responses. Do not submit sensitive personal health
        information you do not want stored or processed as part of the Service.
      </p>

      <h2>4. How we share information</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> that help us host, authenticate,
          analyze, bill, email, or support the Service
        </li>
        <li>
          <strong>Other users</strong> when you choose to post public or
          community content such as forum posts or vendor reviews
        </li>
        <li>
          <strong>Affiliate partners</strong> in connection with tracked referral
          links, clicks, or attributed sign-ups where applicable
        </li>
        <li>
          <strong>Legal and safety recipients</strong> when required by law or to
          protect users, our rights, or the integrity of the Service
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>5. Cookies and local storage</h2>
      <p>
        We use cookies, local storage, and similar technologies to keep you signed
        in, remember preferences, measure product usage, and improve performance.
        You can control cookies through your browser settings, but some features
        may not work without them.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain information for as long as needed to provide the Service, comply
        with legal obligations, resolve disputes, and enforce agreements. You may
        request deletion of your account subject to legal and operational
        retention requirements.
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational measures
        designed to protect information. No method of transmission or storage is
        completely secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Your choices</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        delete, or export certain personal information, or to object to or restrict
        certain processing. Account settings and support requests are the primary
        ways to exercise these choices through the Service.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to individuals under 18, and we do not
        knowingly collect personal information from them.
      </p>

      <h2>10. International users</h2>
      <p>
        If you access the Service from outside the United States, you understand
        that information may be processed in the United States or other countries
        where we or our providers operate.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the effective date above and may ask you to review and accept the
        updated policy before continuing to use the Service.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions may be submitted through the Settings page in the
        Service or by contacting us at{' '}
        <a href="mailto:support@pepguide.shop">support@pepguide.shop</a>.
      </p>
    </LegalDocumentLayout>
  );
}
