
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, User, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import BirthdayForm from "@/components/BirthdayForm";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { user, isTelegramAvailable, isInitializing, simulateLogin } = useTelegramAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      toast({
        title: "Успешный вход",
        description: `Добро пожаловать, ${user.first_name}!`,
      });
    }
  }, [user, toast]);

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
            
            {isInitializing ? (
              <div className="text-gray-600 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088CC] mb-2"></div>
                Проверка Telegram...
              </div>
            ) : isTelegramAvailable ? (
              <div className="text-gray-600">
                Ожидание данных из Telegram...
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-amber-600 mb-2">
                    Если вход не происходит автоматически:
                  </p>
                  <Button 
                    className="w-full bg-[#0088CC] hover:bg-[#007AB8]"
                    onClick={simulateLogin}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Войти вручную
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-amber-600 font-medium">
                  Это приложение работает лучше внутри Telegram
                </div>
                <div className="text-gray-500 text-sm mb-4">
                  Рекомендуется открыть это приложение через Telegram для автоматической авторизации
                </div>
                <Button 
                  className="w-full bg-[#0088CC] hover:bg-[#007AB8]" 
                  onClick={simulateLogin}
                >
                  <User className="mr-2 h-4 w-4" />
                  Войти как гость
                </Button>
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
