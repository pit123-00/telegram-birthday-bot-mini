
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
      Login?: {
        auth: (options: {
          bot_id: number;
          request_access?: boolean;
          redirect_url?: string;
          lang?: string;
          callback: (dataOrError: any) => void;
        }) => void;
      }
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
  const [isTelegramLoginAvailable, setIsTelegramLoginAvailable] = useState<boolean>(false);

  useEffect(() => {
    console.log("Checking for Telegram WebApp...");
    console.log("window.Telegram exists:", !!window.Telegram);
    if (window.Telegram) {
      console.log("window.Telegram.WebApp exists:", !!window.Telegram.WebApp);
      console.log("window.Telegram.Login exists:", !!window.Telegram.Login);
      
      if (window.Telegram.Login) {
        setIsTelegramLoginAvailable(true);
      }
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

  const loginWithTelegram = () => {
    if (window.Telegram?.Login) {
      try {
        // Используем Telegram Login Widget API
        window.Telegram.Login.auth(
          { 
            bot_id: 6656511606, // ID вашего бота
            request_access: true,
            callback: (data) => {
              console.log("Telegram login callback:", data);
              if (data && !data.error) {
                setUser({
                  id: data.id,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  username: data.username
                });
              } else {
                console.error("Telegram login error:", data.error);
              }
            }
          }
        );
      } catch (error) {
        console.error("Error during Telegram login:", error);
        simulateLogin(); // Fallback to demo login
      }
    } else {
      console.log("Telegram Login API is not available, using demo login instead");
      simulateLogin(); // Fallback to demo login
    }
  };

  const simulateLogin = () => {
    // For development and testing purposes only
    console.log("Simulating Telegram login");
    setUser({
      id: 123456789,
      first_name: "Demo",
      username: "demo_user"
    });
  };

  return { 
    user, 
    isTelegramAvailable, 
    isInitializing, 
    isTelegramLoginAvailable,
    loginWithTelegram,
    simulateLogin 
  };
};

