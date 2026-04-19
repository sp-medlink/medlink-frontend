import type { Metadata } from "next";

import { TestSidebarPreview } from "./test-preview";

export const metadata: Metadata = {
  title: "UI preview",
  description: "Public dev preview: sidebar + home layout at /test (no login).",
};

export default function TestPage() {
  return <TestSidebarPreview />;
}
