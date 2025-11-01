<template>
  <div class="container">
    <h1>GESTOR DE TAREAS</h1>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="input-section">
      <input 
        v-model="newTask" 
        placeholder="Escribe la tarea a agregar" 
        @keyup.enter="addTask" 
      />
      <button @click="addTask">Agregar tarea</button>
    </div>

    <hr />

    <div v-if="loading" class="loading">
      Cargando tareas...
    </div>

    <div v-else-if="hasTasks()" class="columnas">
      <div class="columna todo">
        <h2>To Do ({{ tasks.todo.length }})</h2>
        <ul>
          <li v-for="task in tasks.todo" :key="task.id">
            {{ task.title }}
            <div class="task-actions">
              <button @click="moveTask(task.id, 'doing')">🔜</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="columna doing">
        <h2>Doing ({{ tasks.doing.length }})</h2>
        <ul>
          <li v-for="task in tasks.doing" :key="task.id">
            {{ task.title }}
            <div class="task-actions">
              <button @click="moveTask(task.id, 'done')">🔜</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="columna done">
        <h2>Done ({{ tasks.done.length }})</h2>
        <ul>
          <li v-for="task in tasks.done" :key="task.id">
            {{ task.title }}
            <button class="delete" @click="deleteTask(task.id)">🗑️</button>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No hay tareas registradas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = 'http://localhost:3000/tasks';

const newTask = ref('');
const tasks = ref({
  todo: [],
  doing: [],
  done: []
});
const loading = ref(true);
const error = ref('');

// Cargar tareas desde la API
const loadTasks = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Error al cargar las tareas');
    }
    
    const data = await response.json();
    tasks.value = data;
  } catch (err) {
    error.value = 'Error al cargar las tareas: ' + err.message;
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

// Agregar nueva tarea
const addTask = async () => {
  const title = newTask.value.trim();
  if (title === '') return;

  try {
    error.value = '';
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        status: 'todo'
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear la tarea');
    }

    const newTaskData = await response.json();
    tasks.value.todo.push(newTaskData);
    newTask.value = '';
  } catch (err) {
    error.value = 'Error al agregar la tarea: ' + err.message;
    console.error('Error:', err);
  }
};

// Mover tarea entre columnas
const moveTask = async (taskId, newStatus) => {
  try {
    error.value = '';
    const response = await fetch(`${API_URL}/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus
      })
    });

    if (!response.ok) {
      throw new Error('Error al mover la tarea');
    }

    // Recargar todas las tareas para actualizar la vista
    await loadTasks();
  } catch (err) {
    error.value = 'Error al mover la tarea: ' + err.message;
    console.error('Error:', err);
  }
};

// Eliminar tarea
const deleteTask = async (taskId) => {
  if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

  try {
    error.value = '';
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la tarea');
    }

    // Recargar todas las tareas para actualizar la vista
    await loadTasks();
  } catch (err) {
    error.value = 'Error al eliminar la tarea: ' + err.message;
    console.error('Error:', err);
  }
};

// Verificar si hay tareas
const hasTasks = () => {
  return (
    tasks.value.todo.length +
    tasks.value.doing.length +
    tasks.value.done.length > 0
  );
};

// Cargar tareas al montar el componente
onMounted(() => {
  loadTasks();
});
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.input-section {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

input {
  width: 60%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #359268;
}

button.delete {
  background-color: #e74c3c;
  padding: 5px 10px;
  font-size: 14px;
}

button.delete:hover {
  background-color: #c0392b;
}

.error-message {
  background-color: #fee;
  color: #c00;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
}

.loading {
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.empty-state {
  padding: 40px;
  color: #999;
  font-size: 18px;
}

hr {
  border: none;
  border-top: 2px solid #eee;
  margin: 30px 0;
}

.columnas {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.columna {
  flex: 1;
  min-width: 0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.columna h2 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #2c3e50;
  font-weight: bold;
}

.todo {
  background-color: #d0e7ff;
}

.doing {
  background-color: #fff3cd;
}

.done {
  background-color: #d4edda;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: left;
  word-break: break-word;
  color: #2c3e50;
  font-weight: 500;
}

li:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.task-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
  margin-left: 10px;
}

.task-actions button {
  padding: 5px 10px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .columnas {
    flex-direction: column;
  }
  
  .input-section {
    flex-direction: column;
  }
  
  input {
    width: 100%;
  }
}
</style>