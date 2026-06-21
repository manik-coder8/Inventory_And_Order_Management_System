"""Tests for /dashboard endpoints."""


def test_dashboard_summary_empty_state(client):
    resp = client.get("/dashboard/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_products"] == 0
    assert data["total_customers"] == 0
    assert data["total_orders"] == 0
    assert data["low_stock_products"] == []


def test_dashboard_summary_reflects_created_data(client, sample_customer, sample_product):
    resp = client.get("/dashboard/summary")
    data = resp.json()
    assert data["total_products"] == 1
    assert data["total_customers"] == 1
    assert data["total_orders"] == 0


def test_dashboard_summary_flags_low_stock(client):
    client.post("/products", json={
        "name": "Almost Out", "sku": "LOW-001", "price": 5.00, "quantity": 2,
    })
    client.post("/products", json={
        "name": "Well Stocked", "sku": "OK-001", "price": 5.00, "quantity": 500,
    })

    resp = client.get("/dashboard/summary")
    low_stock_skus = [p["sku"] for p in resp.json()["low_stock_products"]]
    assert "LOW-001" in low_stock_skus
    assert "OK-001" not in low_stock_skus


def test_dashboard_charts_empty_state(client):
    resp = client.get("/dashboard/charts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stock_levels"] == []
    assert len(data["orders_trend"]) == 14
    assert data["revenue_by_product"] == []


def test_dashboard_charts_revenue_excludes_cancelled_orders(client, sample_customer, sample_product):
    order = client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 2}],
    }).json()
    client.delete(f"/orders/{order['id']}")  # cancel it

    resp = client.get("/dashboard/charts")
    assert resp.json()["revenue_by_product"] == []


def test_dashboard_charts_revenue_includes_confirmed_orders(client, sample_customer, sample_product):
    client.post("/orders", json={
        "customer_id": sample_customer["id"],
        "items": [{"product_id": sample_product["id"], "quantity": 2}],
    })

    resp = client.get("/dashboard/charts")
    revenue = resp.json()["revenue_by_product"]
    assert len(revenue) == 1
    assert revenue[0]["name"] == sample_product["name"]
    assert revenue[0]["revenue"] == float(sample_product["price"]) * 2
