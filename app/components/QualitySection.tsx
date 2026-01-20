"use client";
import { useEffect, useState } from "react";

export default function QualitySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      icon: "🤝",
      title: "Farm collection centres",
      description: "We source directly from farmers, select the best produce at our collection centres, and deliver it fresh to your doorstep.",
      notes: ["Pan India farm network", "No middleman", "Sorted & graded produce"],
      video: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800"
    },
    {
      icon: "🏭",
      title: "State-of-the-art food park",
      description: "Our modern food processing facilities ensure the highest quality standards and food safety compliance.",
      notes: ["Advanced processing", "Quality control", "Hygiene certified"],
      video: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"
    },
    {
      icon: "✓",
      title: "Food safety compliant warehouse",
      description: "Temperature-controlled storage facilities that maintain product freshness and quality throughout the supply chain.",
      notes: ["Temperature controlled", "FSSAI certified", "Regular audits"],
      video: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800"
    },
    {
      icon: "❄️",
      title: "Frozen supply chain",
      description: "End-to-end cold chain infrastructure ensuring frozen products maintain optimal quality from source to delivery.",
      notes: ["Cold chain network", "Zero breaks", "Quality assured"],
      video: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            { num: "115+", text: "cities we're active in" },
            { num: "1 Lakh+", text: "partners trust us" },
            { num: "1.1 Crore+", text: "orders delivered" },
            { num: "600+", text: "seller brands listed" }
          ].map((stat) => (
            <div key={stat.text} className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">{stat.num}</div>
              <div className="text-gray-700">{stat.text}</div>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-red-500">✦ Quality at every step ✦</span>
          </h2>
          <div className="text-xl font-semibold">— Built on trust —</div>
        </div>

        <div id="quality-section" className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border-l-4 ${
                  activeIndex === idx
                    ? "bg-white shadow-lg border-red-500"
                    : "bg-white/50 border-transparent hover:bg-white/80"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <h3 className={`text-xl font-bold ${activeIndex === idx ? "text-black" : "text-gray-500"}`}>
                    {feature.title}
                  </h3>
                </div>
                {activeIndex === idx && (
                  <p className="text-gray-600 mt-3 animate-fadeIn">{feature.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              {features.map((feature, idx) => (
                <img
                  key={idx}
                  src={feature.video}
                  alt={feature.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    activeIndex === idx ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs border-t-4 border-red-500 animate-slideUp" style={{ transform: 'rotate(-2deg)' }} key={activeIndex}>
              <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              {features[activeIndex].notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="text-red-500 font-bold text-sm">0{idx + 1}</span>
                  <span className="text-gray-700 text-sm font-medium">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
