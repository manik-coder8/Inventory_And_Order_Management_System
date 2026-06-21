"""Tests for /products endpoints and product-related business rules."""


def test_create_product_success(client):
    resp = client.post("/products", json={
        "name": "Laptop Stand",
        "sku": "LAP-STD-01",
        "price": 39.99,
        "quantity": 15,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Laptop Stand"
    assert data["sku"] == "LAP-STD-01"
    assert float(data["price"]) == 39.99
    assert data["quantity"] == 15
    assert "id" in data


def test_create_product_duplicate_sku_rejected(client, sample_product):
    resp = client.post("/products", json={
        "name": "Wireless Mouse (Other Color)",
        "sku": sample_product["sku"],  # same SKU as existing product
        "price": 30.00,
        "quantity": 5,
    })
    assert resp.status_code == 409
    assert "sku" in resp.json()["detail"].lower()


def test_create_product_negative_quantity_rejected(client):
    resp = client.post("/products", json={
        "name": "Bad Product",
        "sku": "BAD-001",
        "price": 10.00,
        "quantity": -5,
    })
    assert resp.status_code == 422


def test_create_product_negative_price_rejected(client):
    resp = client.post("/products", json={
        "name": "Bad Product",
        "sku": "BAD-002",
        "price": -10.00,
        "quantity": 5,
    })
    assert resp.status_code == 422


def test_create_product_missing_required_field(client):
    resp = client.post("/products", json={"name": "Incomplete Product"})
    assert resp.status_code == 422


def test_list_products(client, sample_product):
    resp = client.get("/products")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["sku"] == sample_product["sku"]


def test_get_product_by_id(client, sample_product):
    resp = client.get(f"/products/{sample_product['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sample_product["id"]


def test_get_product_not_found(client):
    resp = client.get("/products/99999")
    assert resp.status_code == 404


def test_update_product(client, sample_product):
    resp = client.put(f"/products/{sample_product['id']}", json={
        "price": 19.99,
        "quantity": 50,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert float(data["price"]) == 19.99
    assert data["quantity"] == 50
    assert data["name"] == sample_product["name"]  # unchanged fields stay intact


def test_update_product_to_duplicate_sku_rejected(client, sample_product):
    other = client.post("/products", json={
        "name": "Keyboard",
        "sku": "KEY-001",
        "price": 45.00,
        "quantity": 10,
    }).json()

    resp = client.put(f"/products/{other['id']}", json={"sku": sample_product["sku"]})
    assert resp.status_code == 409


def test_update_product_not_found(client):
    resp = client.put("/products/99999", json={"price": 10})
    assert resp.status_code == 404


def test_delete_product(client, sample_product):
    resp = client.delete(f"/products/{sample_product['id']}")
    assert resp.status_code == 204

    resp = client.get(f"/products/{sample_product['id']}")
    assert resp.status_code == 404


def test_delete_product_not_found(client):
    resp = client.delete("/products/99999")
    assert resp.status_code == 404


def test_delete_product_referenced_by_order_is_blocked(client, sample_product, sample_customer):
    client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    })

    resp = client.delete(f"/products/{sample_product['id']}")
    assert resp.status_code == 409
