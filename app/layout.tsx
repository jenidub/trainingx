import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "react-hot-toast";
import ComingSoon from "@/components/ComingSoon";
import { comingSoonConfig, landingOnlyMode, IS_DEV } from "@/lib/featureFlags";
import HomePage from "@/components/pages/Home";
import ElevenLabsWidget from "@/components/common/ElevenLabsWidget";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "TrainingX.AI - Universal Prompting for the 21st Century",
  description:
    "Master AI prompting skills with our proven training platform. Built in 2015, trusted for a decade. Start your free assessment today.",
  ...(IS_DEV && {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isComingSoon = comingSoonConfig.enabled;
  const landingOnlyEnabled = landingOnlyMode.enabled;

  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${spaceGrotesk.variable} relative`}
    >
      <head>
        {IS_DEV && <meta name="robots" content="noindex, nofollow" />}
      </head>
      <body className="font-sans antialiased relative">
        {IS_DEV ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Development Mode</h1>
              <p className="text-gray-400">Site hidden when IS_DEV=true</p>
            </div>
          </div>
        ) : isComingSoon ? (
          <ComingSoon />
        ) : landingOnlyEnabled ? (
          <Providers>
            <TooltipProvider>
              <HomePage />
              <ElevenLabsWidget />
              <Toaster />
            </TooltipProvider>
          </Providers>
        ) : (
          <Providers>
            <TooltipProvider>
              {children}
              <ElevenLabsWidget />
              <Toaster />
            </TooltipProvider>
          </Providers>
        )}
      </body>
    </html>
  );
}
