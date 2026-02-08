import os
import pytest
from fastapi.testclient import TestClient

# Set test mode before importing app
os.environ["APP_ENV"] = "test"
os.environ["GROQ_MODE"] = "mock"
os.environ["AUTH_MODE"] = "mock"

from app.main import app

@pytest.fixture
def client():
    """FastAPI test client fixture"""
    return TestClient(app)
