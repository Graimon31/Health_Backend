from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.doctor import router as doctor_router
from app.api.measurements import router as measurements_router
from app.api.patient import router as patient_router
from app.api.prediction import router as prediction_router
from app.core.config import settings
from app.db import Base, engine
from app.models.measurement import Measurement  # noqa: F401
from app.models.patient import HealthMeasurement, Patient  # noqa: F401 — ensure tables created
from app.models.patient_profile import PatientProfile  # noqa: F401
from app.models.user import User, UserRole
from app.security import hash_password

app = FastAPI(title='Health Backend API', docs_url='/api/docs', openapi_url='/api/openapi.json')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(',') if origin.strip()],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(measurements_router)
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(prediction_router)

static_dir = Path(__file__).parent / 'static'
assets_dir = static_dir / 'assets'
if assets_dir.exists():
    app.mount('/assets', StaticFiles(directory=assets_dir), name='assets')


@app.on_event('startup')
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        admin = db.query(User).filter(User.email == settings.admin_email).first()
        if admin is None:
            db.add(
                User(
                    email=settings.admin_email,
                    password_hash=hash_password(settings.admin_password),
                    role=UserRole.ADMIN,
                    full_name=settings.admin_full_name,
                )
            )
            db.commit()


@app.get('/api/v1/health')
def health() -> dict[str, str]:
    return {'status': 'OK'}


@app.get('/')
def web_root() -> FileResponse:
    index_file = static_dir / 'index.html'
    if index_file.exists():
        return FileResponse(index_file)
    return FileResponse(Path(__file__).parent / 'fallback-index.html')
