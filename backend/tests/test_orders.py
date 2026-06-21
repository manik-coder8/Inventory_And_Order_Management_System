"""
Tests for /orders endpoints and the core business rules:
- Orders cannot be placed if inventory is insufficient.
- Creating an order automatically reduces available stock.
- The total order amount is calculated automatically by the backend.
- Cancelling an order restores the reserved stock.
"""


def test_create_order_success(client, sample_customer, sample_product):
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 3}],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_id"] == sample_customer["id"]
    assert data["status"] == "confirmed"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3


def test_order_total_is_calculated_automatically(client, sample_customer, sample_product):
    # sample_product price is 25.50; ordering 4 units should total 102.00,
    # regardless of what (if anything) the client sends for a total.
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 4}],
    })
    assert resp.status_code == 201
    assert float(resp.json()["total_amount"]) == 102.00


def test_order_total_sums_multiple_line_items(client, sample_customer):
    p1 = client.post("/products", json={"name": "A", "sku": "A-1", "price": 10.00, "quantity": 10}).json()
    p2 = client.post("/products", json={"name": "B", "sku": "B-1", "price": 5.00, "quantity": 10}).json()

    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [
            {"product_id": p1["id"], "quantity": 2},  # 20.00
            {"product_id": p2["id"], "quantity": 3},  # 15.00
        ],
    })
    assert resp.status_code == 201
    assert float(resp.json()["total_amount"]) == 35.00


def test_order_reduces_product_stock_automatically(client, sample_customer, sample_product):
    starting_qty = sample_product["quantity"]  # 20
    client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 6}],
    })

    resp = client.get(f"/products/{sample_product['id']}")
    assert resp.json()["quantity"] == starting_qty - 6


def test_order_rejected_when_stock_insufficient(client, sample_customer, sample_product):
    # sample_product has 20 in stock; request more than that.
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 999}],
    })
    assert resp.status_code == 400
    assert "insufficient" in resp.json()["detail"].lower()

    # Stock must remain untouched after a rejected order.
    product_resp = client.get(f"/products/{sample_product['id']}")
    assert product_resp.json()["quantity"] == sample_product["quantity"]


def test_order_with_one_invalid_line_does_not_partially_apply(client, sample_customer, sample_product):
    """If any line in a multi-item order fails validation, no stock should be
    deducted for any line — the whole order must succeed or fail together."""
    p_low_stock = client.post("/products", json={
        "name": "Limited Item", "sku": "LIM-001", "price": 5.00, "quantity": 1,
    }).json()

    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [
            {"product_id": sample_product["id"], "quantity": 2},   # valid on its own
            {"product_id": p_low_stock["id"], "quantity": 5},      # exceeds available stock
        ],
    })
    assert resp.status_code == 400

    # Neither product's stock should have changed.
    r1 = client.get(f"/products/{sample_product['id']}")
    assert r1.json()["quantity"] == sample_product["quantity"]
    r2 = client.get(f"/products/{p_low_stock['id']}")
    assert r2.json()["quantity"] == 1


def test_order_nonexistent_customer_rejected(client, sample_product):
    resp = client.post("/orders", json={
        "customer_id": 99999,
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    })
    assert resp.status_code == 404


def test_order_nonexistent_product_rejected(client, sample_customer):
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": 99999, "quantity": 1}],
    })
    assert resp.status_code == 404


def test_order_with_empty_items_rejected(client, sample_customer):
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [],
    })
    assert resp.status_code == 422


def test_order_with_zero_quantity_rejected(client, sample_customer, sample_product):
    resp = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 0}],
    })
    assert resp.status_code == 422


def test_list_orders(client, sample_customer, sample_product):
    client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    })
    resp = client.get("/orders")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_order_by_id(client, sample_customer, sample_product):
    created = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    }).json()

    resp = client.get(f"/orders/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_order_not_found(client):
    resp = client.get("/orders/99999")
    assert resp.status_code == 404


def test_cancel_order_restores_stock(client, sample_customer, sample_product):
    starting_qty = sample_product["quantity"]  # 20
    order = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 7}],
    }).json()

    # Stock should be reduced after the order.
    after_order = client.get(f"/products/{sample_product['id']}").json()
    assert after_order["quantity"] == starting_qty - 7

    cancel_resp = client.delete(f"/orders/{order['id']}")
    assert cancel_resp.status_code == 200

    order_resp = client.get(f"/orders/{order['id']}")
    assert order_resp.json()["status"] == "cancelled"

    # Stock should be fully restored after cancellation.
    after_cancel = client.get(f"/products/{sample_product['id']}").json()
    assert after_cancel["quantity"] == starting_qty


def test_cancel_already_cancelled_order_rejected(client, sample_customer, sample_product):
    order = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 1}],
    }).json()

    client.delete(f"/orders/{order['id']}")
    second_cancel = client.delete(f"/orders/{order['id']}")
    assert second_cancel.status_code == 400


def test_cancel_order_not_found(client):
    resp = client.delete("/orders/99999")
    assert resp.status_code == 404
