import type { PersistStorage, StorageValue } from 'zustand/middleware';
import type { Player } from '../types';

const DB_NAME = 'HoopsDB';
const DB_VERSION = 1;
const GAME_STATE_STORE = 'gameState';
const CAREERS_STORE = 'careers';

let dbPromise: Promise<IDBDatabase> | null = null;

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
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
  return dbPromise;
}

// Define the shape of the state that will actually be saved to IndexedDB.
type PersistedState = {
  player: Player | null;
  gamePhase: 'menu' | 'playing' | 'gameOver';
  metaSkillPoints: number;
  metaSkillPointsAtRunStart: number;
};

/**
 * A custom storage object that uses IndexedDB. It now conforms to the
 * PersistStorage<T> type expected by Zustand's persist middleware.
 */
export const idbStorage: PersistStorage<PersistedState> = {
  getItem: async (name: string): Promise<StorageValue<PersistedState> | null> => {
    const db = await openDB();
    const transaction = db.transaction(GAME_STATE_STORE, 'readonly');
    const store = transaction.objectStore(GAME_STATE_STORE);
    const request = store.get(name);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // FIX: Return the object directly, as Zustand expects the { state, version } wrapper
        resolve((request.result as StorageValue<PersistedState>) || null);
      };
      request.onerror = () => reject(request.error);
    });
  },
  setItem: async (name: string, value: StorageValue<PersistedState>): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(GAME_STATE_STORE, 'readwrite');
    const store = transaction.objectStore(GAME_STATE_STORE);
    store.put(value, name);

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

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};

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
