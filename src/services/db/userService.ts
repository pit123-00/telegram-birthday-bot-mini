
import { getDb } from './initDb';

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export const saveUser = async (userData: UserData): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const getUserTx = db.transaction('users', 'readonly');
    const userStore = getUserTx.objectStore('users');
    const userIndex = userStore.index('telegram_id');
    const getUserRequest = userIndex.get(userData.id.toString());

    getUserRequest.onsuccess = (event) => {
      const existingUser = (event.target as IDBRequest).result;
      
      const tx = db.transaction('users', 'readwrite');
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

export const getUserByTelegramId = (telegramId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
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

export const getUserStats = async (telegramId: number): Promise<{
  loginCount: number;
  previousLogin: string | null;
} | null> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
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

export const getAllUsers = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
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
