"use client";
import { useEffect, useState } from "react";

export default function Sustainability() {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Farmer empowerment",
      description: "Empowering farmers through fair pricing, shared data, and transparent payouts",
      img: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=500&fit=crop"
    },
    {
      title: "Meet the women at our warehouses",
      description: "Empowering women in our workforce",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop"
    },
    {
      title: "EV fleet trucks and solar powered warehouses",
      description: "reducing carbon footprint and driving the shift to clean energy",
      img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=500&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const getPrevIndex = () => (activeIndex - 1 + slides.length) % slides.length;
  const getNextIndex = () => (activeIndex + 1) % slides.length;

  return (
    <section id="sustainability-section" className="py-20 px-6 bg-gradient-to-br from-[#8BC34A] to-[#7CB342] rounded-[60px] mx-6 my-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-gray-900">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Sustainability goes beyond the environment
            </h2>
            <p className="text-xl">
              For Hyperpure—it's at the core of our operations, shaping every decision we make, every day
            </p>
          </div>

          <div className="relative h-[500px] flex items-center justify-center">
            {/* Previous card (left half) */}
            <div 
              key={`prev-${activeIndex}`}
              className="absolute left-0 w-1/3 h-[400px] opacity-50 scale-90 transition-all duration-1000 ease-in-out"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl h-full">
                <img src={slides[getPrevIndex()].img} alt="" className="w-full h-2/3 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{slides[getPrevIndex()].title}</h3>
                </div>
              </div>
            </div>

            {/* Active card (center full) */}
            <div 
              key={`active-${activeIndex}`}
              className="relative z-10 w-2/3 h-[450px] transition-all duration-1000 ease-in-out"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl h-full">
                <img src={slides[activeIndex].img} alt={slides[activeIndex].title} className="w-full h-2/3 object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{slides[activeIndex].title}</h3>
                  <p className="text-gray-600">{slides[activeIndex].description}</p>
                </div>
              </div>
            </div>

            {/* Next card (right half) */}
            <div 
              key={`next-${activeIndex}`}
              className="absolute right-0 w-1/3 h-[400px] opacity-50 scale-90 transition-all duration-1000 ease-in-out"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl h-full">
                <img src={slides[getNextIndex()].img} alt="" className="w-full h-2/3 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{slides[getNextIndex()].title}</h3>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <span className="text-2xl text-gray-700">‹</span>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <span className="text-2xl text-gray-700">›</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
