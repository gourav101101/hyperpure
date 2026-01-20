export default function DeliveryModels() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Our delivery models</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          We offer flexible delivery options tailored to your needs—whether it's next-day restocking, urgent same-day supplies, or specialty products.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#B85A57] to-[#A04844] rounded-3xl overflow-hidden text-white">
            <div className="p-8">
              <h3 className="text-3xl font-bold mb-2">Wholesale</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-white/50 w-6"></div>
                <span className="text-xs font-semibold">NEXT DAY</span>
                <div className="h-px bg-white/50 w-6"></div>
              </div>
              <p className="mb-4">Delivery for your planned needs</p>
            </div>
            <img src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&h=300&fit=crop" alt="Wholesale" className="w-full h-40 object-cover" />
          </div>

          <div className="bg-gradient-to-br from-[#6B5B95] to-[#5A4A85] rounded-3xl overflow-hidden text-white">
            <div className="p-8">
              <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <span className="text-yellow-400">⚡</span> EXPRESS
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-white/50 w-6"></div>
                <span className="text-xs font-semibold">IN HOURS</span>
                <div className="h-px bg-white/50 w-6"></div>
              </div>
              <p className="mb-4">Delivery for last-minute, unplanned needs</p>
            </div>
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=300&fit=crop" alt="Express" className="w-full h-40 object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
