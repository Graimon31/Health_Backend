from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.api.v1.endpoints import chat # Import to register websocket route
from app.db.session import engine, Base
from app.models import user, patient, faq, chat as chat_model # Import all models

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
app.add_websocket_route("/ws/chat", chat.websocket_endpoint) # Register WS explicitly or via router? Router handles it.

# @app.on_event("startup")
# async def startup():
#     # We use Alembic for migrations, so we don't need create_all.
#     # However, for dev simplicity sometimes it's kept.
#     # But to avoid conflicts with Alembic, it is better to rely on migrations.
#     # entrypoint.sh runs alembic upgrade head.
#     pass

@app.get("/health")
def health():
    return {"status": "OK"}
