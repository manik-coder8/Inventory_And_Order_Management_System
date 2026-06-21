# Inventory & Order Management System

A containerized full-stack app for managing products, customers, and orders with automatic inventory tracking.

**Stack:** React (Vite) · FastAPI · PostgreSQL · Docker

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | `https://inventory-and-order-management-syst-pink.vercel.app` |
| Backend API | `https://backend-inventory-and-order-management.onrender.com` |
| API Docs | `https://backend-inventory-and-order-management.onrender.com/docs` |
| Docker Hub Image | `https://hub.docker.com/r/manik883/inventory-backend-manik` |

---
## Architecture

```
┌─────────────────┐       HTTP/JSON       ┌──────────────────┐       SQL       ┌─────────────────┐
│   React + Vite   │ ────────────────────▶ │  FastAPI Backend │ ──────────────▶ │   PostgreSQL    │
│  (Nginx, :80)     │ ◀──────────────────── │     (:8000)      │ ◀────────────── │     (:5432)     │
└─────────────────┘                        └──────────────────┘                 └─────────────────┘
        │                                            │                                   │
        │                                            │                                   │
   Tailwind CSS                              SQLAlchemy ORM                      Named Docker volume
   Recharts (dashboard)                      Pydantic validation                 (data persists across
   React Router                              CORS-restricted                      container restarts)
```

All three services run as isolated Docker containers, orchestrated by a single `docker-compose.yml`, and communicate over a private Docker network. Only the ports needed for local access (`3000`, `8000`, `5432`) are published to the host.

---
## Running with Docker (recommended)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

Stop with `docker compose down` (add `-v` to also wipe the database volume).

> The frontend's API URL is baked in at **build time**. If you change `VITE_API_URL`, rebuild with `--build`.

---

## Running Locally (without Docker)

**Backend**
```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Running Tests

```bash
cd backend
pytest
```

47 tests covering all endpoints and business rules (stock validation, auto stock deduction, order totals, cancellation/restock).

---

## Project Structure

```
backend/
  app/
    core/        # config, database session
    models/      # SQLAlchemy models
    schemas/      # Pydantic schemas
    routers/      # API endpoints
  tests/          # pytest suite
frontend/
  src/
    api/          # Axios client + endpoints
    components/    # Layout, shared UI
    pages/         # Dashboard, Products, Customers, Orders
docker-compose.yml
```

---

## Business Rules

- Product SKU and customer email must be unique (`409` on duplicate)
- Product quantity/price can never be negative
- Orders are rejected if stock is insufficient (`400`, with available quantity in the message)
- A multi-item order either fully succeeds or fully fails — no partial stock deduction
- Stock is reduced automatically on order creation and restored automatically on cancellation
- Order total is always calculated server-side from live product prices, never trusted from the client
- A product or customer can't be deleted if referenced by an existing order

---

## API Endpoints

| Resource | Endpoints |
|---|---|
| Products | `POST /products` · `GET /products` · `GET /products/{id}` · `PUT /products/{id}` · `DELETE /products/{id}` |
| Customers | `POST /customers` · `GET /customers` · `GET /customers/{id}` · `DELETE /customers/{id}` |
| Orders | `POST /orders` · `GET /orders` · `GET /orders/{id}` · `DELETE /orders/{id}` (cancel + restock) |
| Dashboard | `GET /dashboard/summary` · `GET /dashboard/charts` |

Full interactive docs at `/docs` (Swagger UI).

---

## Environment Variables

Each service has a `.env.example` — copy to `.env` and adjust as needed. Real `.env` files are git-ignored.