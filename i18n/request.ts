import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'ar'] as const;

export default getRequestConfig(async ({ locale }) => {
  const safeLocale =
    locale && locales.includes(locale as (typeof locales)[number])
      ? locale
      : 'ar';

  const messages = (await import(`../messages/${safeLocale}.json`)).default;

  return {
    locale: safeLocale, // ✅ always string
    messages,
  };
});
