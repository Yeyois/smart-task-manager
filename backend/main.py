import os
import json
from google import genai
from google.genai import types
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY not found in .env file. AI feature will fail.")

client = None
if GOOGLE_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")
else:
    print("WARNING: GOOGLE_API_KEY not found. AI features will be disabled.")


SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread":False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TaskDB(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)


Base.metadata.create_all(bind=engine)

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False

class TaskResponse(TaskCreate):
    id: int
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True

class AISubtasksResponse(BaseModel):
    original_task_id: int
    suggested_subtasks: List[str]

class BatchTasksCreate(BaseModel):
    parent_task_id: int
    subtasks_titles: List[str]

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost",
    "http://127.0.0.1",
    "http://127.0.0.1:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_origin(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin:
        print(f"DEBUG: Incoming Origin: {origin}")
    response = await call_next(request)
    return response


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = TaskDB(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[TaskResponse])
def read_tasks(skip: int=0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(TaskDB).offset(skip).limit(limit).all()
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskResponse)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskCreate, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.query(TaskDB).filter(TaskDB.parent_id == task_id).delete()
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully!"}

@app.post("/tasks/batch-create")
def batch_create_subtasks(payload: BatchTasksCreate, db: Session = Depends(get_db)):
    parent = db.query(TaskDB).filter(TaskDB.id == payload.parent_task_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent task not found")
    new_tasks_objects = [
        TaskDB(
            title=title,
            description=f"Subtask of: {payload.parent_task_id}"   ,
            is_completed=False,
            parent_id=payload.parent_task_id
        )
        for title in payload.subtasks_titles
    ]

    try:
        db.add_all(new_tasks_objects)
        db.commit()

        return {"message": f"successfully created {len(new_tasks_objects)} subtasks", "parent_id": payload.parent_task_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error {str(e)}")

# agent ai
@app.post("/tasks/{task_id}/generate-subtasks", response_model=AISubtasksResponse)
async def generate_subtasks(task_id: int, db: Session = Depends(get_db)):
    if not client:
        raise HTTPException(status_code=503, detail="AI functionality is disabled (Missing API Key).")

    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    prompt = f"""
    You are a task manager assistant.
    Task: {task.title}
    Description: {task.description or 'No description'}
    
    Break this task down into 3-5 actionable subtasks.
    Return ONLY a JSON object with this structure:
    {{
        "subtasks": ["subtask 1", "subtask 2", "subtask 3"]
    }}
    """

    try:
        response = await client.aio.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        data = json.loads(response.text)
        subtasks = data.get("subtasks", [])

        return AISubtasksResponse(original_task_id=task_id, suggested_subtasks=subtasks)
    
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=503, detail="AI service unavailable.")