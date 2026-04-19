import type { Metadata } from "next";

import { DocsPage, findDocsNeighbors } from "@/widgets/docs-shell";

export const metadata: Metadata = {
  title: "About Medlink",
  description:
    "What Medlink is, why we built it, how we protect your data, and who is behind it.",
};

const toc = [
  { id: "what-is-medlink", title: "What is Medlink" },
  { id: "why", title: "Why we built it" },
  { id: "principles", title: "Our principles" },
  { id: "team", title: "The team" },
  { id: "tech", title: "How it is built" },
  { id: "security", title: "How we protect your data" },
  { id: "accessibility", title: "Accessibility" },
];

export default function AboutPage() {
  const { prev, next } = findDocsNeighbors("/about");

  return (
    <DocsPage
      eyebrow="Overview"
      title="About Medlink"
      description="A unified telemedicine platform that links patients and physicians through a trusted, privacy-first interface."
      updatedOn="April 2026"
      toc={toc}
      prev={prev}
      next={next}
    >
      <h2 id="what-is-medlink">What is Medlink</h2>
      <p>
        Medlink is a web-based telemedicine platform that lets patients find
        and consult verified physicians remotely, and lets physicians manage
        appointments, medical records, and consultations from one workspace.
        The product covers account and profile management, doctor search and
        appointment booking, real-time chat, video consultations, electronic
        medical records (EMR), and the administrative tools needed to keep
        the platform trustworthy.
      </p>

      <h2 id="why">Why we built it</h2>
      <p>
        Telemedicine became indispensable during the COVID-19 pandemic as a
        safe alternative to in-person visits, offering savings in time and
        travel and continuity of care. Despite its benefits, most existing
        platforms fail to strike the right balance between{" "}
        <strong>accessibility</strong>, <strong>privacy</strong>, and{" "}
        <strong>professional workflow</strong>. Medlink is our answer: a
        trusted web-based system where healthcare is easier to reach and
        privacy, security, and smooth interaction are not in tension.
      </p>

      <h2 id="principles">Our principles</h2>
      <ul>
        <li>
          <strong>Trust is a feature.</strong> Every doctor is manually
          verified before they can see patients. The verified badge on a
          doctor&apos;s profile means a human reviewed the license.
        </li>
        <li>
          <strong>Privacy is the default.</strong> Hashed passwords, scoped
          JWT sessions, role-based access control, TLS in transit, and audit
          logs. We do not record consultations without explicit consent from
          both parties.
        </li>
        <li>
          <strong>Workflow over features.</strong> Scheduling, chat, video,
          notes, and prescriptions live in one flow so clinicians do not
          context-switch between five tools.
        </li>
        <li>
          <strong>Accessibility matters.</strong> Standard web technologies,
          keyboard-first flows, multi-language content, and responsive
          design so anyone with an internet connection can use Medlink.
        </li>
      </ul>

      <h2 id="team">The team</h2>
      <p>
        Medlink is the senior project of a five-person team in the
        Department of Computer Science, Nazarbayev University, Astana,
        Kazakhstan.
      </p>
      <ul>
        <li>Alikhan Nashtay</li>
        <li>Bolat Labakbay</li>
        <li>Nurbolat Satybaldy</li>
        <li>Zhibek Yessilzhankyzy</li>
        <li>Ilyas Telman</li>
      </ul>

      <h2 id="tech">How it is built</h2>
      <p>
        The backend is a Go monolith exposing a REST API and WebSocket
        endpoints, backed by PostgreSQL. Real-time chat uses WebSockets;
        video consultations use WebRTC with a signaling server on our side
        and peer-to-peer media between clients. The web client is a
        Next.js + React application with TypeScript, Zustand for client
        state, and React Query for server state. A native iOS client built
        with Swift and SwiftUI mirrors the core patient and doctor
        features. The full stack runs in Docker containers for
        reproducible deployment.
      </p>

      <h2 id="security">How we protect your data</h2>
      <p>
        Healthcare data is some of the most sensitive data we could ever
        store, so security cuts across every layer of Medlink:
      </p>
      <ul>
        <li>
          <strong>Passwords</strong> are hashed with <code>bcrypt</code>;
          we never store them in plaintext.
        </li>
        <li>
          <strong>Sessions</strong> use short-lived JSON Web Tokens (JWT)
          with a refresh flow, so a leaked token has a limited blast
          radius.
        </li>
        <li>
          <strong>Authorization</strong> is role-based (patient, doctor,
          department admin, organization admin, platform admin) and
          scoped, so a doctor can only see records of patients they treat.
        </li>
        <li>
          <strong>Transport</strong> is TLS-only; no production endpoint is
          served over plain HTTP.
        </li>
        <li>
          <strong>Storage</strong> is PostgreSQL with schema migrations,
          field-level encryption for the most sensitive columns, and
          encrypted backups.
        </li>
        <li>
          <strong>Real-time media</strong> goes peer-to-peer over
          encrypted WebRTC whenever networks allow; chat runs over
          authenticated WebSockets.
        </li>
        <li>
          <strong>Audit logs</strong> record access to medical records and
          administrative actions with a timestamp and actor identity.
        </li>
      </ul>
      <p>
        If you think you&apos;ve found a security issue, please email{" "}
        <a href="mailto:security@medlink.kz">security@medlink.kz</a> before
        public disclosure. We acknowledge within 72 hours.
      </p>

      <h2 id="accessibility">Accessibility</h2>
      <p>
        Healthcare should be reachable by everyone. Medlink aims to meet{" "}
        <strong>WCAG 2.1 Level AA</strong>. We are not yet fully audited,
        but every new screen is reviewed against that standard:
      </p>
      <ul>
        <li>
          Every primary flow — sign up, log in, book an appointment, open a
          chat — is reachable by keyboard alone.
        </li>
        <li>
          Focus states are always visible. We never hide the focus ring.
        </li>
        <li>
          Body text meets 4.5:1 contrast; status is never color-only and
          always comes with a label.
        </li>
        <li>
          We build toward English, Russian, and Kazakh as first-class
          locales.
        </li>
        <li>
          The iOS client (SwiftUI) covers the main patient and doctor
          flows for users who prefer mobile.
        </li>
      </ul>
      <p>
        Hit an accessibility problem? Email{" "}
        <a href="mailto:accessibility@medlink.kz">
          accessibility@medlink.kz
        </a>{" "}
        — we treat a11y bugs as functional bugs, not polish.
      </p>
    </DocsPage>
  );
}
