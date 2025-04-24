
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready(): void;
        close(): void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export const useTelegramAuth = () => {
  const [user, setUser] = useState<{
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  } | null>(null);

  useEffect(() => {
    // Notify Telegram webapp that we are ready
    window.Telegram.WebApp.ready();

    // Get user data from Telegram
    const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
    if (telegramUser) {
      setUser(telegramUser);
    }
  }, []);

  return { user };
};
