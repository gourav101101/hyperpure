"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-20 px-6 bg-[#FFF0F0] rounded-t-[80px] relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-16 gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-red-400 to-red-500 flex-1 max-w-xs"></div>
          <h2 className="text-2xl font-bold text-red-500 tracking-wider">OUR CATEGORIES</h2>
          <div className="h-px bg-gradient-to-l from-transparent via-red-400 to-red-500 flex-1 max-w-xs"></div>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          {categories.map((cat: any) => (
            <Link key={cat._id || cat.id} href={`/catalogue?category=${encodeURIComponent(cat.name)}`} className="bg-white rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group w-[calc((100%-6*1.5rem)/7)] min-w-[140px]">
              <div className="mb-4 group-hover:scale-110 transition-transform flex items-center justify-center h-16">
                {cat.icon && (cat.icon.includes('http') || cat.icon.includes('cloudinary')) ? (
                  <img 
                    src={cat.icon} 
                    alt={cat.name} 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <div className="text-5xl">{cat.icon}</div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-center text-gray-800 leading-tight">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
