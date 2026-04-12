import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.api.routes import websocket
from backend.src.core.config import settings
from backend.src.core.logging import setup_logging

# Initialize logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(websocket.router, tags=["Real-time"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

if __name__ == "__main__":
    uvicorn.run(
        "backend.src.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
