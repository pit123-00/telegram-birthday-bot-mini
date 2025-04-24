
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import BirthdayForm from "@/components/BirthdayForm";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";

const Index = () => {
  const { user, isTelegramAvailable } = useTelegramAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <Card className="w-[90%] max-w-md p-6 space-y-6">
        {!isLoggedIn ? (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-[#0088CC]">
              Добро пожаловать!
            </h1>
            <p className="text-gray-600">
              Войдите через Telegram, чтобы получать поздравления
            </p>
            {isTelegramAvailable ? (
              <div className="text-gray-600">
                Ожидание данных из Telegram...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-amber-600 font-medium">
                  Это приложение работает только внутри Telegram
                </div>
                <div className="text-gray-500 text-sm">
                  Откройте это приложение через Telegram для авторизации
                </div>
              </div>
            )}
          </div>
        ) : (
          <BirthdayForm />
        )}
      </Card>
    </div>
  );
};

export default Index;
