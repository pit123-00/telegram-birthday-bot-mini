
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { saveBirthday, getUserByTelegramId } from "../services/dbService";
import { useToast } from "@/components/ui/use-toast";

interface BirthdayFormProps {
  userId: number;
}

const BirthdayForm = ({ userId }: BirthdayFormProps) => {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Получаем пользователя
      const user = await getUserByTelegramId(userId);
      
      if (user) {
        // Сохраняем день рождения
        await saveBirthday(user.id, birthday);
        
        toast({
          title: "Успешно",
          description: "Ваш день рождения сохранен",
        });
        
        setIsSubmitted(true);
      } else {
        toast({
          title: "Ошибка",
          description: "Пользователь не найден",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving birthday:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить дату рождения",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#0088CC]">
          Спасибо, {name}!
        </h2>
        <p className="text-gray-600">
          Мы обязательно поздравим вас с днем рождения!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Ваше имя
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Введите ваше имя"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="birthday">
          Дата рождения
        </label>
        <Input
          id="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#0088CC] hover:bg-[#007AB8] text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Сохраняем...
          </span>
        ) : "Сохранить"}
      </Button>
    </form>
  );
};

export default BirthdayForm;
