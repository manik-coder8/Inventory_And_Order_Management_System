from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def _order_query(db: Session):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.customer),
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    # Lock and validate every product line before mutating anything.
    products_by_id: dict[int, Product] = {}
    for line in payload.items:
        product = db.query(Product).filter(Product.id == line.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {line.product_id} not found.",
            )
        if product.quantity < line.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient inventory for '{product.name}'. "
                    f"Requested {line.quantity}, available {product.quantity}."
                ),
            )
        products_by_id[product.id] = product

    # All validations passed: build the order, reduce stock, compute total.
    order = Order(customer_id=customer.id, status=OrderStatus.CONFIRMED, total_amount=0)
    db.add(order)
    db.flush()  # assign order.id without committing

    total = 0
    for line in payload.items:
        product = products_by_id[line.product_id]
        unit_price = product.price
        total += unit_price * line.quantity

        product.quantity -= line.quantity  # automatic stock reduction

        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=line.quantity,
            unit_price=unit_price,
        ))

    order.total_amount = total  # automatic total calculation, backend-derived
    db.commit()

    return _order_query(db).filter(Order.id == order.id).first()


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return _order_query(db).order_by(Order.id).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = _order_query(db).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Cancels an order and restores reserved stock back to inventory."""
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already cancelled.")

    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if product:
            product.quantity += item.quantity  # restock on cancellation

    order.status = OrderStatus.CANCELLED
    db.commit()
    return {"detail": "Order cancelled and inventory restored."}
