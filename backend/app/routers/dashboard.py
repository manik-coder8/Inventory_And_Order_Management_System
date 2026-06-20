from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.product import ProductOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    low_stock_products = (
        db.query(Product)
        .filter(Product.quantity <= settings.low_stock_threshold)
        .order_by(Product.quantity)
        .all()
    )

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_threshold": settings.low_stock_threshold,
        "low_stock_products": [ProductOut.model_validate(p) for p in low_stock_products],
    }


@router.get("/charts")
def get_charts(db: Session = Depends(get_db)):
    """Aggregated data for the dashboard's three charts: stock levels,
    orders trend (last 14 days), and revenue by product."""

    # --- 1. Stock levels per product (capped to top 10 by quantity for readability) ---
    products = db.query(Product).order_by(Product.quantity.desc()).limit(10).all()
    stock_levels = [
        {"name": p.name, "sku": p.sku, "quantity": p.quantity, "low_stock": p.quantity <= settings.low_stock_threshold}
        for p in products
    ]

    # --- 2. Orders trend: count of (non-cancelled) orders per day, last 14 days ---
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=13)

    daily_counts = (
        db.query(func.date(Order.created_at).label("day"), func.count(Order.id).label("count"))
        .filter(func.date(Order.created_at) >= start_date)
        .filter(Order.status != OrderStatus.CANCELLED)
        .group_by(func.date(Order.created_at))
        .all()
    )
    counts_by_day = {str(row.day): row.count for row in daily_counts}

    orders_trend = []
    for i in range(14):
        day = start_date + timedelta(days=i)
        orders_trend.append({
            "date": day.isoformat(),
            "label": day.strftime("%b %d"),
            "orders": counts_by_day.get(str(day), 0),
        })

    # --- 3. Revenue by product (top 8 products by revenue, excludes cancelled orders) ---
    revenue_rows = (
        db.query(
            Product.name.label("name"),
            func.sum(OrderItem.unit_price * OrderItem.quantity).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != OrderStatus.CANCELLED)
        .group_by(Product.name)
        .order_by(func.sum(OrderItem.unit_price * OrderItem.quantity).desc())
        .limit(8)
        .all()
    )
    revenue_by_product = [{"name": row.name, "revenue": float(row.revenue)} for row in revenue_rows]

    return {
        "stock_levels": stock_levels,
        "orders_trend": orders_trend,
        "revenue_by_product": revenue_by_product,
    }