import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.database.session import engine, Base, SessionLocal
from backend.app.api.routes import router as api_router
from backend.app.services.demo_data import load_demo_investigation

from contextlib import asynccontextmanager

# Initialize DB tables
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("forensic_platform")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing forensic database schema and baseline assets...")
    # Pre-populate demo investigation data on fresh startup so system is immediately operational
    db = SessionLocal()
    try:
        load_demo_investigation(db)
        logger.info("Demo investigation successfully loaded and ready.")
    except Exception as e:
        logger.error(f"Error during demo initialization: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Unified Multi-Vendor DVR/NVR Forensic Analysis & Evidence Intelligence Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware to allow React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health():
    return {"status": "HEALTHY", "protocol": "ISO/IEC 27037"}

# Mount Frontend static distribution if built
frontend_dist = settings.STORAGE_PATH.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "status": "OPERATIONAL",
            "forensic_protocol": "ISO/IEC 27037 Compliant",
            "docs": "/docs"
        }
