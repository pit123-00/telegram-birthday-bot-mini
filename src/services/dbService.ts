// Используем IndexedDB для хранения данных в браузере
// Инициализация базы данных
let db: IDBDatabase | null = null;

// Инициализация базы данных
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('telegram_bot_db', 3); // Увеличиваем версию базы данных

    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Обновленная таблица пользователей
      if (!database.objectStoreNames.contains('users')) {
        const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('telegram_id', 'telegram_id', { unique: true });
        userStore.createIndex('first_name', 'first_name', { unique: false });
        userStore.createIndex('last_name', 'last_name', { unique: false });
        userStore.createIndex('username', 'username', { unique: false });
        userStore.createIndex('photo_url', 'photo_url', { unique: false }); // Новое поле для аватарки
        userStore.createIndex('description', 'description', { unique: false }); // Новое поле для описания
        userStore.createIndex('login_count', 'login_count', { unique: false });
        userStore.createIndex('last_login', 'last_login', { unique: false });
        userStore.createIndex('previous_login', 'previous_login', { unique: false });
      }
      
      // Таблица дней рождения
      if (!database.objectStoreNames.contains('birthdays')) {
        const birthdayStore = database.createObjectStore('birthdays', { keyPath: 'id', autoIncrement: true });
        birthdayStore.createIndex('user_id', 'user_id', { unique: false });
        birthdayStore.createIndex('birth_date', 'birth_date', { unique: false });
      }
      
      // Таблица сообщений
      if (!database.objectStoreNames.contains('messages')) {
        const messagesStore = database.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        messagesStore.createIndex('user_id', 'user_id', { unique: false });
        messagesStore.createIndex('message_text', 'message_text', { unique: false });
      }
    };
  });
};

// Сохранение пользователя
export const saveUser = async (userData: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string; // Добавляем поле для аватарки
}): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Проверяем, существует ли уже такой пользователь
    const getUserTx = db.transaction('users', 'readonly');
    const userStore = getUserTx.objectStore('users');
    const userIndex = userStore.index('telegram_id');
    const getUserRequest = userIndex.get(userData.id.toString());

    getUserRequest.onsuccess = (event) => {
      const existingUser = (event.target as IDBRequest).result;
      
      const tx = db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');

      const currentTime = new Date().toISOString();
      
      const userToSave = {
        telegram_id: userData.id.toString(),
        first_name: userData.first_name,
        last_name: userData.last_name || null,
        username: userData.username || null,
        photo_url: userData.photo_url || null,
        description: existingUser?.description || '',
        login_count: existingUser ? existingUser.login_count + 1 : 1,
        previous_login: existingUser?.last_login || null,
        last_login: currentTime,
        created_at: existingUser?.created_at || currentTime,
        updated_at: currentTime
      };
      
      const request = existingUser 
        ? store.put({ ...existingUser, ...userToSave })
        : store.add(userToSave);

      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest).result as number;
        resolve(id);
      };

      request.onerror = (event) => {
        console.error('Error saving user:', event);
        reject(new Error('Failed to save user'));
      };
    };

    getUserRequest.onerror = (event) => {
      console.error('Error getting user:', event);
      reject(new Error('Failed to check if user exists'));
    };
  });
};

// Сохранение дня рождения
export const saveBirthday = (userId: number, birthDate: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tx = db.transaction('birthdays', 'readwrite');
    const store = tx.objectStore('birthdays');
    
    const birthday = {
      user_id: userId,
      birth_date: birthDate,
      created_at: new Date().toISOString()
    };
    
    const request = store.add(birthday);
    
    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest).result as number;
      resolve(id);
    };
    
    request.onerror = (event) => {
      console.error('Error saving birthday:', event);
      reject(new Error('Failed to save birthday'));
    };
  });
};

// Получение пользователя по telegram_id
export const getUserByTelegramId = (telegramId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('telegram_id');
    const request = index.get(telegramId.toString());
    
    request.onsuccess = (event) => {
      const user = (event.target as IDBRequest).result;
      resolve(user);
    };
    
    request.onerror = (event) => {
      console.error('Error getting user:', event);
      reject(new Error('Failed to get user'));
    };
  });
};

// Получение всех пользователей
export const getAllUsers = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const users = (event.target as IDBRequest).result;
      resolve(users);
    };
    
    request.onerror = (event) => {
      console.error('Error getting all users:', event);
      reject(new Error('Failed to get all users'));
    };
  });
};

// Получение дня рождения пользователя
export const getUserBirthday = (userId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tx = db.transaction('birthdays', 'readonly');
    const store = tx.objectStore('birthdays');
    const index = store.index('user_id');
    const request = index.get(userId);
    
    request.onsuccess = (event) => {
      const birthday = (event.target as IDBRequest).result;
      resolve(birthday);
    };
    
    request.onerror = (event) => {
      console.error('Error getting birthday:', event);
      reject(new Error('Failed to get birthday'));
    };
  });
};

// Получение статистики пользователя
export const getUserStats = async (telegramId: number): Promise<{
  loginCount: number;
  previousLogin: string | null;
} | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('telegram_id');
    const request = index.get(telegramId.toString());

    request.onsuccess = (event) => {
      const user = (event.target as IDBRequest).result;
      if (user) {
        resolve({
          loginCount: user.login_count || 1,
          previousLogin: user.previous_login
        });
      } else {
        resolve(null);
      }
    };

    request.onerror = (event) => {
      console.error('Error getting user stats:', event);
      reject(new Error('Failed to get user stats'));
    };
  });
};

// Закрытие соединения с БД
export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};
