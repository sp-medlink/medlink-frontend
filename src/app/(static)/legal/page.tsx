import type { Metadata } from "next";

import { DocsPage, findDocsNeighbors } from "@/widgets/docs-shell";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Terms of service, privacy policy, and cookie policy for Medlink — grouped on one page for easy reference.",
};

const toc = [
  { id: "terms", title: "Terms of service" },
  { id: "privacy", title: "Privacy policy" },
  { id: "cookies", title: "Cookie policy" },
];

export default function LegalPage() {
  const { prev, next } = findDocsNeighbors("/legal");

  return (
    <DocsPage
      eyebrow="Legal"
      title="Legal"
      description="Terms, privacy, and cookies in one place."
      updatedOn="April 2026"
      toc={toc}
      prev={prev}
      next={next}
    >
      {/* ───────────────────────────────────────────── Terms */}
      <h2 id="terms">Terms of service</h2>
      <p>
        By creating a Medlink account or using any Medlink service, you
        agree to be bound by these terms. If you don&apos;t agree,
        don&apos;t use the service.
      </p>

      <h3>Eligibility</h3>
      <p>
        You must be at least the age of medical majority in your country
        or use Medlink under the supervision of a parent or legal
        guardian. Doctors must be licensed, in good standing, and able to
        prove it.
      </p>

      <h3>Accounts</h3>
      <ul>
        <li>You are responsible for keeping your credentials confidential.</li>
        <li>
          You agree to provide accurate information, including your legal
          name and (where applicable) your license details.
        </li>
        <li>
          You may not create multiple accounts to impersonate other users
          or to circumvent platform limits.
        </li>
      </ul>

      <h3>Acceptable use</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use Medlink for any illegal purpose.</li>
        <li>Harass, impersonate, or threaten another user.</li>
        <li>
          Scrape, reverse-engineer, or interfere with the operation of
          the platform.
        </li>
        <li>Upload malware or content you do not have rights to share.</li>
        <li>
          Record a consultation without the consent of all participants.
        </li>
      </ul>

      <h3>Doctor obligations</h3>
      <p>
        Doctors on Medlink are independent licensed clinicians. By
        practicing on the platform, you confirm that your license is
        valid, that your profile reflects reality, and that you comply
        with the telemedicine rules of your jurisdiction. Medlink may
        suspend or revoke your verification if these conditions are not
        met.
      </p>

      <h3>Your content</h3>
      <p>
        You retain ownership of the content you submit (medical
        information, profile data, chat messages). You grant Medlink a
        limited license to store and transmit this content for the sole
        purpose of providing the service. See{" "}
        <a href="#privacy">Privacy policy</a> for handling details.
      </p>

      <h3>Termination</h3>
      <p>
        You may delete your account at any time. Medlink may suspend or
        terminate accounts that violate these terms. On termination, we
        delete personal data in accordance with the{" "}
        <a href="#privacy">Privacy policy</a>, retaining only what we are
        legally required to keep (for example, medical records governed
        by local health law).
      </p>

      <h3>Disclaimer of warranty and limitation of liability</h3>
      <p>
        Medlink is provided &ldquo;as is&rdquo; without warranty of any
        kind. See the <a href="/medical#liability">Medical policies</a>{" "}
        page for the scope of medical advice delivered through the
        platform. To the maximum extent permitted by law, Medlink is not
        liable for indirect, incidental, or consequential damages, or for
        the medical decisions of physicians using the platform.
      </p>

      <h3>Governing law and changes</h3>
      <p>
        These terms are governed by the laws of the Republic of
        Kazakhstan. Disputes that cannot be resolved amicably are subject
        to the competent courts in Astana. If we make a material change
        to these terms, we will notify you through the app or by email.
      </p>

      {/* ───────────────────────────────────────────── Privacy */}
      <h2 id="privacy">Privacy policy</h2>
      <p>
        This policy explains what we collect, why, and your rights. We
        never sell your data and we do not share it for advertising.
      </p>

      <h3>Data we collect</h3>
      <ul>
        <li>
          <strong>Account data:</strong> name, email, phone number, date
          of birth, address, password (hashed), and government identifier
          where required by local law.
        </li>
        <li>
          <strong>Doctor data:</strong> education, experience, license
          number, issuing country, issue and expiry dates, department
          membership.
        </li>
        <li>
          <strong>Health data:</strong> items you add to your medical
          record, notes written by your doctor during a consultation,
          prescriptions, and uploaded documents.
        </li>
        <li>
          <strong>Communication data:</strong> chat messages sent via
          Medlink.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, user agent,
          session token, and minimal logs needed to operate and debug
          the service.
        </li>
      </ul>
      <p>
        We do not store video or audio streams from consultations. See
        the <a href="/medical#recording">recording policy</a>.
      </p>

      <h3>How we use your data</h3>
      <ul>
        <li>
          To operate the platform (log you in, show your schedule, route
          messages).
        </li>
        <li>To match you with a verified clinician.</li>
        <li>
          To keep a medical record of your interactions, so you and your
          doctor can review them later.
        </li>
        <li>To detect and prevent abuse and fraud.</li>
        <li>
          To comply with legal obligations relating to health records.
        </li>
      </ul>

      <h3>Legal basis</h3>
      <p>
        Depending on where you live, we rely on one of the following
        legal bases under GDPR (EU) or equivalent frameworks such as
        local healthcare laws and HIPAA-style rules:
      </p>
      <ul>
        <li>
          <strong>Contract</strong> — we need to process your data to
          deliver the service you requested.
        </li>
        <li>
          <strong>Consent</strong> — for specific processing, including
          optional recording of a consultation.
        </li>
        <li>
          <strong>Legitimate interests</strong> — for fraud prevention,
          service security, and non-intrusive analytics.
        </li>
        <li>
          <strong>Legal obligation</strong> — for retaining medical
          records where local law requires it.
        </li>
      </ul>

      <h3>Who we share it with</h3>
      <ul>
        <li>
          <strong>Your doctor.</strong> The clinician you consult with
          sees your relevant medical data.
        </li>
        <li>
          <strong>Infrastructure providers.</strong> Hosting, database,
          and monitoring vendors who process data on our behalf under
          data-processing agreements.
        </li>
        <li>
          <strong>Authorities.</strong> When required by law — a court
          order, a public-health obligation, or a valid regulatory
          request.
        </li>
      </ul>
      <p>We do not share your data with advertising networks.</p>

      <h3>Retention and security</h3>
      <p>
        We keep your account and medical record for as long as your
        account is active and for the retention period required by local
        health law after that. When you delete your account, we delete
        personal data we are not legally required to keep and anonymize
        the rest for statistical purposes. For the mechanics of how we
        protect your data (hashing, TLS, RBAC, audit logs), see the{" "}
        <a href="/about#security">About</a> page.
      </p>

      <h3>Your rights</h3>
      <p>Subject to local law, you have the right to:</p>
      <ul>
        <li>Access a copy of your data.</li>
        <li>Correct inaccurate data.</li>
        <li>
          Delete your data (&ldquo;right to be forgotten&rdquo;).
        </li>
        <li>Export your data in a structured, portable format.</li>
        <li>Object to or restrict certain processing.</li>
        <li>
          Withdraw consent at any time (for processing based on consent).
        </li>
        <li>
          Lodge a complaint with your local data-protection authority.
        </li>
      </ul>
      <p>
        To exercise any of these, email{" "}
        <a href="mailto:privacy@medlink.kz">privacy@medlink.kz</a>. We
        aim to respond within 30 days.
      </p>

      <h3>International transfers</h3>
      <p>
        Medlink is operated from Kazakhstan. If we transfer data outside
        Kazakhstan, we do so under safeguards compatible with the law
        applicable to you (for EU residents, standard contractual
        clauses).
      </p>

      {/* ───────────────────────────────────────────── Cookies */}
      <h2 id="cookies">Cookie policy</h2>
      <p>
        Cookies are small text files stored by your browser. Medlink also
        uses similar mechanisms such as <code>localStorage</code> and{" "}
        <code>sessionStorage</code>. We collectively refer to all of
        these as &ldquo;cookies&rdquo; in this policy.
      </p>

      <h3>What we use</h3>
      <ul>
        <li>
          <strong>Session token</strong> (strictly necessary) — stores
          your short-lived JWT so you don&apos;t have to log in on every
          page.
        </li>
        <li>
          <strong>CSRF token</strong> (strictly necessary) — protects
          against cross-site request forgery on form submissions.
        </li>
        <li>
          <strong>Locale preference</strong> — remembers your chosen
          language (English / Russian / Kazakh).
        </li>
        <li>
          <strong>Theme preference</strong> — remembers light or dark
          mode if you set it explicitly.
        </li>
      </ul>

      <h3>What we do not use</h3>
      <ul>
        <li>
          <strong>No advertising cookies.</strong> We do not run ads, so
          we do not load tracking pixels or ad network cookies.
        </li>
        <li>
          <strong>No third-party analytics that tracks individuals.</strong>{" "}
          If we ever add analytics, it will be privacy-preserving and
          described here first.
        </li>
      </ul>

      <h3>Controlling cookies</h3>
      <p>
        You can delete cookies in your browser at any time. Doing so will
        log you out of Medlink and reset your preferences. Blocking
        cookies entirely will prevent you from logging in. See your
        browser&apos;s documentation for details.
      </p>
    </DocsPage>
  );
}
