"use client";
import { useState } from "react";

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("About us");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const tabs = ["About us", "Order related", "Refund related", "Account related", "Payment related"];

  const faqs = {
    "About us": [
      { q: "What is Hyperpure by Zomato?", a: "Hyperpure is a B2B platform by Zomato that supplies high-quality ingredients to restaurants, cloud kitchens, and food businesses." },
      { q: "What makes Hyperpure different from other suppliers?", a: "We offer farm-to-fork traceability, quality assurance, next-day delivery, and competitive pricing with no middlemen." },
      { q: "How can Hyperpure help me expand my menu?", a: "We provide access to 4000+ products across 20+ categories, enabling you to experiment with new dishes and ingredients." },
      { q: "Is Hyperpure committed to sustainability?", a: "Yes, we work directly with farmers, use EV fleet trucks, and maintain solar-powered warehouses to reduce our carbon footprint." },
      { q: "Does Hyperpure supply to home chefs/small businesses/caterers?", a: "Yes, we cater to restaurants, cloud kitchens, cafes, caterers, and small food businesses." }
    ]
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Frequently asked questions</h2>
        
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {faqs[activeTab as keyof typeof faqs]?.map((faq, idx) => (
            <div key={idx} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-semibold pr-4 text-gray-900">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  openIndex === idx ? "bg-red-500 rotate-180" : ""
                }`}>
                  <svg
                    className={`w-5 h-5 transition-colors ${openIndex === idx ? "text-white" : "text-gray-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
