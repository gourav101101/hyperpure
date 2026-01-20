# Hyperpure Dynamic System

## Overview
The entire Hyperpure application is fully dynamic with MongoDB backend and Cloudinary image uploads.

## Tech Stack
- **Database**: MongoDB with Mongoose ODM
- **Image Storage**: Cloudinary
- **Authentication**: Firebase (Phone OTP only)
- **Framework**: Next.js 16

## Admin Access
- URL: `/admin/login`
- Email: `admin@hyperpure.com`
- Password: `admin123`

## Features

### 1. Dynamic Categories (`/admin/categories`)
- Add/Edit/Delete categories
- Set category name and icon (emoji)
- Categories automatically appear on homepage

### 2. Dynamic Products (`/admin/products`)
- Add/Edit/Delete products
- Upload images via Cloudinary
- Full product details:
  - Name, Price, Unit
  - Category selection
  - Multiple images (up to 5)
  - Veg/Non-veg indicator
  - Description
  - Key Features (multiple)
  - Serving Instructions (multiple)
  - Pack Size
  - Bulk pricing (optional)
  - Bulk quantity (optional)

### 3. Dynamic Blogs (`/admin/blogs`)
- Add/Edit/Delete blog posts
- Rich content blocks:
  - Headings
  - Subheadings
  - Paragraphs
  - Images
- Publish/Draft status
- Blog detail pages at `/blog/[id]`

### 4. Admin Dashboard (`/admin/dashboard`)
- Real-time statistics
- Total categories, products, blogs
- Quick action buttons

### 5. Image Upload System
- Cloudinary integration
- Direct file upload from admin panel
- Automatic URL generation

## Database Structure

### MongoDB Collections

#### `categories`
```javascript
{
  name: String (required),
  icon: String (required),
  order: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### `products`
```javascript
{
  name: String (required),
  price: Number (required),
  unit: String (required),
  category: String (required),
  images: [String],
  veg: Boolean (default: true),
  description: String,
  keyFeatures: [String],
  servingInstructions: [String],
  packSize: String,
  bulkPrice: String,
  bulkQuantity: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### `blogs`
```javascript
{
  title: String (required),
  category: String,
  author: String,
  date: String,
  readTime: String,
  featuredImage: String,
  blocks: [{
    id: String,
    type: String,
    content: String
  }],
  published: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=mongodb://localhost:27017/hyperpure
```

## API Routes

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id={id}` - Delete category

### Products
- `GET /api/products` - Get all products
- `GET /api/products?id={id}` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products` - Update product
- `DELETE /api/products?id={id}` - Delete product

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs?id={id}` - Get single blog
- `POST /api/blogs` - Create blog
- `PUT /api/blogs` - Update blog
- `DELETE /api/blogs?id={id}` - Delete blog

### Upload
- `POST /api/upload` - Upload image to Cloudinary

## Frontend Integration
- **Homepage**: Dynamic categories and products
- **Product Showcase**: Products grouped by category
- **Product Detail**: `/catalogue/[id]`
- **Blog Listing**: `/blog`
- **Blog Detail**: `/blog/[id]`
- **Similar Products**: Auto-suggests from same category

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Setup MongoDB:
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env.local
```

3. Run development server:
```bash
npm run dev
```

4. Access admin panel:
```
http://localhost:3000/admin/login
```
