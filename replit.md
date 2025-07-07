# Grocery Delivery Application

## Overview

This is a full-stack grocery delivery application built with React on the frontend and Express.js on the backend. The application provides a modern e-commerce experience for purchasing groceries with features like product browsing, cart management, order processing, and admin dashboard functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand for cart and authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer for image handling
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful APIs with proper error handling

### Key Components

#### Data Layer
- **Database Schema**: Products, customers, orders, and admin tables
- **ORM**: Drizzle for type-safe database operations
- **Storage Interface**: Abstracted storage layer supporting both memory and database implementations
- **Migration System**: Drizzle Kit for database schema management

#### Authentication & Authorization
- **Admin Authentication**: Email/password based authentication
- **Session Management**: Server-side sessions with PostgreSQL persistence
- **Protected Routes**: Route guards for admin dashboard access
- **State Persistence**: Client-side auth state using Zustand persist middleware

#### Product Management
- **Product Catalog**: Categories include fruits, dairy, meat, bakery, and pantry items
- **Image Upload**: Support for product images with file validation
- **Category Filtering**: Dynamic filtering by product categories
- **CRUD Operations**: Full admin capabilities for product management

#### Shopping Cart
- **Persistent Cart**: Local storage persistence using Zustand
- **Real-time Updates**: Immediate UI updates for quantity changes
- **Cart Calculations**: Automatic subtotal and total calculations
- **Item Management**: Add, remove, and update quantities

#### Order Processing
- **Customer Information**: Collection of delivery details
- **Payment Integration**: Mock JazzCash payment gateway integration
- **Order Status**: Tracking order states (pending, confirmed, etc.)
- **Order History**: Admin order management and status updates

## Data Flow

1. **Product Display**: Products are fetched from the database and displayed with category filtering
2. **Cart Management**: Items are added to cart with persistent local storage
3. **Checkout Process**: Customer details are collected and validated
4. **Payment Processing**: Mock payment gateway handles transaction simulation
5. **Order Creation**: Order is stored with customer and item details
6. **Admin Management**: Orders can be viewed and managed through admin dashboard

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **State Management**: Zustand with persist middleware
- **Data Fetching**: TanStack Query
- **Form Handling**: React Hook Form, Zod validation
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority
- **Utilities**: clsx, date-fns, lucide-react icons

### Backend Dependencies
- **Server Framework**: Express.js
- **Database**: Drizzle ORM, @neondatabase/serverless
- **File Handling**: Multer for uploads
- **Session Management**: Express-session, connect-pg-simple
- **Development**: tsx for TypeScript execution, esbuild for bundling

### Build Tools
- **Frontend**: Vite with React plugin
- **Backend**: esbuild for production bundling
- **TypeScript**: Shared configuration across client and server
- **Development**: Concurrent development with hot reload

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with automatic restart on changes
- **Database**: Neon serverless PostgreSQL for development
- **File Uploads**: Local filesystem storage

### Production Build
- **Frontend**: Static build output served by Express
- **Backend**: ESM bundle created with esbuild
- **Database**: Neon PostgreSQL with environment-based configuration
- **File Serving**: Express static middleware for uploaded images

### Environment Configuration
- **Database URL**: Configured via DATABASE_URL environment variable
- **File Uploads**: Configurable upload directory
- **Session Secret**: Environment-based session configuration
- **CORS**: Configured for production domains

The application follows modern full-stack practices with type safety, proper error handling, and scalable architecture patterns. The modular design allows for easy extension and maintenance.

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added complete user authentication system with login/signup
- July 07, 2025. Implemented real-time admin notifications via WebSocket for new orders
- July 07, 2025. Fixed search functionality with real-time filtering
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```