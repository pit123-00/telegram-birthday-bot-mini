import { useEffect, useState } from 'react';
import { saveUser, initDatabase } from '../services/dbService';

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
          callback?: (dataOrError: any) => void;
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
    const initDb = async () => {
      try {
        await initDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
      
      console.log("Checking for Telegram WebApp...");
      console.log("window.Telegram exists:", !!window.Telegram);
      if (window.Telegram) {
        console.log("window.Telegram.WebApp exists:", !!window.Telegram.WebApp);
        console.log("window.Telegram.Login exists:", !!window.Telegram.Login);
        
        if (window.Telegram.Login) {
          setIsTelegramLoginAvailable(true);
        }
      }

      if (window.Telegram?.WebApp) {
        console.log("Telegram WebApp detected!");
        setIsTelegramAvailable(true);
        
        try {
          window.Telegram.WebApp.ready();
          
          const webAppData = window.Telegram.WebApp.initDataUnsafe;
          console.log("WebApp data:", webAppData);
          
          if (webAppData && webAppData.user) {
            const telegramUser = webAppData.user;
            setUser(telegramUser);
            console.log("Telegram WebApp user found:", telegramUser);
            
            try {
              await saveUser(telegramUser);
            } catch (error) {
              console.error("Failed to save WebApp user to database:", error);
            }
          } else {
            console.log("No WebApp user data available");
          }
        } catch (error) {
          console.error("Error initializing Telegram WebApp:", error);
        }
      } else {
        console.log("Telegram WebApp is not available. Running in browser mode.");
        setIsTelegramAvailable(false);
      }
      
      setIsInitializing(false);
    };
    
    initDb();
  }, []);

  const loginWithTelegram = () => {
    setLoginError(null);
    
    try {
      if (window.Telegram?.Login) {
        window.Telegram.Login.auth(
          {
            bot_id: 8036388834, // Корректный ID бота
            request_access: true,
            lang: 'ru',
            callback: (data: any) => {
              if (data.auth_date) {
                // Успешный вход
                const telegramUser = {
                  id: data.id,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  username: data.username
                };
                setUser(telegramUser);
                saveUser(telegramUser).catch(error => {
                  console.error("Failed to save user to database:", error);
                });
              } else {
                setLoginError("Не удалось войти через Telegram");
              }
            }
          }
        );
      } else {
        setLoginError("Telegram Login не доступен");
      }
    } catch (error) {
      console.error("Error during Telegram login:", error);
      setLoginError("Произошла ошибка при попытке входа через Telegram");
    }
  };

  const simulateLogin = async () => {
    console.log("Simulating Telegram login");
    const demoUser = {
      id: 123456789,
      first_name: "Demo",
      username: "demo_user"
    };
    
    setUser(demoUser);
    
    try {
      await saveUser(demoUser);
    } catch (error) {
      console.error("Failed to save demo user to database:", error);
    }
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
