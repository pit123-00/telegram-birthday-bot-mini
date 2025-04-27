
import { getDb } from './initDb';

export const saveBirthday = (userId: number, birthDate: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
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

export const getUserBirthday = (userId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = getDb();
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
