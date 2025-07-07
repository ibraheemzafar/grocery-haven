# Online Grocery Store

A complete full-stack online grocery store application built with React, Express.js, and TypeScript.

## Features

### User Features
- Product catalog with category filtering
- Shopping cart with persistent storage
- Checkout process with customer details form
- Payment options: Cash on Delivery & JazzCash (mock)
- Order confirmation page

### Admin Features
- Admin authentication system
- Dashboard with sales statistics
- Product management (add/edit/delete)
- Order tracking and status updates
- File upload support for product images

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** React 18, TypeScript, Vite
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **UI Components:** Radix UI + Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Routing:** Wouter
- **Database:** In-memory storage (replaceable with PostgreSQL)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5000 in your browser

## Demo Credentials

### Admin Login
- **Email:** admin@grocerymart.com
- **Password:** admin123

## Project Structure

```
grocery-store/
├── shared/
│   └── schema.ts          # Database schema and types
├── server/
│   ├── index.ts          # Express server setup
│   ├── routes.ts         # API routes
│   ├── storage.ts        # In-memory database
│   └── vite.ts          # Vite development setup
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Application pages
│   │   ├── lib/          # Utilities and stores
│   │   └── App.tsx       # Main app component
│   └── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics

## Development

The application uses:
- Hot reload for both frontend and backend
- TypeScript for type safety
- ESLint and Prettier for code quality
- Tailwind CSS for styling

## Production Build

```bash
npm run build
npm start
```

## License

MIT License - feel free to use this code for your projects!