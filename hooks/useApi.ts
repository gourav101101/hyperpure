import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';

// Zod schemas for API validation
const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number().optional(),
  category: z.string(),
  images: z.array(z.string()),
  veg: z.boolean(),
});

const categorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  icon: z.string(),
  order: z.number(),
});

const orderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  items: z.array(z.any()),
  totalAmount: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

// Products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      return z.array(productSchema).parse(data);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      return productSchema.parse(data);
    },
    enabled: !!id,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: any) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to add product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added!');
    },
    onError: () => {
      toast.error('Failed to add product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted!');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      return z.array(categorySchema).parse(data);
    },
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: any) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error('Failed to add category');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added!');
    },
    onError: () => {
      toast.error('Failed to add category');
    },
  });
}

// Orders
export function useOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${userId}`);
      const data = await res.json();
      return z.array(orderSchema).parse(data.orders);
    },
    enabled: !!userId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: any) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed!');
    },
    onError: () => {
      toast.error('Failed to place order');
    },
  });
}

// Sellers
export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/sellers');
      return res.json();
    },
  });
}

export function useApproveSeller() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Failed to update seller');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast.success('Seller updated!');
    },
    onError: () => {
      toast.error('Failed to update seller');
    },
  });
}
