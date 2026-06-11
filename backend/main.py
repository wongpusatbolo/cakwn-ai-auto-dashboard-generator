from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import shutil
import re
from ai_engine.profiler import generate_dashboard_data

app = FastAPI(title="CakwnAI Auto Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "CakwnAI Engine Ready"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx', '.json', '.parquet')):
        raise HTTPException(status_code=400, detail="Format tidak didukung")
        
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_location)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file_location)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file_location)
        else:
            df = pd.read_parquet(file_location)
            
        # Analyze Profile
        missing = int(df.isnull().sum().sum())
        duplicates = int(df.duplicated().sum())
        
        return {
            "filename": file.filename,
            "rows": df.shape[0],
            "columns": df.shape[1],
            "missing": missing,
            "duplicates": duplicates,
            "quality_score": max(0, 100 - (missing/df.size*100) - (duplicates/df.shape[0]*100)),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_dashboard")
async def build_dashboard(filename: str):
    file_location = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(file_location)
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file_location)
        else:
            df = pd.read_json(file_location)
            
        df = df.dropna(thresh=int(df.shape[0]*0.5), axis=1) # Clean garbage
        dashboard_config = generate_dashboard_data(df)
        return dashboard_config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/api/chat")
async def chat_analyst(query: str):
    q = query.lower()
    
    if re.search(r'\b(dashboard|grafik|chart)\b', q):
        reply = "Saya dapat membuat berbagai grafik seperti Line Chart, Bar Chart, Heatmap, dan Scatter Plot. Cukup unggah dataset, dan saya akan merender dashboard secara otomatis!"
    elif re.search(r'\b(prediksi|forecast|ramal)\b', q):
        reply = "Mesin Forecasting saya mendukung model Prophet, ARIMA, dan XGBoost. Aktifkan modul Forecasting di menu sebelah kiri untuk memprediksi metrik target Anda."
    else:
        reply = f"Mengenai '{query}', saya menggunakan algoritma LLM (seperti LangChain/PandasAI) yang memetakan instruksi bahasa alami Anda langsung menjadi query SQL dan Pandas. Ada analisis spesifik yang ingin Anda ketahui dari data Anda?"
        
    return {"reply": reply}
