// db.js — Manejo de tareas usando IndexedDB.

const DB_NAME = 'pwa_tasks_db';
const STORE_NAME = 'tasks';
const DB_VERSION = 1;

// Abre o crea la base de datos IndexedDB
function openTasksDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => {
      console.error('Error abriendo IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Guarda todas las tareas en IndexedDB con manejo de errores
async function saveTasksToDB(tasks) {
  try {
    const db = await openTasksDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear();
    for (const task of tasks) {
      store.put(task);
    }
    await tx.complete;
    db.close();
    console.log('✅ Guardado en IndexedDB correcto');
  } catch (error) {
    console.error('❌ Error guardando en IndexedDB:', error);
  }
}

// Recupera todas las tareas de IndexedDB con manejo de errores
async function loadTasksFromDB() {
  try {
    const db = await openTasksDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
        db.close();
      };
      request.onerror = () => {
        console.error('Error cargando de IndexedDB:', request.error);
        reject(request.error);
      }
    });
  } catch (error) {
    console.error('❌ Error cargando de IndexedDB:', error);
    return [];
  }
}
