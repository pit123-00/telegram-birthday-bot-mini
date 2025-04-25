
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
    // Инициализируем БД при загрузке приложения
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

      // Небольшая задержка для инициализации Telegram WebApp
      setTimeout(() => {
        if (window.Telegram?.WebApp) {
          console.log("Telegram WebApp detected!");
          setIsTelegramAvailable(true);
          
          try {
            window.Telegram.WebApp.ready();

            const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            if (telegramUser) {
              setUser(telegramUser);
              console.log("Telegram user found:", telegramUser);
              
              // Сохраняем пользователя в БД
              try {
                saveUser(telegramUser).catch(error => {
                  console.error("Failed to save user to database:", error);
                });
              } catch (error) {
                console.error("Failed to save user to database:", error);
              }
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
    };
    
    initDb();
    
    return () => {
      // Можно добавить очистку при размонтировании компонента, если необходимо
    };
  }, []);

  const loginWithTelegram = () => {
    // Reset any previous errors
    setLoginError(null);
    
    try {
      // Используем direct URL для открытия в Telegram Desktop
      const botUsername = 'your_bot_username'; // Замените на имя вашего бота
      const telegramUrl = `https://t.me/${botUsername}`;
      
      // Открываем ссылку в новом окне
      window.open(telegramUrl, '_blank');
      
      // Дополнительно показываем сообщение пользователю
      setLoginError("Перенаправляем вас в Telegram...");
    } catch (error) {
      console.error("Error during Telegram login:", error);
      setLoginError("Произошла ошибка при попытке перенаправления в Telegram");
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
    
    // Сохраняем демо-пользователя в БД
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
