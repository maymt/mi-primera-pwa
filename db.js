const DB_NAME = 'pwa_tasks_db';
const STORE_NAME = 'tasks';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

async function saveTasksToDB(tasks) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  for (const task of tasks) {
    store.put(task);
  }
  await tx.complete;
  db.close();
}

async function loadTasksFromDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const allRequest = store.getAll();
    allRequest.onsuccess = () => {
      resolve(allRequest.result);
      db.close();
    };
    allRequest.onerror = () => reject(allRequest.error);
  });
}
