import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import auth
import main
from database import get_db, init_db


def apply_session_token(client: TestClient, response) -> str:
    token = response.json()["session_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return token


@pytest.fixture()
def db_factory():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    init_db(test_engine)
    factory = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)
    yield factory
    test_engine.dispose()


@pytest.fixture()
def client(db_factory):
    def override_db():
        db = db_factory()
        try:
            yield db
        finally:
            db.close()

    auth.rate_limiter._entries.clear()
    main.app.dependency_overrides[get_db] = override_db
    test_client = TestClient(main.app)
    yield test_client
    test_client.close()
    main.app.dependency_overrides.clear()
