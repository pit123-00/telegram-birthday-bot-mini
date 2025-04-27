import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, LogIn, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import BirthdayForm from "@/components/BirthdayForm";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { useToast } from "@/components/ui/use-toast";
import { getUserStats } from "@/services/dbService";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

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
  const [userStats, setUserStats] = useState<{
    loginCount: number;
    previousLogin: string | null;
  } | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.id) {
        try {
          const stats = await getUserStats(user.id);
          setUserStats(stats);
        } catch (error) {
          console.error('Error loading user stats:', error);
        }
      }
    };

    if (user) {
      setIsLoggedIn(true);
      loadUserStats();
      
      const welcomeMessage = userStats?.previousLogin
        ? `С возвращением, ${user.first_name}! Это ваш ${userStats.loginCount}-й вход. Последний раз вы заходили ${formatDistanceToNow(new Date(userStats.previousLogin), { locale: ru })} назад.`
        : `Добро пожаловать, ${user.first_name}! Это ваш первый вход.`;
      
      toast({
        title: "Успешный вход",
        description: welcomeMessage,
      });
    }
  }, [user, userStats, toast]);

  useEffect(() => {
    if (loginError) {
      toast({
        title: "Информация",
        description: loginError,
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
                <Button 
                  className="w-full bg-[#0088CC] hover:bg-[#007AB8] mb-2"
                  onClick={loginWithTelegram}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Войти через Telegram
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-amber-600 font-medium">
                  Войдите через Telegram для получения поздравлений
                </div>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
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
          <>
            {userStats && (
              <div className="mb-4 text-center text-gray-600">
                <p className="mb-2">
                  Количество входов: {userStats.loginCount}
                </p>
                {userStats.previousLogin && (
                  <p>
                    Последний вход: {formatDistanceToNow(new Date(userStats.previousLogin), { locale: ru })} назад
                  </p>
                )}
              </div>
            )}
            <BirthdayForm userId={user?.id || 0} />
          </>
        )}
      </Card>
    </div>
  );
};

export default Index;
