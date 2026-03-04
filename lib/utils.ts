import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// lib/utils.ts
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useTranslation() {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname.startsWith('/en') ? 'en' : 'ar';
    fetch(`/messages/${locale}.json`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [pathname]);

  return messages;
}

// Optional: For server-side or non-component usage
export async function getTranslations(locale: string) {
  const res = await fetch(`./lib/messages/${locale}.json`);
  return await res.json();
}