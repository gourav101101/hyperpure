"use client";
import Image from 'next/image';

export default function ImageDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🖼️</div>
          <h1 className="text-4xl font-bold text-white mb-2">Next.js Image Optimization</h1>
          <p className="text-white/80">Automatic image optimization & lazy loading</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before - Regular img tag */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-red-600">❌ Before (img tag)</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-700 space-y-1">
                <div>• No optimization</div>
                <div>• No lazy loading</div>
                <div>• No responsive images</div>
                <div>• Slow page load</div>
              </div>
            </div>
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" 
                alt="Food"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Full size loaded: ~800KB
            </div>
          </div>

          {/* After - Next.js Image */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ After (Image component)</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-green-700 space-y-1">
                <div>• Auto optimization</div>
                <div>• Lazy loading</div>
                <div>• Responsive images</div>
                <div>• Fast page load</div>
              </div>
            </div>
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" 
                alt="Food"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Optimized size: ~50KB (94% smaller!)
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">📸 Image Examples</h3>
          
          <div className="space-y-6">
            {/* Fixed Size */}
            <div>
              <h4 className="font-bold mb-2">1. Fixed Size Image</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"
                  alt="Food"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <pre className="mt-2 bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`<Image 
  src="/image.jpg"
  width={400}
  height={300}
  alt="Food"
/>`}
              </pre>
            </div>

            {/* Responsive Fill */}
            <div>
              <h4 className="font-bold mb-2">2. Responsive Fill Container</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800"
                    alt="Food"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </div>
              <pre className="mt-2 bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`<div className="relative h-64">
  <Image 
    src="/image.jpg"
    fill
    className="object-cover"
    sizes="100vw"
  />
</div>`}
              </pre>
            </div>

            {/* Priority Loading */}
            <div>
              <h4 className="font-bold mb-2">3. Priority Loading (Above Fold)</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"
                  alt="Food"
                  width={600}
                  height={400}
                  priority
                  className="rounded-lg"
                />
              </div>
              <pre className="mt-2 bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`<Image 
  src="/hero.jpg"
  width={600}
  height={400}
  priority // No lazy loading
  alt="Hero"
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-4">✨ Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold text-sm">Auto WebP</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-semibold text-sm">Responsive</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-sm">Lazy Load</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl mb-2">🚀</div>
              <div className="font-semibold text-sm">CDN Ready</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600">94%</div>
            <div className="text-sm text-gray-600">Size Reduction</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600">3x</div>
            <div className="text-sm text-gray-600">Faster Load</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600">Auto</div>
            <div className="text-sm text-gray-600">Optimization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
