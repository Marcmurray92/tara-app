import type { Metadata, Viewport } from "next";

import "@fontsource/inconsolata/400.css";
import "@fontsource/inconsolata/500.css";
import "@fontsource/inconsolata/700.css";

import { ClientSwRegister } from "@/components/app-shell/client-sw-register";
import { PageTransitionReset } from "@/components/app-shell/page-transition-reset";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tara's 30th",
    template: "%s | Tara's 30th"
  },
  description: "A polished, mobile-first birthday games app for Tara's 30th.",
  applicationName: "Tara's 30th",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tara's 30th",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#07060b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <ClientSwRegister />
        <PageTransitionReset />
        {children}
      </body>
    </html>
  );
}
