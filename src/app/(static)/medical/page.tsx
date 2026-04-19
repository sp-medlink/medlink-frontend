import type { Metadata } from "next";

import { DocsPage, findDocsNeighbors } from "@/widgets/docs-shell";

export const metadata: Metadata = {
  title: "Medical policies",
  description:
    "What you agree to when you consult a doctor on Medlink, and what telehealth is — and is not — appropriate for.",
};

const toc = [
  { id: "consent", title: "Telehealth consent" },
  { id: "recording", title: "Recording policy" },
  { id: "data-shared", title: "What data is shared" },
  { id: "scope", title: "Scope of telehealth" },
  { id: "not-a-substitute", title: "Not a substitute for in-person care" },
  { id: "prescriptions", title: "Prescriptions" },
  { id: "liability", title: "Limitation of liability" },
];

export default function MedicalPage() {
  const { prev, next } = findDocsNeighbors("/medical");

  return (
    <DocsPage
      eyebrow="Medical"
      title="Medical policies"
      description="Telehealth consent, recording policy, and the scope and limits of remote care on Medlink."
      updatedOn="April 2026"
      toc={toc}
      prev={prev}
      next={next}
    >
      <p>
        This page explains, in plain language, what you agree to when you
        start a chat or video consultation on Medlink, and what telehealth
        is appropriate for. It is a summary — the binding terms live in the{" "}
        <a href="/legal#terms">Terms of service</a> and{" "}
        <a href="/legal#privacy">Privacy policy</a>.
      </p>

      <h2 id="consent">Telehealth consent</h2>
      <p>By starting a consultation on Medlink you confirm that:</p>
      <ul>
        <li>
          You are at least the age of medical majority in your country, or
          you are accompanied by a parent or legal guardian.
        </li>
        <li>
          You understand that telehealth has limits — see the{" "}
          <a href="#scope">Scope of telehealth</a> section below.
        </li>
        <li>
          You understand that Medlink is not an emergency service. For
          medical emergencies, see the{" "}
          <a href="/emergency">emergency page</a>.
        </li>
        <li>
          You agree to share accurate health information with your doctor
          during the consultation so they can advise you correctly.
        </li>
      </ul>

      <h2 id="recording">Recording policy</h2>
      <p>
        <strong>Medlink does not record consultations by default.</strong>{" "}
        Video streams are peer-to-peer and are not stored on our servers.
        Chat messages are persisted so you and your doctor can review the
        conversation later, but the content is scoped to the parties of
        the consultation.
      </p>
      <p>
        A consultation may only be recorded when <strong>both parties
        give explicit consent</strong>. If you are ever asked to record,
        the request must be clear and you may decline at any time.
      </p>

      <h2 id="data-shared">What data is shared with your doctor</h2>
      <p>
        During a consultation, your doctor sees the medical information
        you have attached to your profile and any test results, history,
        or images you explicitly share for that visit. They do not see the
        profiles of other Medlink users.
      </p>
      <p>
        After the consultation, your doctor can add encounter notes, a
        diagnosis, and prescriptions to your record. You can review these
        at any time under <strong>My records</strong>.
      </p>

      <h2 id="scope">Scope of telehealth</h2>
      <p>
        Medlink connects you with licensed physicians for{" "}
        <strong>scheduled</strong>, <strong>non-emergency</strong>,{" "}
        <strong>remote</strong> consultations. Typical uses include:
      </p>
      <ul>
        <li>Follow-up on a previously diagnosed condition.</li>
        <li>Review of lab results or imaging.</li>
        <li>Questions about a prescription you already take.</li>
        <li>Advice on whether to book an in-person visit.</li>
        <li>Second opinions on non-urgent matters.</li>
      </ul>

      <h2 id="not-a-substitute">Not a substitute for in-person care</h2>
      <p>
        Some conditions cannot be assessed remotely. A telehealth
        consultation does <strong>not replace</strong>:
      </p>
      <ul>
        <li>
          Emergency care — see the <a href="/emergency">emergency page</a>.
        </li>
        <li>
          Physical examination requiring auscultation, palpation, imaging,
          or laboratory tests done on site.
        </li>
        <li>Mental health crisis intervention.</li>
        <li>Procedures of any kind.</li>
      </ul>
      <p>
        If your doctor determines during a consultation that your
        condition requires in-person care, they will tell you so. Please
        follow that advice.
      </p>

      <h2 id="prescriptions">Prescriptions</h2>
      <p>
        Doctors on Medlink may issue digital prescriptions where local
        law permits. What, and how much, can be prescribed via telehealth
        is governed by the jurisdiction of the prescribing doctor.
        Controlled substances are typically out of scope for telehealth.
      </p>

      <h2 id="liability">Limitation of liability</h2>
      <p>
        Medlink is a platform. It connects you with independent licensed
        physicians who provide medical advice at their own professional
        discretion. Responsibility for the medical judgment rests with
        the treating clinician. The platform is provided without medical
        warranty.
      </p>
      <p>
        By using Medlink, you agree that the platform operator and its
        academic sponsors are not liable for the medical decisions of
        physicians you consult, subject to applicable consumer and
        healthcare law. See the <a href="/legal#terms">Terms of service</a>{" "}
        for the binding text.
      </p>
    </DocsPage>
  );
}
