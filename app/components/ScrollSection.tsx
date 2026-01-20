'use client';

import { useEffect, useRef, useState } from 'react';

const sections = [
  {
    id: 'kitchen',
    title: 'Kitchen Supplies',
    heading: 'Premium Kitchen Equipment',
    description: 'Professional-grade supplies for your culinary needs',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=1080&fit=crop'
  },
  {
    id: 'menu',
    title: 'Menu Innovations',
    heading: 'Innovative Menu Solutions',
    description: 'Fresh ingredients to inspire your next signature dish',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop'
  },
  {
    id: 'supply',
    title: 'Supply Chain Solutions',
    heading: 'Reliable Supply Chain',
    description: 'Seamless delivery and inventory management',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=1080&fit=crop'
  }
];

export default function ScrollSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollLeft = containerRef.current.scrollLeft;
      const sectionWidth = window.innerWidth;
      const index = Math.round(scrollLeft / sectionWidth);
      setActiveIndex(Math.min(Math.max(index, 0), sections.length - 1));
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev < sections.length - 1 ? prev + 1 : 0;
        scrollToSection(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (index: number) => {
    containerRef.current?.scrollTo({
      left: index * window.innerWidth,
      behavior: 'smooth'
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = activeIndex > 0 ? activeIndex - 1 : sections.length - 1;
    setActiveIndex(newIndex);
    scrollToSection(newIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = activeIndex < sections.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    scrollToSection(newIndex);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center z-20">
        <span className="text-5xl leading-none -mt-1">‹</span>
      </button>
      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center z-20">
        <span className="text-5xl leading-none -mt-1">›</span>
      </button>

      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-2 flex gap-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className={`px-5 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
              activeIndex === index ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="h-screen overflow-x-scroll snap-x snap-mandatory flex"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sections.map((section) => (
          <div key={section.id} className="min-w-full h-screen snap-start relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${section.image})` }}>
              <div className="absolute inset-0 bg-black/40" />
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl">
              <h2 className="text-6xl font-bold mb-6">{section.heading}</h2>
              <p className="text-2xl mb-8 text-gray-200">{section.description}</p>
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Explore Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
