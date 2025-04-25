
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
  const [loginError, setLoginError] = useState<string | null>(null);

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

    const timeout = setTimeout(() => {
      if (window.Telegram?.WebApp) {
        console.log("Telegram WebApp detected!");
        setIsTelegramAvailable(true);
        
        try {
          window.Telegram.WebApp.ready();

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
    // Reset any previous errors
    setLoginError(null);
    
    if (window.Telegram?.Login) {
      try {
        window.Telegram.Login.auth(
          { 
            bot_id: 8036388834, // Correct bot ID
            request_access: true,
            lang: 'ru', // Set Russian language for Telegram widget
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
                let errorMessage = "Ошибка при входе через Telegram";
                if (data?.error === "BOT_DOMAIN_INVALID") {
                  errorMessage = "Домен не подтвержден. Необходимо настроить домен в настройках бота.";
                  console.error("Telegram login error: BOT_DOMAIN_INVALID - Please configure domain in BotFather");
                } else {
                  console.error("Telegram login error:", data?.error);
                }
                setLoginError(errorMessage);
                
                // Don't simulate login automatically on domain error
                // as user should fix the domain in BotFather
                if (data?.error !== "BOT_DOMAIN_INVALID") {
                  simulateLogin(); // Fallback to demo login for other errors
                }
              }
            }
          }
        );
      } catch (error) {
        console.error("Error during Telegram login:", error);
        setLoginError("Произошла ошибка при попытке входа через Telegram");
        simulateLogin(); // Fallback to demo login
      }
    } else {
      console.log("Telegram Login API is not available, using demo login instead");
      simulateLogin(); // Fallback to demo login
    }
  };

  const simulateLogin = () => {
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
    loginError,
    loginWithTelegram,
    simulateLogin 
  };
};
