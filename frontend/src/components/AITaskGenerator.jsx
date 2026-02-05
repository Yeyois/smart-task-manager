import { ArrowUpSquare, TicketPlus } from "lucide-react";
import { useState } from "react";

const API_URL = "http://localhost:8000"

export default function AITaskGenerator({ taskId, onTasksAdded }) {
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [error, setError] = useState(null)
    
    const handleGenerate = async () => {
        setLoading(true);
        setError(null)
        try {
            const res = await fetch(`${API_URL}/tasks/${taskId}/generate-subtasks`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error("AI Service Falied");

            const data = await res.json();
            const formatted = data.suggested_subtasks.map(title => ({title, isSelected: true}));
            setSuggestions(formatted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        const selectedTitles = suggestions.filter(s => s.isSelected).map(s => s.title);
        if (selectedTitles.length === 0) return;

        try {
            const res = await fetch(`${API_URL}/tasks/batch-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parent_task_id: taskId,
                    subtasks_titles: selectedTitles
                })
            });

            if (res.ok) {
                setSuggestions([]);
                if (onTasksAdded) onTasksAdded();
            }
        } catch (err) {
            alert("Failed to save tasks")
        }
    };

    return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      {!suggestions.length && (
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "✨ Generate Subtasks with AI"}
        </button>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">AI Suggestions:</h3>
          <ul className="space-y-2">
            {suggestions.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={item.isSelected}
                  onChange={(e) => {
                    const newSugg = [...suggestions];
                    newSugg[idx].isSelected = e.target.checked;
                    setSuggestions(newSugg);
                  }}
                />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
              Save Selected
            </button>
            <button onClick={() => setSuggestions([])} className="text-gray-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  ); 
}
