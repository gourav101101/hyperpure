"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useParams } from "next/navigation";

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const res = await fetch(`/api/blogs?id=${params.id}`);
      const data = await res.json();
      setBlog(data);
    };
    fetchBlog();
  }, [params.id]);

  if (!blog) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-gray-500 text-sm mb-4">{blog.category}</p>
            <h1 className="text-5xl font-bold mb-6">{blog.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>{blog.author}</span>
              <span>•</span>
              <span>{blog.date}</span>
              <span>•</span>
              <span>{blog.readTime}</span>
            </div>
          </div>

          <div className="space-y-6">
            {blog.blocks?.map((block: any) => {
              if (block.type === "image") {
                return <img key={block.id} src={block.content} alt="" className="w-full rounded-lg" />;
              }
              if (block.type === "heading") {
                return <h2 key={block.id} className="text-3xl font-bold mt-8">{block.content}</h2>;
              }
              if (block.type === "subheading") {
                return <h3 key={block.id} className="text-xl font-semibold mt-6">{block.content}</h3>;
              }
              return <p key={block.id} className="text-lg text-gray-700 leading-relaxed">{block.content}</p>;
            })}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
