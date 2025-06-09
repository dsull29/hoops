import type { Player } from '../types';

const DB_NAME = 'HoopsDB';
const DB_VERSION = 1;
const GAME_STATE_STORE = 'gameState';
const CAREERS_STORE = 'careers';

// A memoized promise to prevent opening the database multiple times.
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens and initializes the IndexedDB database.
 * @returns A promise that resolves with the database instance.
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(GAME_STATE_STORE)) {
        db.createObjectStore(GAME_STATE_STORE);
      }
      if (!db.objectStoreNames.contains(CAREERS_STORE)) {
        db.createObjectStore(CAREERS_STORE, { autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('Error opening database');
    };
  });

  return dbPromise;
}

/**
 * A custom storage object that conforms to the API required by Zustand's `persist` middleware,
 * but uses IndexedDB instead of localStorage.
 */
export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await openDB();
    const transaction = db.transaction(GAME_STATE_STORE, 'readonly');
    const store = transaction.objectStore(GAME_STATE_STORE);
    const request = store.get(name);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? JSON.stringify(request.result) : null);
      };
      request.onerror = () => reject(request.error);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(GAME_STATE_STORE, 'readwrite');
    const store = transaction.objectStore(GAME_STATE_STORE);
    store.put(JSON.parse(value), name);

    // FIX: Replaced deprecated .commit with the standard oncomplete/onerror events.
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(GAME_STATE_STORE, 'readwrite');
    const store = transaction.objectStore(GAME_STATE_STORE);
    store.delete(name);

    // FIX: Replaced deprecated .commit with the standard oncomplete/onerror events.
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};

/**
 * Saves a completed player career to the 'careers' object store for historical purposes.
 * @param player - The final player object at the end of their career.
 */
export async function archiveCareer(player: Player): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(CAREERS_STORE, 'readwrite');
    const store = transaction.objectStore(CAREERS_STORE);
    store.add(player);
    console.log(`Career for ${player.name} archived successfully.`);
  } catch (error) {
    console.error('Failed to archive career:', error);
  }
}
