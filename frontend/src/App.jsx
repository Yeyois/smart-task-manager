import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, LayoutList, Loader2, Sparkles, Wand2 } from 'lucide-react';
import AITaskGenerator from './components/AITaskGenerator'; // <--- 1. ייבוא הקומפוננטה

const API_URL = "http://localhost:8000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State חדש לניהול איזו משימה פתוחה כרגע ל-AI
  const [activeAiTaskId, setActiveAiTaskId] = useState(null); // <--- 2. State חדש

  // טעינת משימות
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks/`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // הוספת משימה
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle })
      });
      setNewTaskTitle("");
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // מחיקת משימה
  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // עדכון סטטוס
  const toggleTask = async (id, currentStatus, title) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, is_completed: !currentStatus })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-start justify-center py-12 px-4 font-sans text-slate-800">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center gap-3">
            <LayoutList className="text-indigo-600" size={36} />
            Smart Task Manager
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Powered by FastAPI, React & Gemini 2.0</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          
          {/* Add Task Area */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-white/50">
            <form onSubmit={addTask} className="relative flex items-center">
              <input
                type="text"
                placeholder="What's your next goal?"
                className="w-full pl-6 pr-14 py-4 text-lg bg-white border-0 rounded-2xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </form>
          </div>

          {/* Tasks List */}
          <div className="p-4 md:p-6 bg-slate-50/50 min-h-[400px] max-h-[60vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p>Syncing tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Sparkles className="text-yellow-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">All caught up!</h3>
                <p>Start by adding a new task above.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li 
                    key={task.id} 
                    // שינינו ל-flex-col כדי שה-AI יפתח למטה
                    className={`group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ${task.is_completed ? 'bg-slate-50' : 'hover:-translate-y-0.5'}`}
                  >
                    {/* השורה הראשית של המשימה */}
                    <div className="flex items-center justify-between p-4 w-full">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id, task.is_completed, task.title)}>
                        <button className={`transition-colors duration-200 ${task.is_completed ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-500'}`}>
                          {task.is_completed ? (
                            <CheckCircle2 size={24} strokeWidth={2.5} className="fill-green-50" />
                          ) : (
                            <Circle size={24} strokeWidth={2} />
                          )}
                        </button>
                        
                        <div className="flex flex-col">
                          <span className={`text-lg font-medium transition-all duration-200 ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                          </span>
                          {/* הצגת תיוג אם זה תת-משימה */}
                          {task.description && task.description.startsWith("Subtask of:") && (
                            <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              ↳ {task.description}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        
                        {/* כפתור ה-AI המתוקן */}
                        {!task.is_completed && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              // לוגיקה לפתיחה/סגירה של המגירה
                              setActiveAiTaskId(activeAiTaskId === task.id ? null : task.id); 
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                              activeAiTaskId === task.id 
                                ? "bg-purple-100 text-purple-700" 
                                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                            }`}
                          >
                            <Wand2 size={16} />
                            <span className="hidden sm:inline">
                              {activeAiTaskId === task.id ? "Close AI" : "AI Split"}
                            </span>
                          </button>
                        )}

                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {/* --- החלק החדש: מגירת ה-AI --- */}
                    {activeAiTaskId === task.id && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <AITaskGenerator 
                            taskId={task.id} 
                            onTasksAdded={() => {
                              fetchTasks(); // רענון הרשימה אחרי הוספה
                              setActiveAiTaskId(null); // סגירת המגירה
                            }} 
                         />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            {tasks.filter(t => !t.is_completed).length} tasks remaining
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;