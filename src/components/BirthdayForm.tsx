
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
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Получаем пользователя
      const user = getUserByTelegramId(userId);
      
      if (user) {
        // Сохраняем день рождения
        saveBirthday(user.id, birthday);
        
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
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#0088CC] hover:bg-[#007AB8] text-white"
      >
        Сохранить
      </Button>
    </form>
  );
};

export default BirthdayForm;
