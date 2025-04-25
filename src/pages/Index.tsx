
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, User, LogIn, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import BirthdayForm from "@/components/BirthdayForm";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { 
    user, 
    isTelegramAvailable, 
    isInitializing, 
    isTelegramLoginAvailable,
    loginError,
    loginWithTelegram, 
    simulateLogin 
  } = useTelegramAuth();
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

  useEffect(() => {
    if (loginError) {
      toast({
        title: "Ошибка входа",
        description: loginError,
        variant: "destructive",
      });
    }
  }, [loginError, toast]);

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
                    onClick={loginWithTelegram}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Войти через Telegram
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-amber-600 font-medium">
                  Это приложение работает лучше внутри Telegram
                </div>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="text-gray-500 text-sm mb-4">
                  Рекомендуется открыть это приложение через Telegram для автоматической авторизации
                </div>
                <Button 
                  className="w-full bg-[#0088CC] hover:bg-[#007AB8] mb-2" 
                  onClick={loginWithTelegram}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти через Telegram
                </Button>
                <Button 
                  className="w-full border border-[#0088CC] bg-white text-[#0088CC] hover:bg-[#e6f3fa]" 
                  onClick={simulateLogin}
                >
                  <User className="mr-2 h-4 w-4" />
                  Войти как гость (демо)
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
