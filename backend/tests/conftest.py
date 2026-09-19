import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.location.models import Location


TEST_DATABASE_URL = "sqlite:///./test_waitlist.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture
def client():

    # Crear BD limpia para cada prueba
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Crear local necesario para las pruebas
    db = TestingSessionLocal()

    location = Location(
        name="La Terraza Azul",
        country="PE",
        timezone="America/Lima",
    )

    db.add(location)
    db.commit()
    db.close()

    # Reemplazar la BD real por la BD de pruebas
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