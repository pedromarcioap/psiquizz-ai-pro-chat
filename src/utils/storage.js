// storage.js - persistência local-first
import { openDB } from 'idb';

const DB_NAME = 'psiquizz-local';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('chats', { keyPath: 'id' });
      db.createObjectStore('materials', { keyPath: 'id' });
      db.createObjectStore('quizzes', { keyPath: 'id' });
    },
  });
}

export async function saveLocalFirst(store, entity) {
  const db = await getDB();
  await db.put(store, entity);
}

export async function getAllLocal(store) {
  const db = await getDB();
  return db.getAll(store);
}

export async function flushToFirestore(store, batchFn) {
  const db = await getDB();
  const all = await db.getAll(store);
  await batchFn(all);
  await Promise.all(all.map(e => db.delete(store, e.id)));
}
