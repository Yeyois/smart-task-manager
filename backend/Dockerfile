# משתמשים בגרסת פייתון קלה ומהירה
FROM python:3.11-slim

# מגדירים תיקיית עבודה בתוך הקונטיינר
WORKDIR /app

# מעתיקים קודם את קובץ הדרישות (כדי לנצל את ה-Cache של דוקר)
COPY requirements.txt .

# מתקינים את הספריות
RUN pip install --no-cache-dir -r requirements.txt

# מעתיקים את שאר הקוד
COPY . .

# הפקודה שתריץ את השרת
# host 0.0.0.0 חשוב מאוד כדי שהשרת יהיה זמין מחוץ לקונטיינר
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
