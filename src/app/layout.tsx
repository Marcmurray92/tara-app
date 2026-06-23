import type { Metadata, Viewport } from "next";

import { ClientSwRegister } from "@/components/app-shell/client-sw-register";
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
  themeColor: "#0c0f16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <ClientSwRegister />
        {children}
      </body>
    </html>
  );
}

