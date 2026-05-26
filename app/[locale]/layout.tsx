import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/layout/nav";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "../globals.css";

// Publisher ID is public — it appears in the HTML source of every AdSense page.
// Hardcoded so it loads regardless of build-time env var availability.
const ADSENSE_PUBLISHER_ID = "ca-pub-5899330070144720";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces — modern expressive serif for newspaper-style headlines and masthead.
// Variable font with optical sizes; we use weight 500-800 for hierarchy.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    manifest: "/manifest.json",
    alternates: {
      canonical: `${APP_URL}/${locale}`,
      languages: {
        es: `${APP_URL}/es`,
        en: `${APP_URL}/en`,
        // Spanish is the primary LATAM audience — favour /es as the default
        "x-default": `${APP_URL}/es`,
      },
    },
    openGraph: {
      siteName: t("title"),
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    other: {
      // AdSense site verification meta tag
      "google-adsense-account": ADSENSE_PUBLISHER_ID,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {/* Google AdSense */}
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <NextIntlClientProvider messages={messages}>
          <Nav locale={locale} />
          {children}
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
