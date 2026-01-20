import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RegisterBusiness() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24">
        <div className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white pb-24 pt-12 rounded-b-[80px]">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Verify<br/>as a registered business</h1>
              <div className="mt-8 w-64 h-10 bg-white/10 rounded-full"></div>
            </div>
            <div className="hidden md:block w-56 h-56">
              <div className="w-full h-full bg-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-6xl">🏬</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 shadow-lg">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow text-4xl">🏪</div>
              </div>
              <h3 className="text-center text-2xl font-bold mb-4">Restaurant details</h3>
              <p className="text-center text-gray-500 mb-6">Add your restaurant information to get started.</p>
              <div className="flex justify-center">
                <button className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600">Add</button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow text-4xl mb-6">📁</div>
              <h3 className="text-center text-2xl font-semibold text-gray-700 mb-4">Verify GST or FSSAI</h3>
              <p className="text-center text-gray-500 mb-6">Upload or verify your business registrations.</p>
              <div>
                <button disabled className="bg-gray-100 text-gray-400 rounded-full p-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3M12 11v10" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
