# 🚀 Smart Task Manager (Full Stack + AI)

A modern, containerized Task Management application built to demonstrate a complete full-stack architecture.
It features a **FastAPI** backend, a **React** frontend, and an **AI-powered** subtask generator (AI feature is comming soon..).

## 🛠 Tech Stack

* **Backend:** Python 3.11, FastAPI, SQLAlchemy, SQLite
* **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide Icons
* **DevOps:** Docker, Docker Compose, Nginx (Multi-stage build)
* **AI Feature:** Logic-based simulation engine for automated task breakdown

## ✨ Key Features

* **✅ Full CRUD:** Create, Read, Update, and Delete tasks efficiently.
* **🧠 AI Subtask Generator:** "Magic Wand" button that analyzes a task and breaks it down into actionable steps.
* **🐳 Dockerized:** One-command deployment setup using Docker Compose.
* **⚡ Real-time UI:** Optimistic updates for a seamless and fast user experience.
* **📱 Responsive Design:** Clean and modern UI built with Tailwind CSS.

## 🏃‍♂️ How to Run (Installation)

**Prerequisites:** You only need [Docker](https://www.docker.com/) installed. No local Python or Node.js required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yeyois/smart-task-manager.git
   cd smart-task-manager
   ```

2. **Run with Docker Compose:**
   ```bash
   sudo docker compose up --build
   ```
   *(Note: The `--build` flag ensures you get the latest version)*

3. **Open the App:**
   * 🖥️ **Frontend:** Open `http://localhost` in your browser.
   * 📄 **API Docs:** Open `http://localhost:8000/docs` to test the backend directly.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tasks/` | Get all tasks |
| `POST` | `/tasks/` | Create a new task |
| `POST` | `/tasks/{id}/ai-breakdown` | **AI:** Generate subtasks automatically |
| `PUT` | `/tasks/{id}` | Update task status or title |
| `DELETE` | `/tasks/{id}` | Delete a task |

## 📂 Project Structure

```text
smart-task-manager/
├── backend/            # FastAPI Application
│   ├── main.py         # API Routes & Logic
│   ├── Dockerfile      # Python Environment
│   └── requirements.txt
├── frontend/           # React Application
│   ├── src/            # Components & Hooks
│   ├── Dockerfile      # Node Build + Nginx
│   └── tailwind.config.js
└── docker-compose.yml  # Orchestration
```

---
*Developed as a portfolio project to demonstrate proficiency in System Architecture, Docker, and Full Stack integration.*