"use client";
import { useState, useEffect, useRef } from "react";

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    { name: "Pista House", role: "Founder", person: "Mohd Abdul Majeed", quote: "...ability to meet our heightened demands without compromise...", color: "from-[#3F51B5] to-[#303F9F]", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop" },
    { name: "Harley's Fine Baking", role: "CEO", person: "Suresh Naik", quote: "...an invaluable partner in our expansion across multiple cities...", color: "from-[#F06292] to-[#EC407A]", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" },
    { name: "Blue Tokai Coffee Roasters", role: "Co-Founder", person: "Shivam Shahi", quote: "...consistent supply of high-quality ingredients, reducing wastage and stockouts...", color: "from-[#4DB6AC] to-[#26A69A]", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop" },
    { name: "Social Eats", role: "Founder", person: "Ravi Kumar", quote: "...enabled platform for our entire operations seamlessly...", color: "from-[#AB47BC] to-[#8E24AA]", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop" },
    { name: "Mad Momos", role: "Founder & CEO", person: "Amit Singh", quote: "...achieved a 15% reduction in purchasing costs...", color: "from-[#8BC34A] to-[#7CB342]", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop" },
    { name: "The Pizza Bakery", role: "Founder", person: "Rajesh Mehta", quote: "...their service has never let us down with on-time deliveries...", color: "from-[#FF7043] to-[#F4511E]", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop" },
  ];

  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const interval = setInterval(() => {
      if (scrollContainer.scrollLeft >= (testimonials.length * 326)) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollBy({ left: 326, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft -= 326;
    }
  };

  const handleNext = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft += 326;
    }
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold">Stories from partners</h2>
        </div>
        
        <div className="relative">
          <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
            <span className="text-gray-700 text-2xl font-light">‹</span>
          </button>
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50">
            <span className="text-gray-700 text-2xl font-light">›</span>
          </button>

          <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-2" style={{scrollSnapType: 'none'}}>
            {duplicatedTestimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className={`min-w-[320px] bg-gradient-to-br ${testimonial.color} rounded-3xl overflow-hidden text-white relative cursor-pointer group shadow-xl transition-all duration-300 snap-center`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative h-[420px] p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xl">🏪</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-xs opacity-90">{testimonial.role}</p>
                    </div>
                  </div>

                  <p className="text-lg font-light leading-relaxed mb-auto">{testimonial.quote}</p>

                  <div className="relative mt-auto">
                    <img 
                      src={testimonial.img} 
                      alt={testimonial.person} 
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${testimonial.color} transition-opacity duration-300 rounded-2xl ${
                      hoveredIndex === idx ? 'opacity-0' : 'opacity-60'
                    }`}></div>
                    <div className={`absolute bottom-4 left-4 transition-all duration-300 ${
                      hoveredIndex === idx ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                    }`}>
                      <h4 className="text-2xl font-bold opacity-40 leading-tight">{testimonial.person}</h4>
                    </div>
                    <button className={`absolute bottom-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 transition-all duration-300 ${
                      hoveredIndex === idx ? 'scale-110 bg-black/50' : 'scale-100'
                    }`}>
                      <span className="text-xl font-light">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
