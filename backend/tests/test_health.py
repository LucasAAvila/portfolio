from httpx import AsyncClient


async def test_health_returns_200(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
