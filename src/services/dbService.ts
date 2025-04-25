
import Database from 'better-sqlite3';

// Путь к файлу базы данных
const dbPath = 'telegram_bot.db';

// Инициализация базы данных
const db = new Database(dbPath);

// Инициализация таблиц
export const initDatabase = () => {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      telegram_id TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица дней рождения
  db.exec(`
    CREATE TABLE IF NOT EXISTS birthdays (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      birth_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Таблица сообщений
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      message_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

// Сохранение пользователя
export const saveUser = (userData: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (telegram_id, first_name, last_name, username)
    VALUES (?, ?, ?, ?)
  `);
  
  const info = stmt.run(
    userData.id.toString(),
    userData.first_name,
    userData.last_name || null,
    userData.username || null
  );
  
  return info.lastInsertRowid;
};

// Сохранение дня рождения
export const saveBirthday = (userId: number, birthDate: string) => {
  const stmt = db.prepare(`
    INSERT INTO birthdays (user_id, birth_date)
    VALUES (?, ?)
  `);
  
  const info = stmt.run(userId, birthDate);
  return info.lastInsertRowid;
};

// Получение пользователя по telegram_id
export const getUserByTelegramId = (telegramId: number) => {
  const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
  return stmt.get(telegramId.toString());
};

// Получение всех пользователей
export const getAllUsers = () => {
  const stmt = db.prepare('SELECT * FROM users');
  return stmt.all();
};

// Получение дня рождения пользователя
export const getUserBirthday = (userId: number) => {
  const stmt = db.prepare('SELECT * FROM birthdays WHERE user_id = ?');
  return stmt.get(userId);
};

// Закрытие соединения с БД
export const closeDatabase = () => {
  db.close();
};
