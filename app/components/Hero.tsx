"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const slides = [
    {
      title: "All your restaurant needs delivered instantly",
      subtitle: "20+ categories • 4000+ products",
      tabs: ["Kitchen Supplies", "Menu Innovations", "Supply Chain Solutions"]
    },
    {
      title: "Fresh ingredients for your kitchen",
      subtitle: "Quality assured • Farm to table",
      tabs: ["Kitchen Supplies", "Menu Innovations", "Supply Chain Solutions"]
    },
    {
      title: "Premium quality at best prices",
      subtitle: "Trusted by 10,000+ restaurants",
      tabs: ["Kitchen Supplies", "Menu Innovations", "Supply Chain Solutions"]
    }
  ];

  const [current, setCurrent] = useState(slides.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const extendedSlides = [...slides, ...slides, ...slides];

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrent(prev => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrent(prev => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (current >= slides.length * 2) {
      setIsTransitioning(false);
      setCurrent(slides.length);
    } else if (current < slides.length) {
      setIsTransitioning(false);
      setCurrent(slides.length + current);
    }
  };

  return (
    <section className="relative pt-20 h-[600px] overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1600')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div 
        className="relative z-10 h-full flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
          width: `${extendedSlides.length * 100}%`
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, idx) => (
          <div key={idx} className="w-full flex-shrink-0 flex flex-col items-center justify-center text-white px-6">
            <div className="bg-white/90 rounded-full px-2 py-2 mb-8 flex gap-2">
              {slide.tabs.map((tab) => (
                <button key={tab} className="px-6 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100">
                  {tab}
                </button>
              ))}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 max-w-4xl">
              {slide.title}
            </h1>
            <p className="text-xl mb-8">{slide.subtitle}</p>
            <button className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 font-medium">
              Shop now
            </button>
          </div>
        ))}
      </div>
      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 z-20">
        ‹
      </button>
      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 z-20">
        ›
      </button>
    </section>
  );
}
