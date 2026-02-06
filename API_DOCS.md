# API Documentation

## Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

## Products
- GET `/api/products` - List all products
- GET `/api/products/[id]` - Get product details
- POST `/api/products` - Create product (Admin)

## Orders
- GET `/api/orders` - List user orders
- POST `/api/orders` - Create order
- GET `/api/orders/[id]` - Get order details

## Health
- GET `/api/health` - Health check endpoint
