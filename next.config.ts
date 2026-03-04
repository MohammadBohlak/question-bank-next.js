// next.config.ts
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(); // This links to ./i18n/request.ts

const nextConfig: NextConfig = {
  // Remove the manual i18n config
  // i18n: { 
  //   locales: ['en', 'ar'],
  //   defaultLocale: 'en',
  // },
  // Add any other Next.js config options here
};

export default withNextIntl(nextConfig);