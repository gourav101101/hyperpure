"use client";
import { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import ConfirmModal from "../components/ConfirmModal";

interface ContentBlock {
  id: string;
  type: "heading" | "paragraph" | "image" | "subheading";
  content: string;
}

interface Blog {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featuredImage: string;
  blocks: ContentBlock[];
  published: boolean;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, blogId: number | null}>({isOpen: false, blogId: null});

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const res = await fetch('/api/blogs');
    const data = await res.json();
    setBlogs(data.map((d: any) => ({ ...d, id: d._id })));
  };

  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Company",
    author: "Hyperpure Team",
    readTime: "",
    featuredImage: "",
    published: false
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: ""
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === "up" && index > 0) || (direction === "down" && index < blocks.length - 1)) {
      const newBlocks = [...blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      category: "Company",
      author: "Hyperpure Team",
      readTime: "",
      featuredImage: "",
      published: false
    });
    setBlocks([]);
    setShowForm(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      category: blog.category,
      author: blog.author,
      readTime: blog.readTime,
      featuredImage: blog.featuredImage,
      published: blog.published
    });
    setBlocks(blog.blocks);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({isOpen: true, blogId: id});
  };

  const confirmDelete = async () => {
    if (deleteConfirm.blogId) {
      await fetch(`/api/blogs?id=${deleteConfirm.blogId}`, { method: 'DELETE' });
      fetchBlogs();
    }
    setDeleteConfirm({isOpen: false, blogId: null});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      blocks,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    if (editingBlog) {
      await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBlog.id, ...data })
      });
    } else {
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setShowForm(false);
    fetchBlogs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-[73px]">
        <AdminSidebar />
        <main className="flex-1 p-8 ml-64">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
              <p className="text-sm text-gray-600 mt-0.5">{blogs.length} blog posts</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-600 flex items-center gap-2"
            >
              <span>+</span> Create Blog
            </button>
          </div>

          {showForm ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Blog Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option>Company</option>
                        <option>Community</option>
                        <option>Product</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Read Time</label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                        placeholder="5 mins read"
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Image URL *</label>
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pub"
                      checked={formData.published}
                      onChange={(e) => setFormData({...formData, published: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="pub" className="text-sm font-medium">Publish</label>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-bold mb-3">Add Content Blocks</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => addBlock("heading")} className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium">
                        + Heading
                      </button>
                      <button type="button" onClick={() => addBlock("subheading")} className="px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium">
                        + Subheading
                      </button>
                      <button type="button" onClick={() => addBlock("paragraph")} className="px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium">
                        + Paragraph
                      </button>
                      <button type="button" onClick={() => addBlock("image")} className="px-3 py-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 text-sm font-medium">
                        + Image
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600">
                      {editingBlog ? "Update" : "Create"}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-h-[calc(100vh-150px)] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Content Blocks</h2>
                <div className="space-y-4">
                  {blocks.map((block, idx) => (
                    <div key={block.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase text-gray-500">{block.type}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => moveBlock(block.id, "up")} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                          <button type="button" onClick={() => moveBlock(block.id, "down")} disabled={idx === blocks.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                          <button type="button" onClick={() => deleteBlock(block.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                        </div>
                      </div>
                      {block.type === "image" ? (
                        <input
                          type="url"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Image URL"
                          className="w-full px-3 py-2 border rounded"
                        />
                      ) : block.type === "heading" ? (
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Heading text"
                          className="w-full px-3 py-2 border rounded font-bold text-lg"
                        />
                      ) : block.type === "subheading" ? (
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Subheading text"
                          className="w-full px-3 py-2 border rounded font-semibold"
                        />
                      ) : (
                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          placeholder="Paragraph text"
                          rows={3}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No content blocks yet. Add some using the buttons on the left.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-4">
                    <img src={blog.featuredImage} alt={blog.title} className="w-40 h-28 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-500 uppercase font-medium">{blog.category}</span>
                          <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{blog.title}</h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ml-3 flex-shrink-0 ${
                          blog.published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {blog.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{blog.author} • {blog.date} • {blog.readTime}</p>
                      <p className="text-xs text-gray-500 mb-3">{blog.blocks.length} content blocks</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({isOpen: false, blogId: null})}
        type="danger"
      />
    </div>
  );
}
