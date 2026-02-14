"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  images: string[];
  veg: boolean;
  inStock: boolean;
}

interface ProductShowcaseProps {
  showAll?: boolean;
}

export default function ProductShowcase({ showAll = false }: ProductShowcaseProps) {
  const [productsByCategory, setProductsByCategory] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, productsRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' })
        ]);
        
        const cats = catsRes.ok ? await catsRes.json() : [];
        const products = productsRes.ok ? await productsRes.json() : [];
        
        setCategories(Array.isArray(cats) ? cats : []);
        
        const grouped = cats.slice(0, showAll ? cats.length : 3).map((cat: any) => ({
          id: cat._id,
          icon: cat.icon,
          title: cat.name,
          subtitle: "handpicked quality",
          products: products.filter((p: any) => p.category === cat.name).slice(0, 4)
        }));
        
        setProductsByCategory(grouped);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategories([]);
        setProductsByCategory([]);
      }
    };
    fetchData();
  }, [showAll]);

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto space-y-16">
        {productsByCategory.map((section) => (
          <div key={section.id || section.title}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {section.icon && (section.icon.includes('http') || section.icon.includes('cloudinary')) ? (
                    <img src={section.icon} alt={section.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{section.icon}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-gray-500">{section.subtitle}</p>
                </div>
              </div>
              <button className="text-red-500 font-semibold">See all</button>
            </div>

            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {section.products.map((product: Product) => (
                  <Link key={product.id || product._id} href={`/catalogue/${product._id || product.id}`}>
                    <div className={`min-w-[300px] bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer ${!product.inStock ? 'opacity-70' : ''}`}>
                      <div className="relative mb-4">
                        <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-xl" />
                        <div className={`absolute top-3 left-3 w-6 h-6 border-2 ${product.veg ? 'border-green-600' : 'border-red-600'} rounded flex items-center justify-center bg-white`}>
                          <div className={`w-3 h-3 ${product.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></div>
                        </div>
                        {!product.inStock && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs">Out of Stock</div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 min-h-[48px]">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-8">{product.unit}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${product.inStock ? 'text-gray-900' : 'text-gray-400'}`}>₹{product.price}</div>
                        </div>
                        {product.inStock ? (
                          <button className="border-2 border-red-500 text-red-500 px-6 py-2 rounded-xl font-bold">
                            ADD <span className="text-lg">+</span>
                          </button>
                        ) : (
                          <button className="border-2 border-orange-500 text-orange-600 px-6 py-2 rounded-xl font-bold">
                            NOTIFY
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
