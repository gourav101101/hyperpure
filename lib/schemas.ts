import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  unitType: z.enum(['Weight', 'Volume', 'Piece', 'Pack']),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  veg: z.boolean(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sku: z.string().optional(),
});

// Seller Product Schema
export const sellerProductSchema = z.object({
  sellerPrice: z.number().min(1, 'Price must be greater than 0'),
  unitValue: z.number().min(0.1, 'Unit value must be greater than 0'),
  unitMeasure: z.string().min(1, 'Unit measure is required'),
  stock: z.number().int().min(1, 'Stock must be at least 1'),
  minOrderQty: z.number().int().min(1, 'Minimum order quantity is required'),
  maxOrderQty: z.number().int().optional(),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  discount: z.number().min(0).max(100).optional(),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  icon: z.string().url('Invalid image URL').or(z.string().emoji()),
  order: z.number().int().min(0),
});

// Seller Registration Schema
export const sellerRegistrationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  businessType: z.enum(['manufacturer', 'distributor', 'wholesaler', 'farmer']),
  brandNames: z.string().optional(),
  cities: z.string().min(1, 'Cities are required'),
});

// Order Schema
export const orderSchema = z.object({
  deliveryAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
  paymentMethod: z.enum(['cod', 'online', 'wallet']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SellerProductFormData = z.infer<typeof sellerProductSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type SellerRegistrationFormData = z.infer<typeof sellerRegistrationSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
