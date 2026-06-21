from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import Base, engine
from app.models import customer, order, product  # noqa: F401  (ensure models are registered)
from app.routers import customers, dashboard, order as order_router, products

# Create tables if they don't exist yet (simple bootstrap; use Alembic for real migrations).
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # jsonable_encoder safely converts non-JSON-native types (e.g. Decimal,
    # bytes) that can appear in Pydantic's error context before serializing.
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": jsonable_encoder(exc.errors())},
    )


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(order_router.router)
app.include_router(dashboard.router)