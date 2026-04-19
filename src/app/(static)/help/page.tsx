import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { DocsPage, findDocsNeighbors } from "@/widgets/docs-shell";

export const metadata: Metadata = {
  title: "Help & contact",
  description:
    "Common questions about Medlink, plus how to reach the team for support, privacy, and partnerships.",
};

const toc = [
  { id: "patients", title: "For patients" },
  { id: "doctors", title: "For doctors" },
  { id: "clinics", title: "For clinics" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "contact", title: "Contact us" },
];

export default function HelpPage() {
  const { prev, next } = findDocsNeighbors("/help");

  return (
    <DocsPage
      eyebrow="Overview"
      title="Help &amp; contact"
      description="Answers to the questions we hear most often, and how to get in touch for anything else."
      updatedOn="April 2026"
      toc={toc}
      prev={prev}
      next={next}
    >
      <h2 id="patients">For patients</h2>

      <h3>How do I book an appointment?</h3>
      <p>
        Log in, open <strong>Find a doctor</strong>, filter by specialty or
        location, open a doctor&apos;s profile, and pick a free slot from
        their schedule. You&apos;ll see the appointment in{" "}
        <strong>My appointments</strong> as soon as the request is created.
      </p>

      <h3>Can I cancel or reschedule?</h3>
      <p>
        Yes. Open the appointment in <strong>My appointments</strong> and
        use the cancel or reschedule action. Please do so ahead of time out
        of respect for the clinician&apos;s schedule.
      </p>

      <h3>How do I start a video call?</h3>
      <p>
        At the scheduled time, a <strong>Join call</strong> button appears
        on your appointment. Both you and the doctor must click it. Make
        sure your camera and microphone are allowed in the browser.
      </p>

      <h3>Is my data safe?</h3>
      <p>
        Yes. See the <em>How we protect your data</em> section on the{" "}
        <a href="/about#security">About</a> page and the{" "}
        <a href="/legal#privacy">Privacy policy</a>. In short: we encrypt
        data in transit, never store passwords in plaintext, and log
        access to medical records.
      </p>

      <h2 id="doctors">For doctors</h2>

      <h3>How long does verification take?</h3>
      <p>
        A platform admin reviews each application manually. Until your
        status becomes <strong>Approved</strong>, the patient-facing
        sections of the app are disabled. You will see the current status
        on your dashboard.
      </p>

      <h3>My verification was rejected — what now?</h3>
      <p>
        If the rejection relates to your license information, you may need
        to reset your doctor profile to resubmit corrected license details.
        The UI will guide you through it.
      </p>

      <h3>How do I publish my schedule?</h3>
      <p>
        Once verified, open <strong>My departments</strong>, pick a
        department, and create slots in your weekly calendar. Patients can
        only book the slots you expose.
      </p>

      <h3>What happens when my license expires?</h3>
      <p>
        Medlink shows a warning when your license is close to expiring and
        after it has expired. We are building automatic revocation on the
        backend; today enforcement is a warning, not a block.
      </p>

      <h2 id="clinics">For clinics</h2>

      <h3>How do I add a doctor?</h3>
      <p>
        Today doctors self-register and request to join a department. The
        department admin reviews and keeps or removes them. Bulk invite is
        on our roadmap — see the <a href="/for-clinics">For clinics</a>{" "}
        page.
      </p>

      <h3>Who can create new departments?</h3>
      <p>
        Only organization admins can create, rename, enable, or disable
        departments. Department admins manage the roster and schedule of
        their own department.
      </p>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3>I can&apos;t hear or see the other person during a call</h3>
      <p>
        Check that your browser has permission to use the camera and
        microphone. If you are on a restricted network (corporate VPN,
        hospital Wi-Fi), WebRTC media may be blocked — try a different
        network.
      </p>

      <h3>My session keeps expiring</h3>
      <p>
        Medlink issues short-lived session tokens for security. If you are
        kicked out repeatedly, clear cookies and log in again. If the
        problem persists, contact us below.
      </p>

      <h2 id="contact">Contact us</h2>
      <p>
        Medlink is an academic project. We don&apos;t have a 24/7 support
        desk yet — please be patient with our reply times, and always
        call local emergency services first if it is a medical emergency
        (see the <a href="/emergency">emergency page</a>).
      </p>

      <div className="not-prose mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" aria-hidden />
              General support
            </CardTitle>
            <CardDescription>
              Product questions, bug reports, feature ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:support@medlink.kz"
              className="text-sm font-medium underline underline-offset-4"
            >
              support@medlink.kz
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" aria-hidden />
              Privacy &amp; data requests
            </CardTitle>
            <CardDescription>
              Right of access, deletion, or correction of your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:privacy@medlink.kz"
              className="text-sm font-medium underline underline-offset-4"
            >
              privacy@medlink.kz
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" aria-hidden />
              Clinics &amp; partnerships
            </CardTitle>
            <CardDescription>
              Onboarding your clinic or hospital onto Medlink.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:partnerships@medlink.kz"
              className="text-sm font-medium underline underline-offset-4"
            >
              partnerships@medlink.kz
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4" aria-hidden />
              Where we are
            </CardTitle>
            <CardDescription>
              Department of Computer Science, Nazarbayev University,
              Astana, Kazakhstan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DocsPage>
  );
}
