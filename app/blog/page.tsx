"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data.filter((b: any) => b.published));
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="text-6xl font-bold mb-2">Blog</h1>
            <div className="w-24 h-1 bg-blue-500"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blog/${blog._id}`} className="group cursor-pointer">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-gray-500 text-sm mb-3">{blog.category}</p>
                <h2 className="text-2xl font-bold mb-6 leading-tight group-hover:text-red-500 transition-colors">
                  {blog.title}
                </h2>
                <div className="text-gray-500 text-sm space-y-1">
                  <p>{blog.author} | {blog.date}</p>
                  <p>{blog.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
