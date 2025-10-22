// app.js — Principal lógica de la app y manejo de tareas con IndexedDB

// Solicitar almacenamiento persistente para evitar borrados en iOS
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(granted => {
    console.log('🔒 Almacenamiento persistente:', granted ? 'Activado' : 'No concedido');
  }).catch(error => {
    console.warn('Error solicitando almacenamiento persistente:', error);
  });
}

// Variables para elementos del DOM
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const status = document.getElementById('status');

let tasks = [];

// Al cargar la página, cargar tareas desde IndexedDB
window.addEventListener('load', async () => {
  try {
    tasks = await loadTasksFromDB();
    console.log('✅ Tareas cargadas:', tasks.length);
  } catch (error) {
    console.error('❌ Error cargando tareas:', error);
    tasks = [];
  }
  renderTasks();
});

// Agregar tarea al hacer clic en el botón
addButton.addEventListener('click', addTask);

// Agregar tarea al presionar Enter
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Función para agregar tarea
async function addTask() {
  const text = taskInput.value.trim();
  if (text === '') return;

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false
  });

  await saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// Función para eliminar tarea
async function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  await saveTasks();
  renderTasks();
}

// Guarda las tareas en IndexedDB
async function saveTasks() {
  try {
    await saveTasksToDB(tasks);
    console.log('✅ Tareas guardadas');
  } catch (error) {
    console.error('❌ Error guardando tareas:', error);
  }
}

// Muestra las tareas en la pantalla
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li style="text-align:center;color:#999;">No hay tareas. ¡Agrega una!</li>';
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span style="flex:1;${task.completed ? 'text-decoration: line-through; color: #999;' : ''}">
        ${task.text}
      </span>
      <button onclick="deleteTask(${task.id})" style="background:#e74c3c;padding:8px 16px;font-size:14px;">
        🗑️ Eliminar
      </button>
    `;
    taskList.appendChild(li);
  });
}

// Actualiza indicador de conexión
window.addEventListener('online', () => {
  status.textContent = '🟢 Online';
  status.style.background = '#e8f5e9';
  status.style.color = '#2e7d32';
});

window.addEventListener('offline', () => {
  status.textContent = '🔴 Offline - Funciona sin internet';
  status.style.background = '#ffebee';
  status.style.color = '#c62828';
});

// Registrar Service Worker con ruta correcta (ajusta según carpeta repositorio)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/mi-primera-pwa/serviceWorker.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
      .catch(err => console.error('❌ Error al registrar Service Worker:', err));
  });
}
