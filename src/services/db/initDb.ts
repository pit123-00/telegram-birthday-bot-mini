
let db: IDBDatabase | null = null;

export const getDb = () => db;

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('telegram_bot_db', 3);

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
      
      if (!database.objectStoreNames.contains('users')) {
        const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('telegram_id', 'telegram_id', { unique: true });
        userStore.createIndex('first_name', 'first_name', { unique: false });
        userStore.createIndex('last_name', 'last_name', { unique: false });
        userStore.createIndex('username', 'username', { unique: false });
        userStore.createIndex('photo_url', 'photo_url', { unique: false });
        userStore.createIndex('description', 'description', { unique: false });
        userStore.createIndex('login_count', 'login_count', { unique: false });
        userStore.createIndex('last_login', 'last_login', { unique: false });
        userStore.createIndex('previous_login', 'previous_login', { unique: false });
      }
      
      if (!database.objectStoreNames.contains('birthdays')) {
        const birthdayStore = database.createObjectStore('birthdays', { keyPath: 'id', autoIncrement: true });
        birthdayStore.createIndex('user_id', 'user_id', { unique: false });
        birthdayStore.createIndex('birth_date', 'birth_date', { unique: false });
      }
    };
  });
};

export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
};
