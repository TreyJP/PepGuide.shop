import type { Metadata } from 'next';

import { LegalDocumentLayout } from '@/src/components/legal/legal-document-layout';
import { BRAND } from '@/src/constants/brand';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service',
  description: `Terms of Service for ${BRAND.name}.`,
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalDocumentLayout title="Terms of Service" version={BRAND.termsVersion}>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use
        of the {BRAND.name} website, applications, and related services
        (collectively, the &ldquo;Service&rdquo;) operated by {BRAND.name}
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an
        account or using the Service, you agree to these Terms.
      </p>

      <h2>1. Educational and research use only</h2>
      <p>
        {BRAND.name} provides educational and research information about peptides
        and related topics. The Service is not a medical service, pharmacy,
        compounding service, or vendor. We do not sell, prescribe, compound,
        distribute, or administer peptides or other products.
      </p>
      <p>
        Content on the Service — including AI-generated responses, library
        entries, calculators, protocols, guides, forum posts, vendor reviews, and
        professional Q&amp;A — is provided for general educational and research
        purposes only. It is not medical advice, diagnosis, treatment, or a
        substitute for professional healthcare guidance.
      </p>

      <h2>1.1 No emergency use</h2>
      <p>
        Do not use the Service for medical emergencies. If you believe you may
        have a medical emergency, contact local emergency services immediately.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and able to form a binding contract to
        use the Service. By registering, you represent that you meet these
        requirements.
      </p>

      <h2>3. Your account</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activity under your account. Notify us promptly
        if you suspect unauthorized access. We may suspend or terminate accounts
        that violate these Terms or pose a risk to the Service or other users.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Service to obtain or share instructions for human injection,
          reconstitution, compounding, or personal dosing plans
        </li>
        <li>
          Use the Service to buy, sell, solicit, or facilitate the sale of
          controlled, prescription, or otherwise regulated substances
        </li>
        <li>
          Post unlawful, harassing, defamatory, fraudulent, or misleading content
        </li>
        <li>
          Impersonate another person or misrepresent your affiliation with any
          person or organization
        </li>
        <li>
          Scrape, reverse engineer, or attempt to extract source code, models, or
          proprietary datasets except as permitted by law
        </li>
        <li>
          Interfere with or disrupt the Service, including by introducing malware
          or abusing rate limits
        </li>
        <li>
          Use the Service in violation of applicable law or third-party rights
        </li>
      </ul>

      <h2>5. User content</h2>
      <p>
        The Service may allow you to submit or publish content, including chat
        messages, forum posts, vendor reviews, bookmarks, questions, and profile
        information (&ldquo;User Content&rdquo;). You retain ownership of your
        User Content, but you grant us a non-exclusive, worldwide, royalty-free
        license to host, store, reproduce, display, and process User Content
        solely to operate, improve, and secure the Service.
      </p>
      <p>
        You are solely responsible for your User Content and represent that you
        have the rights needed to post it. We may remove User Content that
        violates these Terms or applicable law, but we are not obligated to
        monitor all User Content.
      </p>

      <h2>6. AI-generated content</h2>
      <p>
        Parts of the Service use automated systems, including artificial
        intelligence, to generate responses and summaries. AI output may be
        incomplete, outdated, or inaccurate. You should independently verify
        important information before relying on it. {BRAND.reportDisclaimer}
      </p>

      <h2>7. Third-party links and affiliates</h2>
      <p>
        The Service may include links to third-party websites, vendors, or
        affiliate offers. Those sites are not controlled by us, and we do not
        endorse or guarantee third-party products, pricing, quality, legality, or
        availability. Your dealings with third parties are solely between you and
        them.
      </p>
      <p>
        Some links may be affiliate or referral links. We may receive compensation
        when you use them. Affiliate relationships do not change our educational
        framing or your responsibility to evaluate any third party independently.
      </p>

      <h2>8. PepGuide Pro and paid features</h2>
      <p>
        Certain features may require a paid subscription (&ldquo;PepGuide
        Pro&rdquo;). Prices, billing intervals, and included features are shown
        at checkout or in the product UI. Paid subscriptions renew automatically
        unless canceled through the billing flow made available to you. Except
        where required by law, fees are non-refundable once a billing period has
        started.
      </p>
      <p>
        We may change plan pricing or features with reasonable notice where
        required. Feature availability may vary by region, account status, or
        release stage.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        The Service, including its design, branding, software, text, graphics,
        and curated content (excluding User Content), is owned by us or our
        licensors and is protected by intellectual property laws. You may not copy,
        modify, distribute, or create derivative works from the Service except as
        expressly permitted by these Terms or applicable law.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
        AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
        WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.
      </p>
      <p>
        We do not warrant that the Service will be uninterrupted, secure, or
        error-free, or that content will be complete or current.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR OFFICERS, DIRECTORS,
        EMPLOYEES, AND AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE
        SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU
        PAID US IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR
        (B) USD $100.
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless {BRAND.name} and its
        affiliates from claims, damages, losses, and expenses (including
        reasonable attorneys&apos; fees) arising from your use of the Service,
        your User Content, or your violation of these Terms or applicable law.
      </p>

      <h2>13. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate
        access if you violate these Terms or if we discontinue the Service. Sections
        that by their nature should survive termination will survive, including
        disclaimers, limitations of liability, and indemnification.
      </p>

      <h2>14. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. When we do, we will revise
        the effective date above and may require you to accept the updated Terms
        before continuing to use the Service. Continued use after changes become
        effective constitutes acceptance of the revised Terms.
      </p>

      <h2>15. Governing law</h2>
      <p>
        These Terms are governed by the laws of the United States and the State
        of Delaware, without regard to conflict-of-law rules, except where
        mandatory consumer protection laws in your jurisdiction provide otherwise.
      </p>

      <h2>16. Contact</h2>
      <p>
        Questions about these Terms may be submitted through the Settings page in
        the Service or by contacting us at{' '}
        <a href="mailto:support@pepguide.shop">support@pepguide.shop</a>.
      </p>
    </LegalDocumentLayout>
  );
}
