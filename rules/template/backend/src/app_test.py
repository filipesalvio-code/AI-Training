from fastapi.testclient import TestClient

from src.app import create_app


def test_health_check_available() -> None:
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
