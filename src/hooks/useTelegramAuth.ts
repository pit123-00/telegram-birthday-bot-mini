
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
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
  
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if the Telegram WebApp is available
    if (window.Telegram?.WebApp) {
      setIsTelegramAvailable(true);
      
      // Notify Telegram webapp that we are ready
      window.Telegram.WebApp.ready();

      // Get user data from Telegram
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (telegramUser) {
        setUser(telegramUser);
        console.log("Telegram user found:", telegramUser);
      } else {
        console.log("No Telegram user data available");
      }
    } else {
      console.log("Telegram WebApp is not available. Are you running outside of Telegram?");
      setIsTelegramAvailable(false);
    }
  }, []);

  return { user, isTelegramAvailable };
};
