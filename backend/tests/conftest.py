"""
Shared pytest fixtures.

Each test gets a fresh, isolated SQLite database (file-based, deleted after
the test) so tests never interfere with each other or with a real Postgres
instance. The FastAPI app's `get_db` dependency is overridden to use this
test database instead of the configured DATABASE_URL.
"""
import os
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Must be set before importing the app, since app.core.config reads it at import time.
os.environ.setdefault("DATABASE_URL", "sqlite:///./_pytest_default.db")

from app.core.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    """Yields a TestClient backed by a fresh, uniquely-named SQLite file per test."""
    db_path = f"./_pytest_{uuid.uuid4().hex}.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture()
def sample_product(client):
    """Creates and returns a basic product for tests that need one."""
    resp = client.post("/products", json={
        "name": "Wireless Mouse",
        "sku": "MOU-001",
        "price": 25.50,
        "quantity": 20,
    })
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture()
def sample_customer(client):
    """Creates and returns a basic customer for tests that need one."""
    resp = client.post("/customers", json={
        "full_name": "Asha Verma",
        "email": "asha.verma@example.com",
        "phone_number": "9876543210",
    })
    assert resp.status_code == 201
    return resp.json()
