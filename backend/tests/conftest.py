"""
Pytest configuration and fixtures for KISAN CULTURE Backend.
"""

import sys
import os
import pytest
from starlette.testclient import TestClient

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from app.database import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initializes SQLite database before test execution."""
    init_db()


@pytest.fixture
def client():
    """Provides a fresh TestClient for each test."""
    with TestClient(app) as test_client:
        yield test_client

