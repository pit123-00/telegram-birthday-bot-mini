
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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    console.log("Checking for Telegram WebApp...");
    console.log("window.Telegram exists:", !!window.Telegram);
    if (window.Telegram) {
      console.log("window.Telegram.WebApp exists:", !!window.Telegram.WebApp);
    }

    // Add a small delay to make sure Telegram WebApp is initialized
    const timeout = setTimeout(() => {
      // Check if the Telegram WebApp is available
      if (window.Telegram?.WebApp) {
        console.log("Telegram WebApp detected!");
        setIsTelegramAvailable(true);
        
        try {
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
        } catch (error) {
          console.error("Error initializing Telegram WebApp:", error);
        }
      } else {
        console.log("Telegram WebApp is not available. Are you running outside of Telegram?");
        setIsTelegramAvailable(false);
      }
      
      setIsInitializing(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);

  const simulateLogin = () => {
    // For development and testing purposes only
    console.log("Simulating Telegram login");
    setUser({
      id: 123456789,
      first_name: "Demo",
      username: "demo_user"
    });
  };

  return { user, isTelegramAvailable, isInitializing, simulateLogin };
};
