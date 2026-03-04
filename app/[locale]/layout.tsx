import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "@/store/provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Management System",
  icons:{
    icon:'logo3.png'
  }
};

// This tells Next.js to render the route on-demand if not pre-generated
export const dynamicParams = true;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params
  const { locale } = await params;

  // Load messages manually
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error:unknown) {

    console.error(error instanceof Error ? `Messages for locale ${locale} not found, falling back to en` : `Failed to load messages for locale ${locale}`);
    messages = (await import(`../../messages/en.json`)).default;
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Toaster position="top-right" richColors />
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}