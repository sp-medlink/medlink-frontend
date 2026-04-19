import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootProviders } from "./_providers/root-providers";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Medlink",
  description: "Medlink — telemedicine platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
