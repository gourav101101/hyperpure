"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";

export default function FAQPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("About us");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const categories = ["About us", "Order related", "Refund related", "Account related", "Payment related"];

  const faqs = {
    "About us": [
      { q: "What is Hyperpure by Zomato?", a: "Hyperpure is Zomato's B2B supply chain platform that delivers high-quality ingredients to restaurants and food businesses." },
      { q: "What makes Hyperpure different from other suppliers?", a: "We ensure quality through rigorous checks, provide next-day delivery, and offer competitive pricing with transparent sourcing." },
      { q: "How can Hyperpure help me expand my menu?", a: "We offer a wide range of ingredients and products that can help you diversify your menu offerings." },
      { q: "Is Hyperpure committed to sustainability?", a: "Yes, we focus on sustainable sourcing and reducing food waste throughout our supply chain." },
      { q: "Does Hyperpure supply to home chefs/small businesses/caterers?", a: "Yes, we serve restaurants, cafes, cloud kitchens, caterers, and small food businesses." }
    ],
    "Order related": [
      { q: "How do I place an order?", a: "Browse our catalogue, add items to cart, and checkout. Orders placed before cutoff time are delivered next day." },
      { q: "What is the minimum order value?", a: "Minimum order value varies by location. Check your area for specific details." },
      { q: "Can I modify my order after placing it?", a: "Orders can be modified within 2 hours of placement. Contact support for assistance." }
    ],
    "Refund related": [
      { q: "What is your refund policy?", a: "We offer full refunds for quality issues or incorrect items delivered." },
      { q: "How long does it take to process refunds?", a: "Refunds are processed within 5-7 business days after verification." }
    ],
    "Account related": [
      { q: "How do I create an account?", a: "Click on Login/Signup and follow the registration process with your business details." },
      { q: "Can I have multiple delivery addresses?", a: "Yes, you can add and manage multiple delivery addresses in your account." }
    ],
    "Payment related": [
      { q: "What payment methods do you accept?", a: "We accept credit/debit cards, UPI, net banking, and offer credit terms for eligible businesses." },
      { q: "Do you offer credit facilities?", a: "Yes, credit facilities are available for verified businesses after assessment." }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Frequently asked questions</h1>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  activeCategory === cat
                    ? 'bg-red-100 text-red-600 border-2 border-red-500'
                    : 'bg-white text-gray-700 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {faqs[activeCategory as keyof typeof faqs].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-medium">{faq.q}</span>
                  <svg
                    className={`w-6 h-6 transition-transform ${openQuestion === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openQuestion === idx && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
}
