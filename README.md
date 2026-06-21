# Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing products, customers, and orders, with automatic inventory tracking.

**Stack:** React (Vite) · FastAPI · PostgreSQL · Docker · Docker Compose

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | `<add your deployed Vercel/Netlify URL here>` |
| Backend API | `<add your deployed Render URL here>` |
| API Docs (Swagger) | `<backend URL>/docs` |
| Docker Hub Image | `<add your Docker Hub image link here>` |

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Business Rules](#business-rules)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Design Decisions](#design-decisions)

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

## Tech Stack

**Backend**
- Python 3.12, FastAPI
- SQLAlchemy ORM (PostgreSQL in Docker/production, SQLite for tests)
- Pydantic v2 for request/response validation
- pytest for automated testing

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- Recharts (dashboard visualizations)
- React Router, Axios

**Infrastructure**
- Docker (multi-stage builds, slim base images)
- Docker Compose (service orchestration)
- Nginx (serves the production frontend build)

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/          # Config and database session management
│   │   ├── models/        # SQLAlchemy ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers (products, customers, orders, dashboard)
│   │   └── main.py        # FastAPI app entrypoint, CORS, error handlers
│   ├── tests/              # pytest suite (47 tests)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Centralized Axios client + endpoint functions
│   │   ├── components/     # Shared UI primitives, layout
│   │   └── pages/          # Dashboard, Products, Customers, Orders
│   ├── Dockerfile           # Multi-stage build → Nginx
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── .env.example
```

---

## Business Rules

These rules are enforced at the API layer, independent of the frontend:

| Rule | Enforcement |
|---|---|
| Product SKU must be unique | `409 Conflict` on duplicate SKU (create or update) |
| Customer email must be unique | `409 Conflict` on duplicate email |
| Product quantity cannot be negative | Pydantic field validation (`422`) + DB-level `CHECK` constraint |
| Orders cannot be placed if inventory is insufficient | `400 Bad Request`, with available quantity in the error message |
| Order creation must fully validate before mutating anything | All line items are checked for stock availability before any stock is deducted — a multi-item order either fully succeeds or fully fails |
| Stock is automatically reduced when an order is created | Handled server-side in the order creation transaction |
| Stock is automatically restored when an order is cancelled | Handled server-side in the cancellation transaction |
| Order total is calculated by the backend, never trusted from the client | Computed from each line's live product price × quantity |
| A product cannot be deleted if it's referenced by an existing order | `409 Conflict` |
| A customer cannot be deleted if they have existing orders | `409 Conflict` |

---

## Getting Started (Local Development)

Use this path when actively working on the UI or API and you want fast hot-reload feedback.

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL running locally, **or** run just the database via Docker:
  ```bash
  docker run --name inventory-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=inventory_db -p 5432:5432 -d postgres:16-alpine
  ```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # adjust DATABASE_URL if needed
uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** · Swagger docs at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Running with Docker

This is the fully containerized setup — exactly what's described in the project requirements.

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
| PostgreSQL | localhost:5432 |

Stop everything with `docker compose down` (add `-v` to also remove the database volume).

> **Note:** the frontend's API base URL (`VITE_API_URL`) is baked in at **build time**, not runtime, since it's a static Vite build served by Nginx. If you change it, rebuild with `docker compose up --build`.

---

## Running Tests

The backend has a 47-test pytest suite covering all CRUD endpoints, validation, and — most importantly — the business rules around stock and order totals (insufficient stock, automatic deduction, automatic restoration on cancellation, partial-failure rollback, etc). Each test runs against an isolated, temporary SQLite database, so the suite has no dependency on Docker or a running Postgres instance.

```bash
cd backend
pip install -r requirements.txt
pytest
```

Expected output: `47 passed`.

---

## API Reference

Full interactive documentation is auto-generated by FastAPI at `/docs` (Swagger UI) and `/redoc`. Summary:

### Products
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get a product by ID |
| `PUT` | `/products/{id}` | Update a product |
| `DELETE` | `/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get a customer by ID |
| `DELETE` | `/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create an order (one or more line items) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order details by ID |
| `DELETE` | `/orders/{id}` | Cancel an order and restore stock |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Total products, customers, orders, and low-stock items |
| `GET` | `/dashboard/charts` | Stock levels, 14-day order trend, and revenue by product |

---

## Environment Variables

Each service has its own `.env.example`. Real `.env` files are git-ignored and never committed.

**Root (`.env`)** — used by Docker Compose
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me_in_production
POSTGRES_DB=inventory_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173
LOW_STOCK_THRESHOLD=10
VITE_API_URL=http://localhost:8000
```

**`backend/.env`**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/inventory_db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOW_STOCK_THRESHOLD=10
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:8000
```

---

## Design Decisions

A few choices worth calling out:

- **Order line items are modeled as a separate `order_items` table** (not a single product per order), so one order can contain multiple products — this matches how real order systems work and was the more defensible interpretation of "Product reference(s)" in the requirements.
- **Stock validation happens before any mutation.** When an order has multiple line items, every line is checked for sufficient stock *before* any stock is deducted or any row is written — so a multi-item order can never partially apply.
- **Unit price is snapshotted onto each order item** at the time of purchase, rather than always joining to the live product price. This keeps historical order totals accurate even if a product's price changes later.
- **Cancelling an order restores stock** rather than deleting the order outright, preserving an audit trail (`status: cancelled`) instead of silently losing the record.
- **The frontend's design system** (warm paper background, ink-navy sidebar, signal-orange accent, monospace numerals for SKUs/prices) was a deliberate choice to avoid the generic "blue SaaS admin panel" look that most quick admin tools default to.