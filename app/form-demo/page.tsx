"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, sellerProductSchema, loginSchema, ProductFormData, SellerProductFormData, LoginFormData } from '@/lib/schemas';
import { Input, Select, Textarea } from '@/components/forms/FormFields';
import { toast } from 'sonner';
import { useState } from 'react';

export default function FormDemo() {
  const [activeForm, setActiveForm] = useState<'login' | 'product' | 'sellerProduct'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-4xl font-bold text-white mb-2">React Hook Form + Zod</h1>
          <p className="text-white/80">Type-safe form validation</p>
        </div>

        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setActiveForm('login')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeForm === 'login' ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
          >
            Login Form
          </button>
          <button
            onClick={() => setActiveForm('product')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeForm === 'product' ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
          >
            Product Form
          </button>
          <button
            onClick={() => setActiveForm('sellerProduct')}
            className={`px-6 py-2 rounded-lg font-semibold ${activeForm === 'sellerProduct' ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
          >
            Seller Product
          </button>
        </div>

        {activeForm === 'login' && <LoginForm />}
        {activeForm === 'product' && <ProductForm />}
        {activeForm === 'sellerProduct' && <SellerProductForm />}
      </div>
    </div>
  );
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    toast.success('Login form validated! ✅');
    console.log(data);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6">Login Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Phone Number"
          name="phone"
          placeholder="9876543210"
          register={register}
          error={errors.phone}
          required
        />
        <Input
          label="OTP"
          name="otp"
          placeholder="123456"
          register={register}
          error={errors.otp}
        />
        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
          Submit
        </button>
      </form>
    </div>
  );
}

function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = (data: ProductFormData) => {
    toast.success('Product form validated! ✅');
    console.log(data);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6">Product Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Product Name"
          name="name"
          placeholder="Fresh Tomatoes"
          register={register}
          error={errors.name}
          required
        />
        <Select
          label="Unit Type"
          name="unitType"
          options={[
            { value: 'Weight', label: 'Weight (kg, g)' },
            { value: 'Volume', label: 'Volume (L, ml)' },
            { value: 'Piece', label: 'Piece (pc)' },
            { value: 'Pack', label: 'Pack (pack)' },
          ]}
          register={register}
          error={errors.unitType}
          required
        />
        <Input
          label="Category"
          name="category"
          placeholder="Vegetables"
          register={register}
          error={errors.category}
          required
        />
        <Input
          label="Subcategory"
          name="subcategory"
          placeholder="Fresh Vegetables"
          register={register}
          error={errors.subcategory}
          required
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="Fresh organic tomatoes..."
          register={register}
          error={errors.description}
          required
        />
        <Input
          label="SKU"
          name="sku"
          placeholder="TOM-001"
          register={register}
          error={errors.sku}
        />
        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
          Submit
        </button>
      </form>
    </div>
  );
}

function SellerProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(sellerProductSchema),
  });

  const onSubmit = (data: SellerProductFormData) => {
    toast.success('Seller product form validated! ✅');
    console.log(data);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6">Seller Product Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            name="sellerPrice"
            type="number"
            placeholder="50"
            register={register}
            error={errors.sellerPrice}
            required
          />
          <Input
            label="Unit Value"
            name="unitValue"
            type="number"
            placeholder="1"
            register={register}
            error={errors.unitValue}
            required
          />
        </div>
        <Input
          label="Unit Measure"
          name="unitMeasure"
          placeholder="kg"
          register={register}
          error={errors.unitMeasure}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock"
            name="stock"
            type="number"
            placeholder="100"
            register={register}
            error={errors.stock}
            required
          />
          <Input
            label="Min Order Qty"
            name="minOrderQty"
            type="number"
            placeholder="1"
            register={register}
            error={errors.minOrderQty}
            required
          />
        </div>
        <Input
          label="Delivery Time"
          name="deliveryTime"
          placeholder="24 hours"
          register={register}
          error={errors.deliveryTime}
          required
        />
        <Input
          label="Discount (%)"
          name="discount"
          type="number"
          placeholder="0"
          register={register}
          error={errors.discount}
        />
        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600">
          Submit
        </button>
      </form>
    </div>
  );
}
