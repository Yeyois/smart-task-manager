import { useState, useEffect } from "react"
import axios from 'axios'
import { Trash2, CheckCircle, Circle, Plus, TurkishLira } from 'lucide-react'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const API_URL = 'http://127.0.0.1:8000/tasks/'

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL)
      setTasks(response.data.reverse())
      setLoading(false)
    } catch (error) {
      console.error("Error fetching tasks:", error);      
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const response = await axios.post(API_URL, {
        title: newTaskTitle,
        is_completed: false
      })
      setTasks([response.data, ...tasks])
      setNewTaskTitle('')
    } catch (error) {
      console.error("Error addind task:", error)
    }
  }

  const toggleTask = async (id, currentStatus, title) => {
    try {
      const response = await axios.put(`${API_URL}${id}`, {
        title: title,
        is_completed: !currentStatus
      })

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, is_completed: !currentStatus } : task
      ))
    } catch (error) {
      console.error("Error updating task:", error) 
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}`)
      setTasks(tasks.filter(task => task.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)      
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* כותרת */}
        <div className="bg-indigo-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">Smart Task Manager</h1>
          <p className="text-indigo-200 text-center text-sm mt-1">Python FastAPI + React</p>
        </div>

        {/* טופס הוספה */}
        <div className="p-6 border-b">
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </form>
        </div>

        {/* רשימת המשימות */}
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center p-4 text-gray-500">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id, task.is_completed, task.title)}>
                    {task.is_completed ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Circle className="text-gray-400" size={20} />
                    )}
                    <span className={`text-lg ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
export default App