"""Tests for /customers endpoints and customer-related business rules."""


def test_create_customer_success(client):
    resp = client.post("/customers", json={
        "full_name": "Rohan Mehta",
        "email": "rohan.mehta@example.com",
        "phone_number": "9123456780",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Rohan Mehta"
    assert data["email"] == "rohan.mehta@example.com"
    assert "id" in data


def test_create_customer_duplicate_email_rejected(client, sample_customer):
    resp = client.post("/customers", json={
        "full_name": "Different Name",
        "email": sample_customer["email"],  # same email as existing customer
        "phone_number": "9000000000",
    })
    assert resp.status_code == 409
    assert "email" in resp.json()["detail"].lower()


def test_create_customer_invalid_email_rejected(client):
    resp = client.post("/customers", json={
        "full_name": "No Email Format",
        "email": "not-an-email",
        "phone_number": "9000000000",
    })
    assert resp.status_code == 422


def test_create_customer_missing_required_field(client):
    resp = client.post("/customers", json={"full_name": "Incomplete Customer"})
    assert resp.status_code == 422


def test_list_customers(client, sample_customer):
    resp = client.get("/customers")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["email"] == sample_customer["email"]


def test_get_customer_by_id(client, sample_customer):
    resp = client.get(f"/customers/{sample_customer['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sample_customer["id"]


def test_get_customer_not_found(client):
    resp = client.get("/customers/99999")
    assert resp.status_code == 404


def test_delete_customer(client, sample_customer):
    resp = client.delete(f"/customers/{sample_customer['id']}")
    assert resp.status_code == 204

    resp = client.get(f"/customers/{sample_customer['id']}")
    assert resp.status_code == 404


def test_delete_customer_not_found(client):
    resp = client.delete("/customers/99999")
    assert resp.status_code == 404


def test_delete_customer_with_existing_orders_is_blocked(client, sample_customer, sample_product):
    client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    })

    resp = client.delete(f"/customers/{sample_customer['id']}")
    assert resp.status_code == 409
