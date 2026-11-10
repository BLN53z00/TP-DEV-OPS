from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from tests.conftest import iso


def test_an_order_decrements_the_stock(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=10)

    response = client.post(f"/drops/{drop['id']}/orders")

    assert response.status_code == 201
    order = response.json()
    assert order["drop_id"] == drop["id"]
    assert order["drop"]["remaining"] == 9
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 9


def test_the_last_pair_makes_the_drop_sold_out(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=1)

    response = client.post(f"/drops/{drop['id']}/orders")

    assert response.status_code == 201
    assert response.json()["drop"]["remaining"] == 0
    assert response.json()["drop"]["status"] == "sold_out"
    assert client.get(f"/drops/{drop['id']}").json()["status"] == "sold_out"


def test_ordering_a_sold_out_drop_is_refused(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=1)
    assert client.post(f"/drops/{drop['id']}/orders").status_code == 201

    response = client.post(f"/drops/{drop['id']}/orders")

    assert response.status_code == 409
    assert response.json()["detail"] == f"Le drop {drop['id']} est épuisé"
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 0


def test_the_last_pair_is_never_sold_twice(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=3)

    statuses = [client.post(f"/drops/{drop['id']}/orders").status_code for _ in range(5)]

    assert statuses == [201, 201, 201, 409, 409]
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 0


def test_ordering_a_drop_that_is_not_open_yet_is_refused(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=5, opens_at=iso(datetime.now(UTC) + timedelta(days=1)))

    response = client.post(f"/drops/{drop['id']}/orders")

    assert response.status_code == 409
    assert response.json()["detail"] == f"Le drop {drop['id']} n'est pas encore ouvert"
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 5


def test_ordering_an_unknown_drop_returns_404(client: TestClient) -> None:
    response = client.post("/drops/999/orders")

    assert response.status_code == 404
    assert response.json()["detail"] == "Drop 999 introuvable"
