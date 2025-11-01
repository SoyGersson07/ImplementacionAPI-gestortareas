import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Base de datos en memoria
let tasks = [];
let nextId = 1;

// GET /tasks - Obtiene todas las tareas organizadas por estado
app.get("/tasks", (req, res) => {
  const organized = {
    todo: tasks.filter(t => t.status === "todo"),
    doing: tasks.filter(t => t.status === "doing"),
    done: tasks.filter(t => t.status === "done")
  };
  res.json(organized);
});

// GET /tasks/:id - Obtiene una tarea específica
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// POST /tasks - Crea una nueva tarea
app.post("/tasks", (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  
  const newTask = {
    id: nextId++,
    title,
    description: description || "",
    status: status || "todo"
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Actualiza una tarea completa
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  const { title, description, status } = req.body;
  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;
  
  res.json(task);
});

// PATCH /tasks/:id/status - Cambia solo el estado de una tarea
app.patch("/tasks/:id/status", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  const { status } = req.body;
  if (!["todo", "doing", "done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  
  task.status = status;
  res.json(task);
});

// DELETE /tasks/:id - Elimina una tarea
app.delete("/tasks/:id", (req, res) => {
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id != req.params.id);
  
  if (tasks.length === initialLength) {
    return res.status(404).json({ message: "Task not found" });
  }
  
  res.json({ message: "Task deleted successfully" });
});

// GET /tasks/summary - Resumen de tareas por estado
app.get("/tasks/summary", (req, res) => {
  const summary = {
    todo: tasks.filter(t => t.status === "todo").length,
    doing: tasks.filter(t => t.status === "doing").length,
    done: tasks.filter(t => t.status === "done").length,
    total: tasks.length
  };
  res.json(summary);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});