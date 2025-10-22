// Solicitar almacenamiento persistente
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(granted => {
    console.log('🔒 Almacenamiento persistente:', granted ? 'Activado' : 'No concedido');
  }).catch(error => {
    console.warn('Error solicitando almacenamiento persistente:', error);
  });
}


// Conectar elementos HTML
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const status = document.getElementById('status');

let tasks = [];

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


// Guarda las tareas en la base de datos
async function saveTasks() {
  await saveTasksToDB(tasks);
  console.log('✅ Tareas guadadas:', tasks.length);
}

async function saveTasks() {
  try {
    await saveTasksToDB(tasks);
  } catch (error) {
    console.error('❌ Error guardando tareas:', error);
  }
}

// Agregar tarea con botón
addButton.addEventListener('click', addTask);

// Agregar tarea con Enter
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Función para agregar tarea
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        tasks.push({
            id: Date.now(),
            text: taskText,
            completed: false
        });
        
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    }
}

// Mostrar tareas en pantalla
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li style="text-align: center; color: #999;">No hay tareas. ¡Agrega una!</li>';
        return;
    }
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="flex: 1; ${task.completed ? 'text-decoration: line-through; color: #999;' : ''}">
                ${task.text}
            </span>
            <button onclick="deleteTask(${task.id})" 
                    style="background: #e74c3c; padding: 8px 16px; font-size: 14px;">
                🗑️ Eliminar
            </button>
        `;
        taskList.appendChild(li);
    });
}

// Eliminar tarea
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Guardar en localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Detectar conexión
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

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/serviceWorker.js')
            .then(function(registration) {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(function(error) {
                console.log('❌ Error al registrar Service Worker:', error);
            });
    });
}
