export default function Features() {
  const features = [
    { title: "Quality Assured", desc: "100% quality checked products" },
    { title: "Fast Delivery", desc: "Next-day delivery guaranteed" },
    { title: "Best Prices", desc: "Competitive wholesale pricing" },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((f) => (
          <div key={f.title} className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
