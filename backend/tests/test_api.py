import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_list_questions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/questions")
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body
    assert "total" in body

@pytest.mark.asyncio
async def test_check_answer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/check-answer", json={"question_id": "q-dbms-2023-1", "user_answer": "A"})
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        body = resp.json()
        assert "is_correct" in body
        assert "solution" in body
