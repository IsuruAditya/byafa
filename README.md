# Byafa — E-Commerce Platform

A production-quality full-stack e-commerce storefront built with the MERN stack. Supports real Stripe payments, JWT authentication, role-based access control, and a complete admin dashboard.

## Project Structure

```
simple-ecommerce/
├── backend/          # Express.js + TypeScript REST API
├── frontend/         # React 19 + Vite + Redux Toolkit SPA
├── mobile/           # React Native + Expo mobile app
├── api/              # Vercel serverless entry point
├── docs/             # Project documentation
└── _bmad-output/     # BMAD planning artifacts (PRD, architecture, epics)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Redux Toolkit, Tailwind CSS v4 |
| Backend | Node.js 18+, Express v5, TypeScript, Mongoose |
| Database | MongoDB Atlas |
| Payments | Stripe (Payment Intents + Webhooks) |
| Auth | JWT (access + refresh token rotation) |
| Images | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Mobile | React Native + Expo |
| Deployment | Render (backend + frontend) / Vercel (serverless) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 tier)
- Stripe account (test mode)
- Cloudinary account (free tier)
- Gmail account with App Password enabled

### 1. Clone and install dependencies

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install mobile dependencies (optional)
cd ../mobile && npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env` and fill in your values:

```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy `.env.example` to `.env` and fill in your values:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Seed the database

```bash
cd backend && npm run seed
```

This fetches real product data from dummyjson.com and creates an admin user:
- Email: `admin@simple-ecommerce.dev`
- Password: `Admin1234!`

### 4. Start development servers

**Backend** (port 5000):
```bash
cd backend && npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend && npm run dev
```

**Mobile** (Expo):
```bash
cd mobile && npm start
```

## API Reference

All endpoints are prefixed with `/api/v1/`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new customer |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/profile` | Update profile |
| PATCH | `/auth/password` | Change password |
| DELETE | `/auth/account` | Delete account |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (paginated, filterable) |
| GET | `/products/:id` | Get single product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/create-payment-intent` | Create Stripe Payment Intent |
| GET | `/orders` | Get my orders |
| GET | `/orders/:id` | Get order details |
| GET | `/orders/:id/status` | Poll order status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews/product/:productId` | Get product reviews |
| POST | `/reviews` | Submit a review (authenticated) |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List all products |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |
| PATCH | `/admin/products/:id/inventory` | Update stock |
| GET | `/admin/orders` | List all orders |
| GET | `/admin/orders/:id` | Get order details |
| PATCH | `/admin/orders/:id/status` | Update order status |
| POST | `/admin/orders/:id/refund` | Issue Stripe refund |
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/summary` | Revenue summary |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/stripe` | Stripe webhook handler |

## Deployment

### Render (recommended)

The `render.yaml` file configures both the backend and frontend for Render deployment.

1. Connect your GitHub repository to Render
2. Render will auto-detect `render.yaml` and create both services
3. Set the required environment variables in the Render dashboard
4. Deploy

### Vercel (serverless)

The `api/index.ts` file wraps the Express app for Vercel serverless deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the project root
3. Set environment variables in the Vercel dashboard

## Architecture

See [`_bmad-output/planning-artifacts/architecture.md`](_bmad-output/planning-artifacts/architecture.md) for the full architecture decision document.

Key patterns:
- **Backend:** Layered architecture (routes → controllers → services → models)
- **Frontend:** Feature-based folder structure with Redux Toolkit
- **Auth:** JWT access tokens (15min) + refresh tokens (7 days, httpOnly cookie)
- **Payments:** Stripe Payment Intents + webhook-confirmed order creation
- **Real-time:** HTTP polling (admin: 30s, order status: 60s, stock: on-demand)

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in Redux (access) + httpOnly cookie (refresh)
- Stripe webhook signature verification on every event
- Rate limiting: 200 req/15min globally, 20 req/15min on auth routes
- CORS restricted to configured `CLIENT_URL` in production
- Input validation with `express-validator` on all mutating routes
- Helmet.js security headers

## License

MIT
