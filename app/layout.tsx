import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import Nav from "@/components/ui/Nav";
import ServiceWorkerRegistration from "@/components/ui/ServiceWorkerRegistration";
import { I18nProvider } from "@/lib/i18n/context";
import FirstRunWelcome from "@/components/ui/FirstRunWelcome";
import InstallBanner from "@/components/ui/InstallBanner";
import PinsProvider from "@/components/ui/PinsProvider";

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noisecatcher",
  description:
    "Measure noise pollution in real time. Understand its health consequences. Map it. Fight it.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Noisecatcher",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to return non-zero values on iOS
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the nc-theme cookie server-side so the correct class is in the initial HTML.
  // This eliminates the light/dark flash without any client-side script tag,
  // which also removes the React 19 "Encountered a script tag" dev warning.
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("nc-theme")?.value;
  const themeClass = themeCookie === "light" ? "light" : "";

  return (
    <html
      lang="en"
      className={[ibmMono.variable, themeClass].filter(Boolean).join(" ")}
      data-scroll-behavior="smooth"
    >
      <head />
      <body className="min-h-full flex flex-col">
        {/* iOS 18+ haptic trigger — toggling this checkbox fires UIImpactFeedbackGenerator */}
        {/* Only effective inside user-gesture event handlers */}
        <input
          id="nc-haptic-ios"
          type="checkbox"
          aria-hidden="true"
          tabIndex={-1}
          {...({ switch: "" } as Record<string, string>)}
          style={{ position: "fixed", opacity: 0, pointerEvents: "none", top: -100 }}
        />
        <ServiceWorkerRegistration />
        {/* Skip-to-content: visible only on keyboard focus */}
        <a href="#nc-main" className="skip-link">Skip to main content</a>
        <I18nProvider>
          <PinsProvider>
            <FirstRunWelcome />
            <Nav />
            {/* pb accounts for fixed bottom nav (52px) + iOS home indicator */}
            <main id="nc-main" className="flex-1 flex flex-col" style={{ paddingBottom: "calc(52px + env(safe-area-inset-bottom))" }}>{children}</main>
            <InstallBanner />
          </PinsProvider>
        </I18nProvider>
        <footer
          className="border-t px-4 py-5 text-center"
          style={{ borderColor: "var(--nc-border)" }}
        >
          <p className="te-label leading-relaxed">
            Noisecatcher — indicative readings only.{" "}
            <span style={{ color: "var(--nc-text-3)" }}>Not a certified instrument.</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
