import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mlflow
from settings.env_config import env_settings
from api.ai_routes import router as ai_router
from contextlib import asynccontextmanager
from services.stock_manager import stock_manager 

app = FastAPI()

mlflow.set_tracking_uri(uri=env_settings.mlflow_tracking_uri)
mlflow.llama_index.autolog()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    print("🟢 Iniciando servicios...")
    stock_manager.start() # ✅ Aquí sí hay event loop corriendo
    yield
    # --- SHUTDOWN ---
    print("🔴 Deteniendo servicios...")
    # stock_manager.scheduler.shutdown() # Opcional

def create_app() -> FastAPI:
    app = FastAPI(
        title="API Research Stocks",
        description="API para investigar stocks",
        version="1.0.0",
        debug=env_settings.debug,
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=env_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(ai_router)
    
    return app

app = create_app()

def main():

    if env_settings.environment == "development":
        uvicorn.run(
            "api.entrypoint:app", 
            host=env_settings.host, 
            port=env_settings.port, 
            reload=True,  
            log_level=env_settings.log_level.lower(),
        )
    else:
        uvicorn.run(
            "api.entrypoint:app", 
            host=env_settings.host, 
            port=env_settings.port,
            log_level=env_settings.log_level.lower(),
            workers=4
        )
        
if __name__ == "__main__":
    main()