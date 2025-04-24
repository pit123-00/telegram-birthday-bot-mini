
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import BirthdayForm from "@/components/BirthdayForm";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleTelegramLogin = () => {
    // В будущем здесь будет реальная авторизация через Telegram
    setIsLoggedIn(true);
  };

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
            <Button
              onClick={handleTelegramLogin}
              className="w-full bg-[#0088CC] hover:bg-[#007AB8] text-white"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Войти через Telegram
            </Button>
          </div>
        ) : (
          <BirthdayForm />
        )}
      </Card>
    </div>
  );
};

export default Index;
